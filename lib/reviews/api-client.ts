import type { ProductRef, StoredProductReview, UpsertProductReviewInput } from "@/lib/reviews/types";
import { sanitizeProductReviews } from "@/lib/reviews/validate";

export async function fetchProductReviews(ref: ProductRef): Promise<StoredProductReview[] | null> {
  try {
    const params = new URLSearchParams({
      artistSlug: ref.artistSlug,
      productKind: ref.productKind,
      itemSlug: ref.itemSlug,
    });
    const res = await fetch(`/api/product-reviews?${params.toString()}`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { reviews?: unknown };
    return sanitizeProductReviews(data.reviews);
  } catch {
    return null;
  }
}

export async function upsertProductReview(
  input: UpsertProductReviewInput,
): Promise<StoredProductReview | null> {
  try {
    const res = await fetch("/api/product-reviews", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (res.status === 401) return null;
    if (!res.ok) return null;
    const data = (await res.json()) as { review?: unknown };
    const list = sanitizeProductReviews(data.review ? [data.review] : []);
    return list[0] ?? null;
  } catch {
    return null;
  }
}
