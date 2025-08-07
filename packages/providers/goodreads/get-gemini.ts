import axios from "axios"
import * as e from "cheerio"

// Define the structure for the scraped activity data
type Activity = {
	provider: "goodreads"
	media: {
		providerId: string
		title: string
		url: string
		posterUrl: string
		type: "book"
	}
	activity: {
		status: "completed" // Since we are scraping the 'read' shelf
		progress: number
		progressUnit: "none"
	}
	createdAt: number // Unix timestamp in milliseconds
	providerUserId: string
}

/**
 * Scrapes a user's "read" shelf from Goodreads.
 * @param userId The Goodreads user ID (e.g., "95432671-artem").
 * @returns A promise that resolves to an array of activity objects.
 */
async function scrapeGoodreads(userId: string): Promise<Activity[]> {
	if (!userId) {
		throw new Error("Goodreads user ID is required.")
	}

	const url = `https://www.goodreads.com/review/list/${userId}?shelf=read&sort=date_added&per_page=100`
	console.log(`Fetching data from: ${url}`)

	try {
		// 1. Fetch the HTML content of the page
		const {data: html} = await axios.get(url, {
			// Use a common user-agent to avoid being blocked
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
			},
		})

		// 2. Load the HTML into cheerio for parsing
		const $ = e.load(html)

		const activities: Activity[] = []
		const baseUrl = "https://www.goodreads.com"

		// 3. Select each book row from the main table
		$("#books tr.bookalike.review").each((_index, element) => {
			const row = $(element)

			// Extract the raw data using selectors
			const titleElement = row.find("td.field.title a")
			const coverElement = row.find("td.field.cover img")
			const idElement = row.find("td.field.cover .tooltipTrigger")
			const dateAddedElement = row.find("td.field.date_added span")

			// Clean and format the extracted data
			const title = titleElement.attr("title")?.trim() || ""
			const providerId = idElement.attr("data-resource-id")?.trim() || ""
			const relativeUrl = titleElement.attr("href")?.trim() || ""
			const posterUrl = coverElement.attr("src")?.trim() || ""
			const dateAddedStr = dateAddedElement.text().trim()

			// Skip if essential data is missing
			if (!title || !relativeUrl || !dateAddedStr) {
				return
			}

			// 4. Parse the date and convert to a Unix timestamp (milliseconds)
			const createdAt = new Date(dateAddedStr).getTime()

			// 5. Construct the final object according to the specified format
			const activity: Activity = {
				provider: "goodreads",
				media: {
					providerId: providerId,
					title: title,
					url: `${baseUrl}${relativeUrl}`,
					posterUrl: posterUrl,
					type: "book",
				},
				activity: {
					status: "completed",
					progress: 100, // Assuming 100% progress for a completed book
					progressUnit: "none",
				},
				createdAt: createdAt,
				providerUserId: userId,
			}

			activities.push(activity)
		})

		console.log(`Successfully scraped ${activities.length} activities.`)
		console.log(activities)
		return activities
	} catch (error) {
		if (axios.isAxiosError(error)) {
			console.error(`Axios error fetching the page: ${error.message}`)
			console.error(`Status: ${error.response?.status}`)
		} else {
			console.error("An unexpected error occurred:", error)
		}
		return [] // Return an empty array on failure
	}
}

export function getGoodreadsActivities(userId: string): Promise<Activity[]> {
	return scrapeGoodreads(userId)
}
