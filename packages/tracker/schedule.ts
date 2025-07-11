import { Console, Context, Effect, Fiber, Queue, Schedule } from "effect";
import type { ProviderUser } from "./providers/types/user";

class AnilistQueue extends Context.Tag("AnilistQueue")<
  AnilistQueue,
  Queue.Queue<number>
>() {}

const anilistQueue = Queue.bounded<number>(100)

const processProgram = Effect.gen(function* () {
  yield* Console.log("Starting process program")

  const queue = yield* AnilistQueue;

  const size = yield* queue.size
  yield* Console.log(`Queue size: ${size}`)

  // const schedule = Schedule.fixed("20 seconds")
  const schedule = Schedule.fixed("100 millis")

  const action = Queue.take(queue).pipe(
    Effect.tap((item) => Console.log(`Taken: ${item}`)),
    Effect.tap(Console.log),
  )

  yield* Effect.repeat(action, schedule)
})

const enqueueProgram = Effect.gen(function* () {
  const queue = yield* AnilistQueue;

  let i = 0

  // Offering 2 right away
  yield* Queue.offer(queue, i++)
  yield* Queue.offer(queue, i++)

  const size = yield* queue.size
  yield* Console.log(`Queue is ready, initial size: ${size}`)

  const action = Effect.sync(() => i++).pipe(
    Effect.flatMap((value) => Queue.offer(queue, value))
  )

  const schedule = Schedule.fixed("2 seconds")

  yield* Effect.repeat(action, schedule)
})

const program = Effect.gen(function* () {
  const enqueue = yield* Effect.fork(enqueueProgram)
  const process = yield* Effect.fork(processProgram)

  yield* Fiber.join(enqueue)
  yield* Fiber.join(process)
})

Effect.runPromise(program.pipe(
  Effect.provideServiceEffect(AnilistQueue, anilistQueue)
))
