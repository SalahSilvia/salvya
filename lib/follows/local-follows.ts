import { artists } from "@/lib/site-data";
import { mergeArtistFollows } from "@/lib/follows/merge";
import { sanitizeArtistFollows } from "@/lib/follows/validate";
import type { ArtistFollowRecord } from "@/lib/member/artist-follows-storage";

export const LEGACY_FOLLOWS_KEY = "salvya-artist-follows-v1";
const LEGACY_FAVORITES_KEY = "salvya-artist-favorites";
const GUEST_FOLLOWS_KEY = "salvya-follows-guest-v2";
const USER_FOLLOWS_PREFIX = "salvya-follows-v2:";

function userFollowsKey(userId: string) {
  return `${USER_FOLLOWS_PREFIX}${userId}`;
}

function metaForSlug(slug: string): Pick<ArtistFollowRecord, "name" | "profileImage"> {
  const artist = artists.find((a) => a.slug === slug);
  return {
    name: artist?.name ?? slug,
    profileImage: artist?.profileImage ?? `/api/artist-avatar/${slug}`,
  };
}

function readKey(key: string): ArtistFollowRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    return sanitizeArtistFollows(JSON.parse(raw) as unknown);
  } catch {
    return [];
  }
}

function writeKey(key: string, rows: ArtistFollowRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(rows));
  } catch {
    /* quota / private mode */
  }
}

function readLegacyFavoritesOnly(): ArtistFollowRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LEGACY_FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const now = Date.now();
    return parsed
      .filter((x): x is string => typeof x === "string" && x.length > 0)
      .map((slug, i) => ({
        slug,
        followedAt: now - i,
        ...metaForSlug(slug),
      }));
  } catch {
    return [];
  }
}

export function readLegacyFollowsV1(): ArtistFollowRecord[] {
  return readKey(LEGACY_FOLLOWS_KEY);
}

export function clearLegacyFollowsV1(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(LEGACY_FOLLOWS_KEY);
    window.localStorage.removeItem(LEGACY_FAVORITES_KEY);
  } catch {
    /* ignore */
  }
}

export function readGuestFollowsLocal(): ArtistFollowRecord[] {
  return readKey(GUEST_FOLLOWS_KEY);
}

export function writeGuestFollowsLocal(rows: ArtistFollowRecord[]): void {
  writeKey(GUEST_FOLLOWS_KEY, rows);
}

export function readUserFollowsLocal(userId: string): ArtistFollowRecord[] {
  return readKey(userFollowsKey(userId));
}

export function writeUserFollowsLocal(userId: string, rows: ArtistFollowRecord[]): void {
  writeKey(userFollowsKey(userId), rows);
}

/** Lift v1 follows + slug-only favorites into guest v2. */
export function migrateLegacyFollowsToGuestIfNeeded(): ArtistFollowRecord[] {
  const v1 = readLegacyFollowsV1();
  const favorites = readLegacyFavoritesOnly();
  const guest = readGuestFollowsLocal();
  if (v1.length === 0 && favorites.length === 0) return guest;
  const merged = mergeArtistFollows(guest, v1, favorites);
  writeGuestFollowsLocal(merged);
  clearLegacyFollowsV1();
  return merged;
}
