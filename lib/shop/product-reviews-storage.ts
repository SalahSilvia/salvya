/**
 * Product comments — re-exports. Prefer API + local cache via ProductReviewsSection.
 */

export {
  REVIEW_BODY_MAX as COMMENT_MAX,
  REVIEWS_MAX_PER_PRODUCT as MAX_REVIEWS,
  type StoredProductReview,
} from "@/lib/reviews/types";

export { productReviewsStorageKey } from "@/lib/reviews/product-key";

export { loadLocalProductReviews as loadProductReviews } from "@/lib/reviews/local-reviews";

export { saveLocalProductReviews as saveProductReviews } from "@/lib/reviews/local-reviews";
