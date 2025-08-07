import {getAnilistUser} from "@zerota/providers"
import {v} from "convex/values"
import {api} from "./_generated/api"
import type {Doc} from "./_generated/dataModel"
import {action, mutation, query} from "./_generated/server"
import type {ProviderName} from "./schema"
import {protectedMutation} from "./utils/protected"

export const listProviders = query({
	args: {},
	handler: async ctx => {
		const providers = await ctx.db.query("providers").collect()
		const map = providers.reduce(
			(acc, provider) => {
				acc[provider.name] = provider
				return acc
			},
			{} as Record<ProviderName, Doc<"providers">>,
		)
		return map
	},
})

export const getProviderByName = query({
	args: {
		name: v.string(),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("providers")
			.filter(q => q.eq(q.field("name"), args.name))
			.unique()
	},
})

export const createUserProvider = protectedMutation({
	args: {
		provider: v.id("providers"),
		providerUserId: v.string(),
		name: v.string(),
		url: v.string(),
		avatarUrl: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const {user} = ctx

		await ctx.db.insert("userProviders", {
			userId: user._id,
			provider: args.provider,
			providerUserId: args.providerUserId,
			createdAt: Date.now(),
			updatedAt: Date.now(),
			name: args.name,
			url: args.url,
			avatarUrl: args.avatarUrl,
			active: true,
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
			provider: providerMap[user.provider]._id,
			providerUserId: user.providerUserId,
			name: user.name,
			url: user.url,
			avatarUrl: user.avatarUrl,
		})

		await ctx.runMutation(api.subscribers.subscribe, {
			provider: providerMap[user.provider]._id,
			providerUserId: user.providerUserId,
		})
	},
})
