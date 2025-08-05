import {defineSchema, defineTable} from "convex/server"
import {v} from "convex/values"
import type {Doc} from "./_generated/dataModel"

const baseActivity = {
	userId: v.string(),
	providerUserId: v.string(),
	media: v.id("media"),
	provider: v.id("providers"),
	createdAt: v.number(),
	updatedAt: v.number(),
}

export const providerName = v.union(v.literal("anilist"))

export type ProviderName = Doc<"providers">["name"]

export const mediaFields = {
	provider: v.id("providers"),
	providerId: v.string(),
	title: v.string(),
	url: v.string(),
	posterUrl: v.string(),
	type: v.union(
		v.literal("anime"),
		v.literal("manga"),
		v.literal("book"),
		v.literal("movie"),
		v.literal("game"),
	),
	createdAt: v.number(),
	updatedAt: v.number(),
}

export type Media = Doc<"media">

export const statusActivityFields = {
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
		v.literal("episode"),
		v.literal("chapter"),
		v.literal("none"),
	),
}

export type StatusActivity = Extract<Doc<"activities">, {kind: "status"}>

export default defineSchema({
	users: defineTable({
		username: v.optional(v.string()),
		name: v.optional(v.string()),
		imageUrl: v.optional(v.string()),
		// this the Clerk ID, stored in the subject JWT field
		externalId: v.string(),
	}).index("byExternalId", ["externalId"]),
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
	}).index("byProviderUserId", ["providerUserId"]),
	activities: defineTable(
		v.union(
			v.object({
				...baseActivity,
				kind: v.literal("status"),
				...statusActivityFields,
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
	).index("by_createdAt", ["createdAt"]),
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
			v.literal("episode"),
			v.literal("chapter"),
			v.literal("page"),
			v.literal("percentage"),
			v.literal("other"),
		),
		rating: v.optional(v.number()),
		notes: v.optional(v.string()),
		createdAt: v.number(),
		updatedAt: v.number(),
	}),
	media: defineTable(mediaFields),
	providers: defineTable({
		name: providerName,
		url: v.string(),
		logoUrl: v.string(),
	}),
})
