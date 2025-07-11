import { ConvexHttpClient } from "convex/browser";

export const http = new ConvexHttpClient(process.env.CONVEX_URL);
