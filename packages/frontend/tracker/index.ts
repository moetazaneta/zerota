import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { type AppRouter } from "@zerota/tracker-new";

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `http://localhost:${3001}`,
    }),
  ],
});
