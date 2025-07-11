import type { User } from "@/entities/user/user"
import { z } from "zod"
import { fetchPage } from "../helpers/fetchPage"

const activityQuery = `
{
  id
  type
  replyCount
  status
  progress
  isLocked
  isSubscribed
  isLiked
  isPinned
  likeCount
  createdAt
  user {
    id
    name
    avatar {
      large
    }
  }
  media {
    id
    type
    status(version: 2)
    isAdult
    title {
      romaji
      english
    }
    coverImage {
      large
    }
  }
}
`

const pageQuery = `
query ($userIds: [Int], $createdAfter: Int, $type: ActivityType, $page: Int) {
  Page(page: $page, perPage: 50) {
    pageInfo {
      total
      perPage
      currentPage
      lastPage
      hasNextPage
    }
    activities(
      userId_in: $userIds
      type: $type
      sort: [PINNED, ID_DESC]
      createdAt_greater: $createdAfter
    ) {
      ... on ListActivity ${activityQuery}
    }
  }
}
`
const anilistActivitySchema = z.object({
  id: z.number(),
  type: z.string(),
  replyCount: z.number(),
  status: z.string(),
  progress: z.string().nullable(),
  isLocked: z.boolean(),
  isSubscribed: z.boolean(),
  isLiked: z.boolean(),
  isPinned: z.boolean(),
  likeCount: z.number(),
  createdAt: z.number(),
  user: z.object({
    id: z.number(),
    name: z.string(),
    avatar: z.object({
      large: z.string(),
    }),
  }),
  media: z.object({
    id: z.number(),
    type: z.string(),
    status: z.union([
      z.literal("FINISHED"),
      z.literal("RELEASING"),
      z.literal("NOT_YET_RELEASED"),
      z.literal("CANCELLED"),
      z.literal("HIATUS"),
    ]),
    isAdult: z.boolean(),
    title: z.object({
      romaji: z.string(),
      english: z.string().nullable(),
    }),
    coverImage: z.object({
      large: z.string(),
    }),
    format: z.union([
      z.literal("TV"),
      z.literal("TV_SHORT"),
      z.literal("MOVIE"),
      z.literal("SPECIAL"),
      z.literal("OVA"),
      z.literal("ONA"),
      z.literal("MUSIC"),
      z.literal("MANGA"),
      z.literal("NOVEL"),
      z.literal("ONE_SHOT"),
    ]),
  }),
})

const anilistActivitiesPageBodySchema = z.object({
  activities: z.array(anilistActivitySchema),
})

export type AnilistActivity = z.infer<typeof anilistActivitySchema>

export async function fetchAnilistActivities(userIds: string[], createdAfter: Date): Promise<AnilistActivity[]> {
  const createdAfterInSeconds = Math.floor(createdAfter.getTime() / 1000)

  const variables = {
    userIds,
    page: 1,
    createdAfter: createdAfterInSeconds,
  }

  const page = await fetchPage(pageQuery, variables, anilistActivitiesPageBodySchema, "regular activity")

  return page?.activities ?? []
}
