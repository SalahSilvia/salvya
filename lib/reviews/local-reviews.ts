import { sanitizeProductReviews } from "@/lib/reviews/validate";
import type { StoredProductReview } from "@/lib/reviews/types";

export function loadLocalProductReviews(storageKey: string): StoredProductReview[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    return sanitizeProductReviews(JSON.parse(raw) as unknown);
  } catch {
    return [];
  }
}

export function saveLocalProductReviews(storageKey: string, reviews: StoredProductReview[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(storageKey, JSON.stringify(reviews));
  } catch {
    /* quota or private mode */
  }
}
