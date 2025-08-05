import type {User} from "@/entities/user/user.js"

export function getUserIds(users: User[]) {
	// biome-ignore format: 😠
	return users.flatMap(
    user => user.providers
      .filter(p => p.provider === "anilist")
      .map(p => Number(p.id)),
  )
}
