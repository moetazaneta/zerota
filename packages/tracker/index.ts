import * as v from "valibot";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { publicProcedure, router } from "./trpc";
import { http } from "./http";
import { api } from "@zerota/db/convex/_generated/api";
import { getAnilistActivities } from "./anilist";
import cors from "cors";

const appRouter = router({
  fetchAnilistActivities: publicProcedure
    .input(v.object({ id: v.string() }))
    .mutation(async ({ input }) => {
      console.log("for user:", input.id);
      const activities = await getAnilistActivities(input.id);
      console.log("activities:", activities);
      const results = await Promise.all(
        activities.map((activity) =>
          http.mutation(api.activity.createStatusActivity, activity),
        ),
      );
      console.log("results:", results);
      return results;
    }),
});

export type AppRouter = typeof appRouter;

const server = createHTTPServer({
  middleware: cors(),
  router: appRouter,
});

export const port = 3001;

server.listen(port);
