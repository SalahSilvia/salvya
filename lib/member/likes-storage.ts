/**
 * Salvya likes — stable IDs and row shape for local cache + Supabase JSONB.
 * Prefer `useLikes()` from `@/components/likes/LikesProvider` in React components.
 */

import { dispatchLikesChanged, subscribeLikes } from "@/lib/likes/events";
import { migrateLegacyLikesToGuestIfNeeded, writeGuestLikesLocal } from "@/lib/likes/local-likes";

export const LIKES_STORAGE_KEY = "salvya-liked-items-v1";
export const LIKES_CHANGED_EVENT = "salvya-likes-changed";

export type LikedProductType = "tee" | "hoodie";

export type LikedItemRecord = {
  productId: string;
  timestamp: number;
  type: LikedProductType;
  artistSlug: string;
  title: string;
  imageSrc: string;
  href: string;
  priceLabel: string;
  artistLabel: string;
};

export type LikedItemInput = Omit<LikedItemRecord, "timestamp">;

export function makeProductId(artistSlug: string, type: LikedProductType, sku: string): string {
  return `${artistSlug}:${type}:${encodeURIComponent(sku)}`;
}

export function parseProductId(productId: string): { artistSlug: string; type: LikedProductType; sku: string } | null {
  const first = productId.indexOf(":");
  const second = productId.indexOf(":", first + 1);
  if (first < 1 || second <= first) return null;
  const artistSlug = productId.slice(0, first);
  const type = productId.slice(first + 1, second) as LikedProductType;
  if (type !== "tee" && type !== "hoodie") return null;
  const enc = productId.slice(second + 1);
  try {
    return { artistSlug, type, sku: decodeURIComponent(enc) };
  } catch {
    return null;
  }
}

/** Guest likes only — use `useLikes()` when inside the app shell. */
export function readLikesFromStorage(): LikedItemRecord[] {
  return migrateLegacyLikesToGuestIfNeeded();
}

export function writeLikesToStorage(items: LikedItemRecord[]): void {
  writeGuestLikesLocal(items);
  dispatchLikesChanged();
}

export { dispatchLikesChanged };

export function subscribeLikesChanged(onChange: () => void): () => void {
  return subscribeLikes(onChange);
}
