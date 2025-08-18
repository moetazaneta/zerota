import {api} from "@zerota/db/convex/_generated/api"
import {AddUserProviders} from "@/app/profile/components/AddUserProviders"
import {UserInfo} from "@/app/profile/components/UserInfo"
import {UserProviders} from "@/app/profile/components/UserProviders"
import {protectedPreloadQuery} from "@/lib/convex"

export default async function Profile() {
	const [mePreloaded, userProvidersPreloaded, providersPreloaded] =
		await Promise.all([
			protectedPreloadQuery(api.users.me),
			protectedPreloadQuery(api.userProviders.mine),
			protectedPreloadQuery(api.providers.listProviders),
		])

	return (
		<div className="flex flex-col gap-8">
			<UserInfo preloaded={mePreloaded} />
			<div className="flex flex-col items-stretch gap-8">
				<UserProviders preloaded={userProvidersPreloaded} />
				<AddUserProviders preloaded={providersPreloaded} />
			</div>
		</div>
	)
}
