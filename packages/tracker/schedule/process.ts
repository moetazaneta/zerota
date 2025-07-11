import { Config, Console, Context, Duration, Effect, Fiber, Queue, Schedule } from "effect";
import { AnilistQueue } from "./schedule";
import { getAnilistActivities } from "../../providers/anilist";

export const processSubscribedUsers = Effect.gen(function* () {
  const queue = yield* AnilistQueue;

  const delayMs = yield* Config.number("ANILIST_QUEUE_DELAY_MS")
  const duration = Duration.millis(delayMs)
  const schedule = Schedule.fixed(duration)



  const action = Effect.gen(function* () {
    const userId = yield* Queue.take(queue)
    const date1MonthAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    const activities = yield* Effect.tryPromise(() => getAnilistActivities([userId], date1MonthAgo))
    Console.log(`For user: ${userId}`)
    Console.log(activities)
    yield* Effect.sleep(delayMs)
  })

  yield* Effect.repeat(action, schedule)
})
