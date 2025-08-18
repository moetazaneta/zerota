// "use client"

import {api} from "@zerota/db/convex/_generated/api"
import {fetchQuery} from "convex/nextjs"
import {getAuthToken} from "@/app/auth"

export default async function DevTools() {
	const token = await getAuthToken()
	const user = await fetchQuery(api.users.me, {}, {token})

	return (
		<div>
			<div>DevTools</div>
			<div>{user.name}</div>
		</div>
	)
}
