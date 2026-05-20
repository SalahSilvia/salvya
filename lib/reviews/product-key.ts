import type { ProductRef } from "@/lib/reviews/types";

export const LEGACY_REVIEW_KEY_PREFIX = "salvya.productReviews.v1:";

export function productReviewsStorageKey(
  artistSlug: string,
  productKind: "hoodie" | "tshirt",
  itemSlug: string,
): string {
  return `${LEGACY_REVIEW_KEY_PREFIX}${artistSlug}:${productKind}:${itemSlug}`;
}

export function productReviewsStorageKeyFromRef(ref: ProductRef): string {
  return productReviewsStorageKey(ref.artistSlug, ref.productKind, ref.itemSlug);
}
