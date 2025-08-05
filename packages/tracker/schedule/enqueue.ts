import {api} from "@zerota/db/convex/_generated/api"
import {
	Config,
	Console,
	Duration,
	Effect,
	Metric,
	Queue,
	Schedule,
} from "effect"
import {http} from "../http"
import {AnilistQueue} from "./schedule"

// async function getSubscribedUsers() {
//   const providerMap = await http.query(api.providers.listProviders)
//   return http.query(api.subscribers.listSubscribers, {
//     provider: providerMap.anilist,
//   })
// }

const subscribedUsers = Effect.gen(function* () {
	const providerMap = yield* Effect.tryPromise(() =>
		http.query(api.providers.listProviders),
	)
	const subscribers = yield* Effect.tryPromise(() =>
		http.query(api.subscribers.listSubscribers, {
			provider: providerMap.anilist,
		}),
	)
	return subscribers
})

// TODO: Why tho?
const queueMetric = Metric.gauge("anilist_queue_size")

export const enqueueSubscribedUsers = Effect.gen(function* () {
	const queue = yield* AnilistQueue
	const users = yield* subscribedUsers

	yield* Console.log(users)

	const action = Effect.forEach(users, user =>
		Queue.offer(queue, user.providerUserId),
	)
	yield* queueMetric(queue.size)

	const delayMs = yield* Config.number("ANILIST_QUEUE_DELAY_MS")
	const duration = Duration.millis(delayMs)
	const schedule = Schedule.fixed(duration)

	yield* Effect.repeat(action, schedule)
})
