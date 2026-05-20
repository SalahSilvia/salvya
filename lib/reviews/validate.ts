import { REVIEW_BODY_MAX, REVIEWS_MAX_PER_PRODUCT, type StoredProductReview } from "@/lib/reviews/types";

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

export function isStoredProductReview(x: unknown): x is StoredProductReview {
  if (!isRecord(x)) return false;
  if (typeof x.id !== "string" || x.id.length === 0) return false;
  if (typeof x.userId !== "string" || x.userId.length === 0) return false;
  if (typeof x.authorLabel !== "string") return false;
  if (typeof x.rating !== "number" || !Number.isInteger(x.rating) || x.rating < 1 || x.rating > 5) return false;
  if (typeof x.body !== "string" || x.body.length < 1 || x.body.length > REVIEW_BODY_MAX) return false;
  if (typeof x.createdAt !== "string") return false;
  if (x.updatedAt !== undefined && typeof x.updatedAt !== "string") return false;
  return true;
}

export function normalizeProductReview(raw: StoredProductReview): StoredProductReview {
  return {
    id: raw.id,
    userId: raw.userId,
    authorLabel: raw.authorLabel.trim() || "Member",
    rating: Math.min(5, Math.max(1, Math.round(raw.rating))),
    body: raw.body.trim(),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt ?? raw.createdAt,
  };
}

export function sanitizeProductReviews(parsed: unknown): StoredProductReview[] {
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter(isStoredProductReview)
    .map(normalizeProductReview)
    .slice(0, REVIEWS_MAX_PER_PRODUCT);
}
