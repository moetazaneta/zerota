import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const baseActivity = {
  // id: v.id("activities"),
  media: v.id("media"),
  createdAt: v.number(),
  updatedAt: v.number(),
}

export default defineSchema({
  numbers: defineTable({
    value: v.number(),
  }),
  subscribedUsers: defineTable({
    userId: v.string(),
    provider: v.id("providers"),
    providerUserId: v.string(),
    active: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  userProviders: defineTable({
    userId: v.string(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    url: v.string(),
    provider: v.id("providers"),
    providerUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  activities: defineTable(
    v.union(
      v.object({
        ...baseActivity,
        kind: v.literal("status"),
        status: v.union(
          v.literal("completed"),
          v.literal("inProgress"),
          v.literal("planned"),
          v.literal("dropped"),
          v.literal("onHold"),
          v.literal("repeating"),
        ),
        progress: v.number(),
        progressUnit: v.union(
          v.literal("episodes"),
          v.literal("chapters"),
          v.literal("pages"),
          v.literal("percentages"),
          v.literal("none"),
          v.literal("other"),
        ),
      }),
      v.object({
        ...baseActivity,
        kind: v.literal("rating"),
        rating: v.number(),
      }),
      v.object({
        ...baseActivity,
        kind: v.literal("notes"),
        notes: v.string(),
      }),
    ),
  ),
  state: defineTable({
    id: v.id("state"),
    media: v.id("media"),
    status: v.union(
      v.literal("completed"),
      v.literal("inProgress"),
      v.literal("planned"),
      v.literal("dropped"),
      v.literal("onHold"),
      v.literal("repeating"),
    ),
    progress: v.number(),
    progressUnit: v.union(
      v.literal("episodes"),
      v.literal("chapters"),
      v.literal("pages"),
      v.literal("percentages"),
      v.literal("other"),
    ),
    rating: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  media: defineTable({
    provider: v.id("providers"),
    providerId: v.string(),
    title: v.string(),
    url: v.string(),
    imageUrl: v.string(),
    type: v.union(
      v.literal("anime"),
      v.literal("manga"),
      v.literal("book"),
      v.literal("movie"),
      v.literal("game"),
      v.literal("other"),
      v.string(), // TODO: Check if types will work
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  providers: defineTable({
    id: v.union(
      v.literal("anilist"),
    ),
    name: v.string(),
    url: v.string(),
  }),
});
