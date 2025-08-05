import {v} from "convex/values"
import {mutation, query} from "./_generated/server"

export const listSubscribers = query({
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

export const subscribe = mutation({
	args: {
		provider: v.id("providers"),
		providerUserId: v.string(),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()
		if (identity === null) {
			throw new Error("Not authenticated")
		}

		await ctx.db.insert("subscribedUsers", {
			userId: identity.subject,
			provider: args.provider,
			providerUserId: args.providerUserId,
			active: true,
			createdAt: Date.now(),
			updatedAt: Date.now(),
		})
	},
})
