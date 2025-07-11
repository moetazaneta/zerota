import type { AnilistUserMediaScores } from "@/db/anilistUserScoresDb.js"
import { wait } from "@/helpers/wait.js"
import { anilistBaseUrl } from "../config.js"

export const pageQuery = `
query ($userIds: [Int], $page: Int) {
  Page(page: $page, perPage: 50) {
    pageInfo {
      total
      perPage
      currentPage
      lastPage
      hasNextPage
    }
    mediaList(
      userId_in: $userIds,
      status_not_in: [PLANNING],
      sort: [UPDATED_TIME_DESC]
    ) {
      media {
        id
      }
      score(format: POINT_10_DECIMAL)
      user {
        id
      }
    }
  }
}
`

export interface AnilistPageInfo {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
  hasNextPage: boolean
}

export interface AnilistPage<T> {
  data: {
    Page:
      | null
      | ({
          pageInfo: AnilistPageInfo
        } & T)
  }
}

interface AnilistScoreItem {
  score: number
  media: {
    id: number
  }
  user: {
    id: number
  }
}

export async function getUserScores(
  userIds: string[],
  maxPageCount = Number.POSITIVE_INFINITY,
) {
  console.log("getUserScores", userIds)
  const scores: AnilistScoreItem[] = []
  let pageNumber = 1

  const maxErrorCount = 5
  let errorCount = 0

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  while (true) {
    try {
      const page = await fetchUserScoresPage(pageNumber, userIds)
      console.log("Fetched score page", pageNumber)
      if (!page) break

      scores.push(...page.mediaList)

      if (!page.pageInfo.hasNextPage || pageNumber >= maxPageCount) {
        console.log("No more pages")
        break
      }

      await wait(5_000)
      pageNumber++
    } catch (error) {
      console.error(error)
      errorCount++
      if (errorCount >= maxErrorCount) {
        console.error(`Error count exceeded ${maxErrorCount}`)
        break
      }
      console.log("Waiting 60 seconds before retrying...")
      await wait(60_000)
    }
  }

  return createScoresMap(scores)
}

async function fetchUserScoresPage(page: number, userIds: string[]) {
  const variables = {
    userIds,
    page,
  }

  const response = await fetch(anilistBaseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: pageQuery,
      variables,
    }),
  })
  const json = (await response.json()) as AnilistPage<{
    mediaList: AnilistScoreItem[]
  }>
  return json.data.Page
}

export type ScoresMap = ReturnType<typeof createScoresMap>

function createScoresMap(
  scoresItems: AnilistScoreItem[],
): AnilistUserMediaScores {
  const scores: AnilistUserMediaScores = {}

  scoresItems.forEach(score => {
    const userId = String(score.user.id)
    const mediaId = String(score.media.id)

    scores[userId] ??= {}
    // biome-ignore lint/style/noNonNullAssertion: ^^
    scores[userId]![mediaId] = score.score
  })
  return scores
}
