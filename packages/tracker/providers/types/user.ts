import type {Doc} from "@zerota/db/convex/_generated/dataModel"
import type {StrictOmit} from "@zerota/utils/strict-omit"

export type ProviderId = Doc<"providers">["id"]

export type ProviderUser = StrictOmit<
	Doc<"userProviders">,
	"_id" | "_creationTime" | "createdAt" | "updatedAt" | "provider" | "userId"
> & {
	provider: ProviderId
}
