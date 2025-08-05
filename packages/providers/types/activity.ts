import type {Doc} from "@zerota/db/convex/_generated/dataModel"
import type {ProviderName} from "@zerota/db/convex/schema"

type DistributiveOmit<T, K extends PropertyKey> = T extends any
	? Omit<T, K>
	: never

export type ActivityWithMedia = DistributiveOmit<
	Doc<"activities">,
	"_id" | "_creationTime" | "userId" | "updatedAt" | "media" | "provider"
> & {
	media: DistributiveOmit<
		Doc<"media">,
		"_id" | "_creationTime" | "createdAt" | "updatedAt" | "provider"
	> & {
		provider: ProviderName
	}
	provider: ProviderName
}
