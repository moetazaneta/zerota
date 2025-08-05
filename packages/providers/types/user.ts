import type {Doc} from "@zerota/db/convex/_generated/dataModel"
import type {ProviderName} from "@zerota/db/convex/schema"
import type {StrictOmit} from "@zerota/utils/strict-omit"

// export type ProviderUser = any
export type ProviderUser = StrictOmit<
	Doc<"userProviders">,
	"_id" | "_creationTime" | "createdAt" | "updatedAt" | "provider" | "userId"
> & {
	provider: ProviderName
}
