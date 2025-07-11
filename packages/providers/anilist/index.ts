import { AnilistActivity, fetchAnilistActivities } from "@/anilist/fetches/fetchAnilistActivities";
import { ActivityWithMedia } from "@/types/activity";
import { ProviderUser } from "../types/user";
import { fetchAnilistUser } from "./fetches/fetchAnilistUser";

export async function getAnilistUser(name: string): Promise<ProviderUser | null> {
  const user = await fetchAnilistUser({ name });
  if (!user) return null;
  return {
    provider: "anilist",
    providerUserId: String(user.id),
    name: user.name,
    avatarUrl: user.avatar.medium,
    url: `https://anilist.co/user/${user.name}`,
  };
}

export async function getAnilistActivities(userIds: string[], createdAfter: Date): Promise<ActivityWithMedia[]> {
  const activities = await fetchAnilistActivities(userIds, createdAfter);
  return activities.map(a => ({
    kind: "status",
    status: mapStatus(a.status),
    progress: a.progress ? Number(a.progress) : 0,
    progressUnit: mapProgressUnit(a.media.format),
    media: {
      providerId: String(a.media.id),
      type: a.media.type,
      provider: "anilist" as const,
      url: `https://anilist.co/anime/${a.media.id}`,
      title: a.media.title.romaji,
      imageUrl: a.media.coverImage.large,
    },
  } satisfies ActivityWithMedia));
}
type A = Extract<ActivityWithMedia, { kind: "status" }>

function mapProgressUnit(format: AnilistActivity["media"]["format"]): Extract<ActivityWithMedia, { kind: "status" }>["progressUnit"] {
  switch (format) {
    case "TV":
    case "TV_SHORT":
    case "SPECIAL":
    case "OVA":
    case "ONA":
      return "episodes";
    case "MANGA":
    case "NOVEL":
      return "chapters";
    case "MUSIC":
    case "MOVIE":
    case "ONE_SHOT":
      return "none";
    default:
      return "none";
  }
}

function mapStatus(status: AnilistActivity["status"]): Extract<ActivityWithMedia, { kind: "status" }>["status"] {
  switch (status.toLowerCase()) {
    case "completed":
      return "completed";
    case "watched episode":
    case "read chapter":
      return "inProgress";
    case "plans to watch":
    case "plans to read":
      return "planned";
    case "dropped":
      return "dropped";
    case "paused watching":
    case "paused reading":
      return "onHold";
    case "repeating":
    case "rewatching":
    case "re-watching":
    case "rereading":
    case "re-reading":
      return "repeating";
    default:
      return "inProgress";
  }
}