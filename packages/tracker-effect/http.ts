import {ConvexHttpClient} from "convex/browser"

if (!process.env.CONVEX_URL) {
	throw new Error("Missing CONVEX_URL in your .env file")
}

export const http = new ConvexHttpClient(process.env.CONVEX_URL)
