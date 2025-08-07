import {
	customAction,
	customMutation,
	customQuery,
} from "convex-helpers/server/customFunctions"
import {api} from "../_generated/api"
import type {Doc} from "../_generated/dataModel"
import {action, mutation, type QueryCtx, query} from "../_generated/server"

export const protectedQuery = customQuery(query, {
	args: {},
	input: async ctx => {
		const user = await getCurrentUser(ctx)
		if (!user) {
			throw new Error("User not found")
		}
		return {
			ctx: {user},
			args: {},
		}
	},
})

export const protectedMutation = customMutation(mutation, {
	args: {},
	input: async ctx => {
		const user = await getCurrentUser(ctx)
		if (!user) {
			throw new Error("User not found")
		}
		return {
			ctx: {user},
			args: {},
		}
	},
})

export const protectedAction = customAction(action, {
	args: {},
	input: async (ctx): Promise<{args: {}; ctx: {user: Doc<"users">}}> => {
		const identity = await ctx.auth.getUserIdentity()
		if (identity === null) {
			throw new Error("User not found")
		}

		const user = await ctx.runQuery(api.users.getById, {
			id: identity.subject,
		})

		if (!user) {
			throw new Error("User not found")
		}

		return {
			ctx: {user},
			args: {},
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
