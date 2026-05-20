/**
 * Salvya artist follows — stable row shape for local cache + Supabase JSONB.
 * Prefer `useArtistFollows()` from `@/components/artist/ArtistFollowsProvider`.
 */

import { dispatchArtistFollowsChanged, subscribeArtistFollows } from "@/lib/follows/events";
import { migrateLegacyFollowsToGuestIfNeeded, writeGuestFollowsLocal } from "@/lib/follows/local-follows";

export const ARTIST_FOLLOWS_STORAGE_KEY = "salvya-artist-follows-v1";
export const ARTIST_FOLLOWS_CHANGED_EVENT = "salvya-artist-follows-changed";

export type ArtistFollowRecord = {
  slug: string;
  name: string;
  profileImage: string;
  followedAt: number;
};

export function readArtistFollowsFromStorage(): ArtistFollowRecord[] {
  return migrateLegacyFollowsToGuestIfNeeded();
}

export function writeArtistFollowsToStorage(rows: ArtistFollowRecord[]): void {
  writeGuestFollowsLocal(rows);
  dispatchArtistFollowsChanged();
}

export { dispatchArtistFollowsChanged };

export function subscribeArtistFollowsChanged(onChange: () => void): () => void {
  return subscribeArtistFollows(onChange);
}

export function isFollowingArtistSlug(slug: string, rows: ArtistFollowRecord[]): boolean {
  return rows.some((r) => r.slug === slug);
}
