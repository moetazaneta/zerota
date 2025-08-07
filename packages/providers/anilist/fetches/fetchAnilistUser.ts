import {prettyParse} from "@zerota/utils/pretty-parse"
import * as z from "zod/v4"
import {anilistBaseUrl} from "../config"

const anilistUserQuery = `
query ($id: Int, $name: String) {
  User(id: $id, name: $name) {
    id
    name
    avatar {
      medium
    }
  }
}
`

const anilistUserSchema = z.object({
	id: z.number(),
	name: z.string(),
	avatar: z.object({
		medium: z.string(),
	}),
})

const anilistUserResponseSchema = z.object({
	data: z.object({
		User: anilistUserSchema.nullable(),
	}),
})

export interface FetchAnilistUserOptions {
	name?: string
	id?: number
}

export type AnilistUser = z.infer<typeof anilistUserSchema>

export async function fetchAnilistUser({
	name,
	id,
}: FetchAnilistUserOptions): Promise<AnilistUser | null> {
	console.log("fetchAnilistUser", name, id)
	const response = await fetch(anilistBaseUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			query: anilistUserQuery,
			variables: {name},
		}),
	})
	const json = await response.json()
	console.log("json", json)
	const parsed = prettyParse(json, anilistUserResponseSchema)
	return parsed.data.User
}
