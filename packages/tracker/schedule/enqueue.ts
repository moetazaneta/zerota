import {api} from "@zerota/db/convex/_generated/api"
import type {Doc} from "@zerota/db/convex/_generated/dataModel"
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
import {AnilistQueue, GoodreadsQueue} from "./schedule"

// async function getSubscribedUsers() {
//   const providerMap = await http.query(api.providers.listProviders)
//   return http.query(api.subscribers.listSubscribers, {
//     provider: providerMap.anilist,
//   })
// }

const anilistSubscribedUsers = Effect.gen(function* () {
	const providerMap = yield* Effect.tryPromise(() =>
		http.query(api.providers.listProviders),
	)
	console.log("providerMap", providerMap)
	const subscribers = yield* Effect.tryPromise(() =>
		http.query(api.subscribers.listSubscribers, {
			provider: providerMap.anilist._id,
		}),
	)
	return subscribers
})

const goodreadsSubscribedUsers = Effect.gen(function* () {
	const providerMap = yield* Effect.tryPromise(() =>
		http.query(api.providers.listProviders),
	)
	console.log("providerMap", providerMap)
	const subscribers = yield* Effect.tryPromise(() =>
		http.query(api.subscribers.listSubscribers, {
			provider: providerMap.goodreads._id,
		}),
	)
	return subscribers
})

const enqueueAnilistUsers = (users: Doc<"subscribedUsers">[]) =>
	Effect.gen(function* () {
		const queue = yield* AnilistQueue

		const action = Effect.forEach(users, user =>
			Queue.offer(queue, user.providerUserId),
		)

		const delayMs = yield* Config.number("ANILIST_QUEUE_DELAY_MS")
		const duration = Duration.millis(delayMs)
		const schedule = Schedule.fixed(duration)

		yield* Effect.repeat(action, schedule)
	})

const enqueueGoodreadsUsers = (users: Doc<"subscribedUsers">[]) =>
	Effect.gen(function* () {
		yield* Console.log("enqueueing goodreads users")
		const queue = yield* GoodreadsQueue
		yield* Console.log("goodreads queue", users[0])

		Queue.offer(queue, users[0].providerUserId)

		const action = Effect.forEach(users, user =>
			Queue.offer(queue, user.providerUserId),
		)

		const delayMs = yield* Config.number("GOODREADS_QUEUE_DELAY_MS")
		const duration = Duration.millis(delayMs)
		const schedule = Schedule.fixed(duration)

		yield* Console.log("goodreads action", delayMs)

		yield* Effect.repeat(action, schedule)

		// yield* Console.log("goodreads users enqueued")

		// const size = yield* Queue.size(queue)
		// yield* Console.log("goodreads queue size", size)
	})

export const enqueueSubscribedUsers = Effect.gen(function* () {
	const goodreadsUsers = yield* goodreadsSubscribedUsers
	yield* Console.log("goodreads users", goodreadsUsers)
	yield* enqueueGoodreadsUsers(goodreadsUsers)

	// const anilistUsers = yield* anilistSubscribedUsers
	// yield* Console.log("anilist users", anilistUsers)
	// yield* Console.log("enqueueing anilist users")
	// yield* enqueueAnilistUsers(anilistUsers)
})
