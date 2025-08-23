import {
  type AnilistActivity,
  fetchAnilistActivities,
} from "../anilist/fetches/fetchAnilistActivities";
import type { ActivityWithMedia } from "../types/activity";
import type { ProviderUser } from "../types/user";
import { fetchAnilistUser } from "./fetches/fetchAnilistUser";

export async function getAnilistUser(
  name: string,
): Promise<ProviderUser | null> {
  console.log("getAnilistUser", name);
  const user = await fetchAnilistUser({ name });
  if (!user) return null;
  return {
    provider: "anilist",
    providerUserId: String(user.id),
    name: user.name,
    avatarUrl: user.avatar.medium,
    url: `https://anilist.co/user/${user.name}`,
    active: true,
  };
}

export type StatusActivity = Extract<ActivityWithMedia, { kind: "status" }>;

export async function getAnilistActivities(
  userIds: string[],
  createdAfter: Date,
): Promise<StatusActivity[]> {
  const activities = await fetchAnilistActivities(userIds, createdAfter);
  return activities.map(
    (a: AnilistActivity) =>
      ({
        kind: "status",
        status: mapStatus(a.status),
        progress: mapProgress(a.progress),
        progressUnit: mapProgressUnit(a.media.format),
        createdAt: a.createdAt * 1000,
        media: {
          providerId: String(a.media.id),
          type: mapMediaType(a.media.type),
          provider: "anilist" as const,
          url: `https://anilist.co/${a.media.type.toLowerCase()}/${a.media.id}`,
          title: a.media.title.romaji,
          posterUrl: a.media.coverImage.large,
        },
        providerUserId: String(a.user.id),
        provider: "anilist" as const,
      }) satisfies ActivityWithMedia,
  );
}

function mapProgressUnit(
  format: AnilistActivity["media"]["format"],
): Extract<ActivityWithMedia, { kind: "status" }>["progressUnit"] {
  switch (format) {
    case "TV":
    case "TV_SHORT":
    case "SPECIAL":
    case "OVA":
    case "ONA":
      return "episode";
    case "MANGA":
    case "NOVEL":
      return "chapter";
    case "MUSIC":
    case "MOVIE":
    case "ONE_SHOT":
      return "none";
    default:
      return "none";
  }
}

function mapStatus(
  status: AnilistActivity["status"],
): Extract<ActivityWithMedia, { kind: "status" }>["status"] {
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

function mapMediaType(
  type: AnilistActivity["media"]["type"],
): Extract<ActivityWithMedia, { kind: "status" }>["media"]["type"] {
  switch (type) {
    case "ANIME":
      return "anime";
    case "MANGA":
      return "manga";
    case "BOOK":
      return "book";
    case "MOVIE":
      return "movie";
  }
  throw new Error(`Unknown media type: ${type}`);
}

function mapProgress(
  progress: AnilistActivity["progress"],
): Extract<ActivityWithMedia, { kind: "status" }>["progress"] {
  return progress ? Number(progress.split(" ").at(-1)) : 0;
}
