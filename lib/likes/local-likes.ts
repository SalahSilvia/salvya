import { mergeLikedItems } from "@/lib/likes/merge";
import { sanitizeLikedItems } from "@/lib/likes/validate";
import type { LikedItemRecord } from "@/lib/member/likes-storage";

export const LEGACY_LIKES_KEY = "salvya-liked-items-v1";
const GUEST_LIKES_KEY = "salvya-likes-guest-v2";
const USER_LIKES_PREFIX = "salvya-likes-v2:";

function userLikesKey(userId: string) {
  return `${USER_LIKES_PREFIX}${userId}`;
}

function readKey(key: string): LikedItemRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    return sanitizeLikedItems(JSON.parse(raw) as unknown);
  } catch {
    return [];
  }
}

function writeKey(key: string, items: LikedItemRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(items));
  } catch {
    /* quota / private mode */
  }
}

export function readLegacyLikes(): LikedItemRecord[] {
  return readKey(LEGACY_LIKES_KEY);
}

export function clearLegacyLikes(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(LEGACY_LIKES_KEY);
  } catch {
    /* ignore */
  }
}

export function readGuestLikesLocal(): LikedItemRecord[] {
  return readKey(GUEST_LIKES_KEY);
}

export function writeGuestLikesLocal(items: LikedItemRecord[]): void {
  writeKey(GUEST_LIKES_KEY, items);
}

export function readUserLikesLocal(userId: string): LikedItemRecord[] {
  return readKey(userLikesKey(userId));
}

export function writeUserLikesLocal(userId: string, items: LikedItemRecord[]): void {
  writeKey(userLikesKey(userId), items);
}

/** One-time lift from global v1 likes into guest v2 storage. */
export function migrateLegacyLikesToGuestIfNeeded(): LikedItemRecord[] {
  const legacy = readLegacyLikes();
  if (legacy.length === 0) return readGuestLikesLocal();
  const guest = readGuestLikesLocal();
  const merged = mergeLikedItems(guest, legacy);
  writeGuestLikesLocal(merged);
  clearLegacyLikes();
  return merged;
}
