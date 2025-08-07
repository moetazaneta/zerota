import type {UserJSON} from "@clerk/backend"
import {type Validator, v} from "convex/values"
import {
	internalMutation,
	internalQuery,
	type QueryCtx,
	query,
} from "./_generated/server"

export const me = query({
	args: {},
	handler: async ctx => {
		return await getCurrentUser(ctx)
	},
})

export const getById = query({
	args: {
		id: v.string(),
	},
	handler: async (ctx, {id}) => {
		return await getUserByExternalId(ctx, id)
	},
})

export const upsertFromClerk = internalMutation({
	args: {data: v.any() as Validator<UserJSON>}, // no runtime validation, trust Clerk
	async handler(ctx, {data}) {
		console.log("upsertFromClerk", data)
		const userAttributes = {
			username: data.username || undefined,
			name:
				data.first_name && data.last_name
					? `${data.first_name} ${data.last_name}`
					: undefined,
			imageUrl: data.image_url || undefined,
			externalId: data.id,
		}

		const user = await getUserByExternalId(ctx, data.id)
		if (user === null) {
			await ctx.db.insert("users", userAttributes)
		} else {
			await ctx.db.patch(user._id, userAttributes)
		}
	},
})

export const deleteFromClerk = internalMutation({
	args: {clerkUserId: v.string()},
	async handler(ctx, {clerkUserId}) {
		console.log("deleteFromClerk", clerkUserId)
		const user = await getUserByExternalId(ctx, clerkUserId)

		if (user !== null) {
			await ctx.db.delete(user._id)
		} else {
			console.warn(
				`Can't delete user, there is none for Clerk user ID: ${clerkUserId}`,
			)
		}
	},
})

export async function getCurrentUserOrThrow(ctx: QueryCtx) {
	const userRecord = await getCurrentUser(ctx)
	if (!userRecord) throw new Error("Can't get current user")
	return userRecord
}

export async function getCurrentUser(ctx: QueryCtx) {
	const identity = await ctx.auth.getUserIdentity()
	if (identity === null) {
		return null
	}
	return await getUserByExternalId(ctx, identity.subject)
}

export async function getUserByExternalId(ctx: QueryCtx, externalId: string) {
	console.log("getUserByExternalId", externalId)
	return await ctx.db
		.query("users")
		.withIndex("byExternalId", q => q.eq("externalId", externalId))
		.unique()
}
