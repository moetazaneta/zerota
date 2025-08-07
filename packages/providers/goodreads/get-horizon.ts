import * as cheerio from "cheerio"
import {setTimeout as delay} from "timers/promises"
import {request} from "undici"

type Activity = {
	provider: "goodreads"
	media: {
		title: string
		url: string
		posterUrl: string
		type: "anime" | "manga" | "book" | "movie" | "game"
	}
	activity: {
		status:
			| "completed"
			| "inProgress"
			| "planned"
			| "dropped"
			| "onHold"
			| "repeating"
		progress: number
		progressUnit: "episode" | "chapter" | "none"
	}
	createdAt: number // epoch ms
	providerUserId: string
}

const BASE = "https://www.goodreads.com"
const USER_URL =
	"https://www.goodreads.com/review/list/95432671-artem?shelf=read&sort=date_added"

async function fetchHtml(url: string): Promise<string> {
	const res = await request(url, {
		method: "GET",
		headers: {
			"user-agent":
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
				"(KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
			accept: "text/html,application/xhtml+xml",
		},
	})
	if (res.statusCode >= 400) {
		throw new Error(`HTTP ${res.statusCode} for ${url}`)
	}
	return await res.body.text()
}

function parseProviderUserId(url: string): string {
	// e.g. https://www.goodreads.com/review/list/95432671-artem?...
	const m = url.match(/review\/list\/(\d+)-/)
	return m ? m[1] : ""
}

function parseDateToEpoch(dateStr: string | undefined): number {
	if (!dateStr) return Date.now()
	// Goodreads date format often like: "Aug 03, 2024"
	const d = new Date(dateStr)
	const t = d.getTime()
	return Number.isNaN(t) ? Date.now() : t
}

type ShelfRow = {
	title: string
	bookUrl: string
	author?: string
	dateAdded?: string
}

function extractShelfRows($: cheerio.CheerioAPI): ShelfRow[] {
	// Goodreads shelf table often has id="booksBody" rows within table#books
	const rows: ShelfRow[] = []
	const table = $("table#books")
	const tbody = table.find("tbody#booksBody")
	const trs = tbody.find("tr.bookalike.review")
	trs.each((_, el) => {
		const row = $(el)

		// Title cell: a.bookTitle
		const titleAnchor = row.find("a.bookTitle").first()
		const title = titleAnchor.text().trim()
		const href = titleAnchor.attr("href") || ""
		const bookUrl = href.startsWith("http") ? href : `${BASE}${href}`

		// Author (optional)
		const author = row.find("a.authorName").first().text().trim() || undefined

		// Date added column often has class date_added or a specific td
		// Some layouts: td.field.date_added or td.field.date_added_value
		let dateAdded =
			row.find("td.field.date_added .value").text().trim() ||
			row.find("td.date_added").text().trim() ||
			undefined

		if (dateAdded) {
			// Normalize whitespace
			dateAdded = dateAdded.replace(/\s+/g, " ").trim()
		}

		if (title && bookUrl) {
			rows.push({title, bookUrl, author, dateAdded})
		}
	})

	// Fallback if selectors differ
	if (rows.length === 0) {
		$("a.bookTitle").each((_, a) => {
			const $a = $(a)
			const title = $a.text().trim()
			const href = $a.attr("href") || ""
			const bookUrl = href.startsWith("http") ? href : `${BASE}${href}`
			if (title && bookUrl) {
				rows.push({title, bookUrl, author: undefined, dateAdded: undefined})
			}
		})
	}

	return rows
}

type BookDetails = {
	posterUrl: string
	pageCount: number | null
}

function extractBookDetails(html: string): BookDetails {
	const $ = cheerio.load(html)

	// Cover image:
	// New Goodreads sometimes uses img[data-testid="coverImage"] or img#coverImage
	const posterUrl =
		$('img[data-testid="coverImage"]').attr("src") ||
		$("#coverImage").attr("src") ||
		""

	// Page count:
	// Classic layout: span[itemprop="numberOfPages"], e.g. "352 pages"
	// New layout may have: div[data-testid="pagesFormat"] or similar
	const pageText =
		$('span[itemprop="numberOfPages"]').text().trim() ||
		$('[data-testid="pagesFormat"]').text().trim()

	let pageCount: number | null = null
	if (pageText) {
		const m = pageText.match(/(\d+)\s*pages?/i)
		if (m) {
			pageCount = parseInt(m[1], 10)
		}
	}

	return {
		posterUrl,
		pageCount,
	}
}

/**
 * Simple concurrency control for fetching book pages
 */
async function mapLimit<T, R>(
	items: T[],
	limit: number,
	worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
	const results: R[] = new Array(items.length)
	let i = 0
	const workers = new Array(Math.min(limit, items.length))
		.fill(0)
		.map(async () => {
			while (true) {
				const idx = i++
				if (idx >= items.length) break
				results[idx] = await worker(items[idx], idx)
			}
		})
	await Promise.all(workers)
	return results
}

async function scrapeGoodreadsShelf(url: string): Promise<Activity[]> {
	const providerUserId = parseProviderUserId(url)
	const html = await fetchHtml(url)
	const $ = cheerio.load(html)

	const rows = extractShelfRows($)

	// Fetch book details in parallel (limit to avoid hammering)
	const details = await mapLimit(rows, 5, async row => {
		try {
			// be polite
			await delay(150)
			const bookHtml = await fetchHtml(row.bookUrl)
			return extractBookDetails(bookHtml)
		} catch {
			return {posterUrl: "", pageCount: null}
		}
	})

	const activities: Activity[] = rows.map((row, idx) => {
		const det = details[idx] || {posterUrl: "", pageCount: null}
		const createdAt = parseDateToEpoch(row.dateAdded)
		const progress =
			typeof det.pageCount === "number" && !Number.isNaN(det.pageCount)
				? det.pageCount
				: 0

		const activity: Activity = {
			provider: "goodreads",
			media: {
				title: row.title,
				url: row.bookUrl,
				posterUrl: det.posterUrl || "",
				type: "book",
			},
			activity: {
				status: "completed",
				progress,
				progressUnit: progress > 0 ? "chapter" : "none",
			},
			createdAt,
			providerUserId: providerUserId || "",
		}
		return activity
	})

	return activities
}

export function getGoodreadsActivities(userId: string): Promise<Activity[]> {
	const url = `https://www.goodreads.com/review/list/${userId}?shelf=read&sort=date_added`
	console.log("getGoodreadsActivities", url)
	return scrapeGoodreadsShelf(url)
}
