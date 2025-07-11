import type { User } from "@/entities/user/user.js"
import { z } from "zod"
import { fetchPage } from "../helpers/fetchPage.js"
import { getUserIds } from "../helpers/getUserIds.js"

const scoreActivitiesPageQuery = `
query ($userIds: [Int], $page: Int) {
  Page(page: $page, perPage: 10) {
    pageInfo {
      total
      perPage
      currentPage
      lastPage
      hasNextPage
    }
    mediaList(
      userId_in: $userIds,
      status: COMPLETED,
      sort: [UPDATED_TIME_DESC]
    ) {
      media {
        id
        type,
        title {
          romaji
        }
        coverImage {
          large
        }
      }
      updatedAt
      score(format: POINT_10_DECIMAL)
      user {
        id
      }
    }
  }
}
`

const anilistScoreActivitySchema = z.object({
  media: z.object({
    id: z.number(),
    type: z.string(),
    title: z.object({
      romaji: z.string(),
    }),
    coverImage: z.object({
      large: z.string(),
    }),
  }),
  updatedAt: z.number(),
  score: z.number().nullable(),
  user: z.object({
    id: z.number(),
  }),
})

const anilistScoreActivitiesPageBodySchema = z.object({
  mediaList: z.array(anilistScoreActivitySchema),
})

const anilistScoreActivitiesPageSchema = z.object({
  data: z.object({
    Page: z
      .object({
        pageInfo: z.object({
          total: z.number(),
          perPage: z.number(),
          currentPage: z.number(),
          lastPage: z.number(),
          hasNextPage: z.boolean(),
        }),
      })
      .and(anilistScoreActivitiesPageBodySchema),
  }),
})

export type AnilistScoreActivity = z.infer<typeof anilistScoreActivitySchema>

export async function fetchAnilistScoreActivities(users: User[]): Promise<AnilistScoreActivity[]> {
  const userIds = getUserIds(users)

  const variables = {
    userIds,
    page: 1,
  }

  const page = await fetchPage(
    scoreActivitiesPageQuery,
    variables,
    anilistScoreActivitiesPageBodySchema,
    "regular activity",
  )

  return page?.mediaList ?? []
}
