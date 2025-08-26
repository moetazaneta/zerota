import type {NextConfig} from "next"

const nextConfig: NextConfig = {
	/* config options here */
	images: {
		domains: [
			"s4.anilist.co",
			"img.clerk.com",
			"s.gr-assets.com",
			"i.gr-assets.com",
			"upload.wikimedia.org",
		],
	},
	async rewrites() {
		return [
			{
				source: "/ingest/static/:path*",
				destination: "https://eu-assets.i.posthog.com/static/:path*",
			},
			{
				source: "/ingest/:path*",
				destination: "https://eu.i.posthog.com/:path*",
			},
		];
	},
	// This is required to support PostHog trailing slash API requests
	skipTrailingSlashRedirect: true,
}

export default nextConfig