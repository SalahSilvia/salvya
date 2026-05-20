import { normalizeArtistFollow } from "@/lib/follows/validate";
import type { ArtistFollowRecord } from "@/lib/member/artist-follows-storage";

/** Merge follows by slug — newest followedAt wins. */
export function mergeArtistFollows(...sources: ArtistFollowRecord[][]): ArtistFollowRecord[] {
  const map = new Map<string, ArtistFollowRecord>();

  for (const source of sources) {
    for (const raw of source) {
      const row = normalizeArtistFollow(raw);
      const existing = map.get(row.slug);
      if (!existing || row.followedAt >= existing.followedAt) {
        map.set(row.slug, row);
      }
    }
  }

  return [...map.values()].sort((a, b) => b.followedAt - a.followedAt);
}
