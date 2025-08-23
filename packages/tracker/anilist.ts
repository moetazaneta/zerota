import { api } from "@zerota/db/convex/_generated/api";
import { http } from "./http";
import { getAnilistActivities as getAnilistRawActivities } from "@zerota/providers/anilist";

export async function getAnilistSubscribers() {
  const providerMap = await http.query(api.providers.listProviders);
  const subscribers = http.query(api.subscribers.listSubscribers, {
    provider: providerMap.anilist._id,
  });
  return subscribers;
}

export async function getAnilistActivities(userId: string) {
  const date1YearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  const activities = await getAnilistRawActivities([userId], date1YearAgo);
  return activities.map((activity) => ({
    provider: "anilist" as const,
    providerUserId: activity.providerUserId,
    media: {
      providerId: activity.media.providerId,
      title: activity.media.title,
      url: activity.media.url,
      posterUrl: activity.media.posterUrl,
      type: activity.media.type,
    },
    activity: {
      status: activity.status,
      progress: activity.progress,
      progressUnit: activity.progressUnit,
    },
    createdAt: activity.createdAt,
  }));
}
