import type {Doc} from "@zerota/db/convex/_generated/dataModel"
import {Context, Effect, Fiber, Queue} from "effect"
import {enqueueSubscribedUsers} from "./enqueue"
import {processSubscribedUsers} from "./process"

export class AnilistQueue extends Context.Tag("AnilistQueue")<
	AnilistQueue,
	Queue.Queue<Doc<"subscribedUsers">["providerUserId"]>
>() {}

export class GoodreadsQueue extends Context.Tag("GoodreadsQueue")<
	GoodreadsQueue,
	Queue.Queue<Doc<"subscribedUsers">["providerUserId"]>
>() {}

const anilistQueue = Effect.scoped(
	Queue.bounded<Doc<"subscribedUsers">["providerUserId"]>(100),
)

const goodreadsQueue = Effect.scoped(
	Queue.bounded<Doc<"subscribedUsers">["providerUserId"]>(100),
)

const program = Effect.gen(function* () {
	const enqueue = yield* Effect.fork(enqueueSubscribedUsers)
	const process = yield* Effect.fork(processSubscribedUsers)

	yield* Fiber.join(enqueue)
	yield* Fiber.join(process)
})

Effect.runPromise(
	program.pipe(
		Effect.provideServiceEffect(AnilistQueue, anilistQueue),
		Effect.provideServiceEffect(GoodreadsQueue, goodreadsQueue),
	),
)
