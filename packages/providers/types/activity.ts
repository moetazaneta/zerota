import type {Doc} from "@zerota/db/convex/_generated/dataModel"

export type ProviderId = Doc<"providers">["id"]

type DistributiveOmit<T, K extends PropertyKey> = T extends any
	? Omit<T, K>
	: never

export type ActivityWithMedia = DistributiveOmit<
	Doc<"activities">,
	| "_id"
	| "_creationTime"
	| "userId"
	| "updatedAt"
	| "media"
> & {
	media: DistributiveOmit<
		Doc<"media">,
		"_id" | "_creationTime" | "createdAt" | "updatedAt" | "provider"
	> & {
		provider: ProviderId
	}
}
