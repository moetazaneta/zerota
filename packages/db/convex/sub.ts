import {v} from "convex/values"
import {query} from "./_generated/server"

export const listSubUsers = query({
	// Validators for arguments.
	args: {
		provider: v.id("providers"),
	},

	// Query implementation.
	handler: async (ctx, args) => {
		const subscribedUsers = await ctx.db
			.query("subscribedUsers")
			.filter(q => q.eq(q.field("provider"), args.provider))
			.collect()

		return subscribedUsers
	},
})
