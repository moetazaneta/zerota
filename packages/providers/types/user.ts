import type { Doc } from "db/convex/_generated/dataModel";
import type { StrictOmit } from "@zerota/utils";

export type ProviderId = Doc<"providers">["id"];

export type ProviderUser = StrictOmit<
  Doc<"userProviders">,
  | "_id"
  | "_creationTime"
  | "createdAt"
  | "updatedAt"
  | "provider"
  | "userId"
> & {
  provider: ProviderId;
}