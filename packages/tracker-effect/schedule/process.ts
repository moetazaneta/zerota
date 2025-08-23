import { api } from "@zerota/db/convex/_generated/api";
import { Config, Console, Duration, Effect, Queue, Schedule } from "effect";
import { getAnilistActivities } from "../../providers/anilist";
import { getGoodreadsActivities } from "../../providers/goodreads/get-gemini";
import { http } from "../http";
import { AnilistQueue, GoodreadsQueue } from "./schedule";

const processAnilistUsers = Effect.gen(function* () {
  yield* Console.log("processAnilistUsers starting");
  const queue = yield* AnilistQueue;

  const delayMs = yield* Config.number("ANILIST_QUEUE_DELAY_MS");
  const duration = Duration.millis(delayMs);
  const schedule = Schedule.fixed(duration);

  yield* Console.log("processAnilistUsers queue");

  const action = Effect.gen(function* () {
    yield* Console.log("processAnilistUsers action");
    const userId = yield* Queue.take(queue);
    yield* Console.log("processAnilistUsers userId", userId);
    const date1MonthAgo = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000);
    const activities = yield* Effect.tryPromise(() =>
      getAnilistActivities([userId], date1MonthAgo),
    );
    yield* Console.log(`For user: ${userId}`);
    yield* Console.log(activities.length);

    const saveAllActivities = yield* Effect.tryPromise(() =>
      Promise.all(
        activities.map((activity) =>
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
      Effect.catchAll((error) => {
        return Effect.succeed([]);
      }),
    );

    yield* Console.log("saved");
    yield* Console.log(saveAllActivities.length);
    yield* Console.log("post saved");
    yield* Console.log("q size", yield* Queue.size(queue));
  });
  yield* Effect.repeat(action, schedule);
});

const processGoodreadsUsers = Effect.gen(function* () {
  yield* Console.log("gr starting");
  const queue = yield* GoodreadsQueue;

  const delayMs = yield* Config.number("GOODREADS_QUEUE_DELAY_MS");
  const duration = Duration.millis(delayMs);
  const schedule = Schedule.fixed(duration);

  const action = Effect.gen(function* () {
    yield* Console.log("gr taking from queue");
    const userId = yield* Queue.take(queue);
    const date1MonthAgo = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000);
    const activities = yield* Effect.tryPromise(() =>
      getGoodreadsActivities(userId),
    );
    yield* Console.log(`For user: ${userId}`);
    yield* Console.log(activities.length);

    const saveAllActivities = yield* Effect.tryPromise(() =>
      Promise.all(
        activities.map((activity) =>
          http.mutation(api.activity.createStatusActivity, {
            provider: "goodreads",
            providerUserId: activity.providerUserId,
            // userId,
            media: {
              providerId: activity.media.providerId,
              // providerId: "TODO)))",
              title: activity.media.title,
              url: activity.media.url,
              posterUrl: activity.media.posterUrl,
              type: activity.media.type,
            },
            activity: {
              status: activity.activity.status,
              progress: activity.activity.progress,
              progressUnit: activity.activity.progressUnit,
            },
            createdAt: activity.createdAt,
          }),
        ),
      ),
    ).pipe(
      Effect.catchAll((error) => {
        return Effect.succeed([]);
      }),
    );

    yield* Console.log("saved");
    yield* Console.log(saveAllActivities.length);
    yield* Console.log("post saved");
    yield* Console.log("q size", yield* Queue.size(queue));
  });
  yield* Effect.repeat(action, schedule);
});

export const processSubscribedUsers = Effect.gen(function* () {
  yield* Console.log("processSubscribedUsers starting");
  yield* processAnilistUsers;
  // yield* processGoodreadsUsers
});
