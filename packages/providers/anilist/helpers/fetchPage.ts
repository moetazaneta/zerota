// import { env } from "@/env/env.js"
import type {ZodSchema} from "zod/v4"
import {anilistBaseUrl} from "../config.js"
import {createPageSchema} from "./page.js"
import {prettyParse} from "@zerota/utils/pretty-parse"

export async function fetchPage<T>(
	query: string,
	variables: Record<string, unknown>,
	schema: ZodSchema<T>,
	logName = "",
) {
	const response = await fetch(anilistBaseUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			query,
			variables,
		}),
	})

	// if (env.settings.showAnilistRateLimits) {
	const prefix = logName ? `[${logName}]` : ""
	console.log(
		`${prefix} rate limit remaining:`,
		response.headers.get("x-ratelimit-remaining"),
	)
	// }

	const json = await response.json()
	if ("errors" in json) {
		console.error(json)
	}
	const pageSchema = createPageSchema(schema)
	const parsed = prettyParse(json, pageSchema)
	const page = parsed.data?.Page

	return page ?? null
}
