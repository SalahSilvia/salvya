import { normalizeLikedItem } from "@/lib/likes/validate";
import type { LikedItemRecord } from "@/lib/member/likes-storage";

/** Merge likes by productId — newest timestamp wins. */
export function mergeLikedItems(...sources: LikedItemRecord[][]): LikedItemRecord[] {
  const map = new Map<string, LikedItemRecord>();

  for (const source of sources) {
    for (const raw of source) {
      const item = normalizeLikedItem(raw);
      const existing = map.get(item.productId);
      if (!existing || item.timestamp >= existing.timestamp) {
        map.set(item.productId, item);
      }
    }
  }

  return [...map.values()].sort((a, b) => b.timestamp - a.timestamp);
}
