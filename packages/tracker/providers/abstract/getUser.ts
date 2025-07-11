import { fetchAnilistUser } from "../anilist/fetches/fetchAnilistUser";
import type { ProviderUser } from "../types/user";

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