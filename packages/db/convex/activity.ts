import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const createStatusActivity = mutation({
  args: {
    media: v.id("media"),
    status: v.union(
      v.literal("completed"),
      v.literal("inProgress"),
      v.literal("planned"),
      v.literal("dropped"),
      v.literal("onHold"),
      v.literal("repeating"),
    ),
  },
  handler: async (ctx, args) => {
    const { media, status } = args;
    const activityId = await ctx.db.insert("activities", {
      media,
      kind: "status",
      status,
      progress: 0,
      progressUnit: "episodes",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return activityId;
  },
});