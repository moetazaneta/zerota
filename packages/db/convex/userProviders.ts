import {v} from "convex/values"
import {type QueryCtx, query} from "./_generated/server"

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

// TODO: Research why using query breaks types, but function don't
export async function getProviderUserByIdFunc(ctx: QueryCtx, id: string) {
	return await ctx.db
		.query("userProviders")
		.filter(q => q.eq(q.field("providerUserId"), id))
		.unique()
}
