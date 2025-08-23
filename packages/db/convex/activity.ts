import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { getAll } from "convex-helpers/server/relationships";
import { api } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import {
  type Media,
  mediaFields,
  providerName,
  type StatusActivity,
  statusActivityFields,
} from "./schema";

const {
  createdAt: _createdAt,
  updatedAt: _updatedAt,
  provider: _provider,
  ...createMediaFields
} = mediaFields;

export const createStatusActivity = mutation({
  args: {
    provider: providerName,
    media: v.object(createMediaFields),
    activity: v.object(statusActivityFields),
    providerUserId: v.string(),
    // userId: v.string(),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    const { provider, media, activity, createdAt, providerUserId } = args;
    const providerMap = await ctx.runQuery(api.providers.listProviders);
    const providerId = providerMap[provider]._id;

    const providerUser = await ctx.runQuery(
      api.userProviders.getProviderUserById,
      { providerId: providerUserId },
    );
    if (!providerUser) {
      throw new Error("User provider not found");
    }
    const userId = providerUser.userId;

    const mediaId = await (async () => {
      const existingMedia = await ctx.db
        .query("media")
        .filter((q) => q.eq(q.field("provider"), providerId))
        .filter((q) => q.eq(q.field("providerId"), media.providerId))
        .unique();

      if (existingMedia) {
        return existingMedia._id;
      }

      return ctx.db.insert("media", {
        ...media,
        provider: providerId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    })();

    const existingActivity = await ctx.db
      .query("activities")
      .filter((q) => q.eq(q.field("userId"), userId))
      .filter((q) => q.eq(q.field("status"), activity.status))
      .filter((q) => q.eq(q.field("progress"), activity.progress))
      .filter((q) => q.eq(q.field("progressUnit"), activity.progressUnit))
      .filter((q) => q.eq(q.field("createdAt"), createdAt));
    // .filter((q) => q.eq(q.field("media"), mediaId))
    // .unique();

    // TODO: troubleshoot why filtering by media doesn't work
    for await (const activity of existingActivity) {
      if (activity.media === mediaId) {
        return;
      }
    }

    await ctx.db.insert("activities", {
      userId,
      providerUserId,
      media: mediaId,
      provider: providerId,
      kind: "status",
      status: activity.status,
      progress: activity.progress,
      progressUnit: activity.progressUnit,
      createdAt,
      updatedAt: Date.now(),
    });
  },
});

export type PublicActivity = Omit<
  StatusActivity,
  "media" | "author" | "provider"
> & {
  media: Media;
  author: Doc<"users">;
  providerAuthor: Doc<"userProviders">;
  provider: Doc<"providers">;
};

export const publicList = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const { paginationOpts } = args;
    const activitiesPage = await ctx.db
      .query("activities")
      .withIndex("by_createdAt")
      .order("desc")
      .paginate(paginationOpts);

    const mediaIds = [
      ...new Set(activitiesPage.page.map((activity) => activity.media)),
    ];
    const userIds = [
      ...new Set(activitiesPage.page.map((activity) => activity.userId)),
    ];
    const providerUserIds = [
      ...new Set(
        activitiesPage.page.map((activity) => activity.providerUserId),
      ),
    ];
    const providerIds = [
      ...new Set(activitiesPage.page.map((activity) => activity.provider)),
    ];

    const mediaList = (await getAll(ctx.db, mediaIds)).filter((v) => v != null);
    const users = (await getAll(ctx.db, userIds)).filter((v) => v != null);
    const providerUsers = (
      await Promise.all(
        providerUserIds.map((id) =>
          ctx.db
            .query("userProviders")
            .withIndex("byProviderUserId", (q) => q.eq("providerUserId", id))
            .collect(),
        ),
      )
    )
      .flat()
      .filter((v) => v != null);

    const providers = (await getAll(ctx.db, providerIds)).filter(
      (v) => v != null,
    );

    return {
      ...activitiesPage,
      page: (
        await Promise.all(
          activitiesPage.page.map(async (activity) => {
            if (activity.kind !== "status") {
              return null;
            }

            const media = mediaList.find((m) => m._id === activity.media);
            const user = users.find((u) => u._id === activity.userId);
            const provider = providers.find((p) => p._id === activity.provider);
            const providerUser = providerUsers.find(
              (p) =>
                p.providerUserId === activity.providerUserId &&
                p.provider === provider?._id,
            );
            if (!media || !user || !providerUser || !provider) {
              return null;
            }

            return {
              ...activity,
              media,
              author: user,
              providerAuthor: providerUser,
              provider: provider,
            } satisfies PublicActivity;
          }),
        )
      ).filter((v) => v != null),
    };
  },
});
