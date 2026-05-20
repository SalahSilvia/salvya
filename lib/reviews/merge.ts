import { normalizeProductReview } from "@/lib/reviews/validate";
import type { StoredProductReview } from "@/lib/reviews/types";

function reviewTime(r: StoredProductReview): number {
  const t = new Date(r.updatedAt ?? r.createdAt).getTime();
  return Number.isFinite(t) ? t : 0;
}

/** Merge threads — one row per userId (newest wins), then sort newest first. */
export function mergeProductReviews(...sources: StoredProductReview[][]): StoredProductReview[] {
  const byUser = new Map<string, StoredProductReview>();

  for (const source of sources) {
    for (const raw of source) {
      const row = normalizeProductReview(raw);
      const existing = byUser.get(row.userId);
      if (!existing || reviewTime(row) >= reviewTime(existing)) {
        byUser.set(row.userId, row);
      }
    }
  }

  return [...byUser.values()].sort((a, b) => reviewTime(b) - reviewTime(a));
}
