import {User} from "@clerk/backend"
import {fetchQuery} from "convex/nextjs"
import {paginationOptsValidator} from "convex/server"
import {v} from "convex/values"
import {api} from "./_generated/api"
import type {Doc} from "./_generated/dataModel"
import {mutation, query} from "./_generated/server"
import {
	type Media,
	mediaFields,
	providerType,
	type StatusActivity,
	statusActivityFields,
} from "./schema"
import {getProviderUserByIdFunc} from "./userProviders"
import {getUserByExternalId} from "./users"

const {
	createdAt: _createdAt,
	updatedAt: _updatedAt,
	provider: _provider,
	...createMediaFields
} = mediaFields

export const createStatusActivity = mutation({
	args: {
		provider: providerType,
		media: v.object(createMediaFields),
		activity: v.object(statusActivityFields),
		providerUserId: v.string(),
		// userId: v.string(),
		createdAt: v.number(),
	},
	handler: async (ctx, args) => {
		const {provider, media, activity, createdAt, providerUserId} = args
		const providerMap = await ctx.runQuery(api.providers.listProviders)
		const providerId = providerMap[provider]

		const providerUser = await ctx.runQuery(
			api.userProviders.getProviderUserById,
			{providerId: providerUserId},
		)
		if (!providerUser) {
			throw new Error("User provider not found")
		}
		const userId = providerUser.userId

		console.log("userId", userId)

		const mediaId = await (async () => {
			const existingMedia = await ctx.db
				.query("media")
				.filter(q => q.eq(q.field("provider"), providerId))
				.filter(q => q.eq(q.field("providerId"), media.providerId))
				.unique()

			if (existingMedia) {
				return existingMedia._id
			}

			return ctx.db.insert("media", {
				...media,
				provider: providerId,
				createdAt: Date.now(),
				updatedAt: Date.now(),
			})
		})()

		console.log("mediaId", mediaId)

		const existingActivity = await ctx.db
			.query("activities")
			.filter(q => q.eq(q.field("userId"), userId))
			.filter(q => q.eq(q.field("status"), activity.status))
			.filter(q => q.eq(q.field("progress"), activity.progress))
			.filter(q => q.eq(q.field("progressUnit"), activity.progressUnit))
			.filter(q => q.eq(q.field("createdAt"), createdAt))
		// .filter((q) => q.eq(q.field("media"), mediaId))
		// .unique();

		// TODO: troubleshoot why filtering by media doesn't work
		for await (const activity of existingActivity) {
			if (activity.media === mediaId) {
				console.log("already exists")
				return
			}
		}

		await ctx.db.insert("activities", {
			userId,
			providerUserId,
			media: mediaId,
			kind: "status",
			status: activity.status,
			progress: activity.progress,
			progressUnit: activity.progressUnit,
			createdAt,
			updatedAt: Date.now(),
		})
		console.log("inserted")
	},
})

export type PublicActivity = Omit<StatusActivity, "media" | "author"> & {
	media: Media
	author: Doc<"users">
	providerAuthor: Doc<"userProviders">
}

export const publicList = query({
	args: {
		paginationOpts: paginationOptsValidator,
	},
	handler: async (ctx, args) => {
		const {paginationOpts} = args
		const activities = await ctx.db
			.query("activities")
			.withIndex("by_createdAt")
			.order("desc")
			.paginate(paginationOpts)

		// TODO: if too slow, maybe i should promise.all the media and author, and then .find in final object?

		return {
			...activities,
			page: await Promise.all(
				activities.page.map(
					async activity =>
						({
							// TODO: it's true that it's status activity, but we should check properly
							...(activity as StatusActivity),
							// biome-ignore lint/style/noNonNullAssertion: surely media exists
							media: (await ctx.db.get(activity.media))!,
							// biome-ignore lint/style/noNonNullAssertion: surely author exists
							author: (await getUserByExternalId(ctx, activity.userId))!,
							// providerAuthor: (await fetchQuery(
							// 	api.userProviders.getProviderUserById,
							// ))!,
							// biome-ignore lint/style/noNonNullAssertion: surely provider user exists
							providerAuthor: (await getProviderUserByIdFunc(
								ctx,
								activity.providerUserId,
							))!,
						}) satisfies PublicActivity,
				),
			),
		}
	},
})
