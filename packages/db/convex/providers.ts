import {getAnilistUser} from "@zerota/providers"
import {v} from "convex/values"
import {api, internal} from "./_generated/api"
import type {Doc} from "./_generated/dataModel"
import {action, mutation, query} from "./_generated/server"

export const listProviders = query({
	args: {},
	handler: async ctx => {
		const providers = await ctx.db.query("providers").collect()
		const map = providers.reduce(
			(acc, provider) => {
				acc[provider.id] = provider._id
				return acc
			},
			{} as Record<Doc<"providers">["id"], Doc<"providers">["_id"]>,
		)
		return map
	},
})

export const createUserProvider = mutation({
	args: {
		provider: v.id("providers"),
		providerUserId: v.string(),
		name: v.string(),
		url: v.string(),
		avatarUrl: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()

		if (identity === null) {
			throw new Error("Not authenticated")
		}

		await ctx.db.insert("userProviders", {
			userId: identity.subject,
			provider: args.provider,
			providerUserId: args.providerUserId,
			createdAt: Date.now(),
			updatedAt: Date.now(),
			name: args.name,
			url: args.url,
			avatarUrl: args.avatarUrl,
		})
	},
})

export const addProviderByName = action({
	args: {
		name: v.string(),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()
		if (identity === null) {
			throw new Error("Not authenticated")
		}

		const user = await getAnilistUser(args.name)

		if (!user) {
			throw new Error("User not found")
		}

		const providerMap = await ctx.runQuery(api.providers.listProviders)

		await ctx.runMutation(api.providers.createUserProvider, {
			provider: providerMap[user.provider],
			providerUserId: user.providerUserId,
			name: user.name,
			url: user.url,
			avatarUrl: user.avatarUrl,
		})

		await ctx.runMutation(api.subscribers.subscribe, {
			provider: providerMap[user.provider],
			providerUserId: user.providerUserId,
		})
	},
})
