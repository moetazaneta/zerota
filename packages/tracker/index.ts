import {createHTTPServer} from "@trpc/server/adapters/standalone"
import {api} from "@zerota/db/convex/_generated/api"
import cors from "cors"
import * as v from "valibot"
import {getAnilistActivities} from "./anilist"
import {http} from "./http"
import {postHog} from "./posthog"
import {anilistScheduler} from "./queue"
import {publicProcedure, router} from "./trpc"

const appRouter = router({
	fetchAnilistActivities: publicProcedure
		.input(v.object({id: v.string()}))
		.mutation(async ({input}) => {
			postHog.capture({
				event: "anilist_activities_fetched",
				distinctId: "dev",
				properties: {
					userId: input.id,
				},
			})
			console.log("for user:", input.id)
			anilistScheduler.add(input.id)
		}),
})

export type AppRouter = typeof appRouter

const server = createHTTPServer({
	middleware: cors(),
	router: appRouter,
})

server.listen(3001)

postHog.capture({
	event: "tracker_started",
	distinctId: "test-id",
})

process.on("SIGINT", async () => {
	console.log("\nShutting down tracker...")

	postHog.shutdown()

	// Wait for any in-progress operations to complete
	// Close any open connections
	// Save any pending state
	process.exit(0)
})
