import type {Doc} from "./_generated/dataModel"
import {query} from "./_generated/server"
import type {ProviderName} from "./schema"

export const me = query({
	args: {},
	handler: async ctx => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) {
			throw new Error("Unauthorized")
		}

		const user = await ctx.db
			.query("users")
			.withIndex("byExternalId", q => q.eq("externalId", identity.subject))
			.first()

		if (!user) {
			throw new Error("User not found")
		}
	},
})
