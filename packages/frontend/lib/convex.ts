import {type NextjsOptions, preloadQuery} from "convex/nextjs"
import type {ArgsAndOptions, FunctionReference} from "convex/server"
import {getAuthToken} from "@/app/auth"

export async function protectedPreloadQuery<
	Query extends FunctionReference<"query">,
>(query: Query, ...args: ArgsAndOptions<Query, NextjsOptions>) {
	const token = await getAuthToken()
	return preloadQuery(query, args[0], {token, ...args[1]})
}
