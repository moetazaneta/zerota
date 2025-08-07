import {getAnilistUser} from "@zerota/providers"
import {v} from "convex/values"
import {getAll} from "convex-helpers/server/relationships"
import {api} from "./_generated/api"
import {type QueryCtx, query} from "./_generated/server"
import {providerName} from "./schema"
import {
	protectedAction,
	protectedMutation,
	protectedQuery,
} from "./utils/protected"

export const mine = protectedQuery({
	args: {},
	handler: async (ctx, args) => {
		const {user} = ctx
		if (!user) {
			throw new Error("User not found")
		}
		const userProviders = await ctx.db
			.query("userProviders")
			.withIndex("byUserId", q => q.eq("userId", user._id))
			.collect()

		const providerIds = userProviders.map(up => up.provider)
		const providers = (await getAll(ctx.db, providerIds)).filter(v => v != null)

		return userProviders.map(up => ({
			...up,
			provider: providers.find(p => p._id === up.provider)!,
		}))
	},
})

export const getProviderUserById = query({
	args: {
		providerId: v.string(),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("userProviders")
			.filter(q => q.eq(q.field("providerUserId"), args.providerId))
			.unique()
	},
})

export const addUserProvider = protectedAction({
	args: {
		providerName: providerName,
		nameOrUrl: v.string(),
	},
	handler: async (ctx, args) => {
		const {providerName, nameOrUrl} = args
		console.log("addUserProvider", providerName, nameOrUrl)
		if (providerName !== "anilist") {
			throw new Error("Only Anilist is supported for now")
		}

		const provider = await ctx.runQuery(api.providers.getProviderByName, {
			name: providerName,
		})
		console.log("provider", provider)

		if (!provider) {
			throw new Error("Provider not found")
		}

		const name = extractName(nameOrUrl)
		console.log("name", name)
		const anilistUser = await getAnilistUser(name)
		console.log("anilistUser", anilistUser)
		if (!anilistUser) {
			throw new Error("Anilist user not found")
		}

		await ctx.runMutation(api.userProviders.createUserProvider, {
			providerId: provider._id,
			providerUserId: anilistUser.providerUserId,
			name: anilistUser.name,
			url: anilistUser.url,
			avatarUrl: anilistUser.avatarUrl,
		})
	},
})

function extractName(nameOrUrl: string) {
	console.log("extractName", nameOrUrl)
	if (nameOrUrl.includes("https://anilist.co/user/")) {
		return nameOrUrl.split("/").pop()!
	}
	return nameOrUrl
}

export const createUserProvider = protectedMutation({
	args: {
		providerId: v.id("providers"),
		providerUserId: v.string(),
		name: v.string(),
		url: v.string(),
		avatarUrl: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const {user} = ctx
		const {providerId: provider, providerUserId, name, url, avatarUrl} = args

		await ctx.db.insert("userProviders", {
			userId: user._id,
			provider,
			providerUserId,
			name,
			url,
			avatarUrl,
			active: true,
			createdAt: Date.now(),
			updatedAt: Date.now(),
		})
	},
})

// TODO: Research why using query breaks types, but function don't
export async function getProviderUserByIdFunc(ctx: QueryCtx, id: string) {
	return await ctx.db
		.query("userProviders")
		.filter(q => q.eq(q.field("providerUserId"), id))
		.unique()
}
