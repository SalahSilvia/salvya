export const REVIEWS_MAX_PER_PRODUCT = 80;
export const REVIEW_BODY_MAX = 2000;

export type StoredProductReview = {
  id: string;
  userId: string;
  authorLabel: string;
  rating: number;
  body: string;
  createdAt: string;
  updatedAt?: string;
};

export type ProductRef = {
  artistSlug: string;
  productKind: "hoodie" | "tshirt";
  itemSlug: string;
};

export type UpsertProductReviewInput = ProductRef & {
  rating: number;
  body: string;
  authorLabel: string;
};
