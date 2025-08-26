import posthog from "posthog-js"

console.log("Analytics initialized")
posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
	// api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
	api_host: "/ingest",
	ui_host: "https://eu.posthog.com",
	defaults: "2025-05-24",
})
