import {PostHog} from "posthog-node"

// biome-ignore lint/style/noNonNullAssertion: let it throw
export const postHog = new PostHog(process.env.POSTHOG_KEY!, {
	// biome-ignore lint/style/noNonNullAssertion: let it throw
	host: process.env.POSTHOG_HOST!,
})
