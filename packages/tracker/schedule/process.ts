import {api} from "@zerota/db/convex/_generated/api"
import {Config, Console, Duration, Effect, Queue, Schedule} from "effect"
import {getAnilistActivities} from "../../providers/anilist"
import {http} from "../http"
import {AnilistQueue} from "./schedule"

export const processSubscribedUsers = Effect.gen(function* () {
	const queue = yield* AnilistQueue

	const delayMs = yield* Config.number("ANILIST_QUEUE_DELAY_MS")
	const duration = Duration.millis(delayMs)
	const schedule = Schedule.fixed(duration)

	const action = Effect.gen(function* () {
		const userId = yield* Queue.take(queue)
		const date1MonthAgo = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
		const activities = yield* Effect.tryPromise(() =>
			getAnilistActivities([userId], date1MonthAgo),
		)
		yield* Console.log(`For user: ${userId}`)
		yield* Console.log(activities.length)

		const saveAllActivities = yield* Effect.tryPromise(() =>
			Promise.all(
				activities.map(activity =>
					http.mutation(api.activity.createStatusActivity, {
						provider: "anilist",
						providerUserId: activity.providerUserId,
						// userId,
						media: {
							providerId: activity.media.providerId,
							title: activity.media.title,
							url: activity.media.url,
							posterUrl: activity.media.posterUrl,
							type: activity.media.type,
						},
						activity: {
							status: activity.status,
							progress: activity.progress,
							progressUnit: activity.progressUnit,
						},
						createdAt: activity.createdAt,
					}),
				),
			),
		).pipe(
			Effect.catchAll(error => {
				return Effect.succeed([])
			})
		)

		yield* Console.log("saved")
		yield* Console.log(saveAllActivities.length)
		yield* Console.log("post saved")
		yield* Console.log("q size", yield* Queue.size(queue))
		// yield* Effect.sleep(delayMs)
	})

	yield* Effect.repeat(action, schedule)
})
