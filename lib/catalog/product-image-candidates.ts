import type { StorefrontProduct } from "@/lib/catalog/storefront-product";

type ProductWithOptionalCard = StorefrontProduct & { cardImageUrl?: string | null };

/** Client-safe image URL fallbacks (fronts before backs; no artist-shop shop-card slot). */
export function collectProductImageCandidates(product: ProductWithOptionalCard): string[] {
  const urls: string[] = [];
  const push = (raw?: string | null) => {
    const u = raw?.trim();
    if (u && !urls.includes(u)) urls.push(u);
  };

  push(product.cardImageUrl);
  for (const color of product.colors) {
    push(color.front);
    push(color.back);
    for (const m of color.models ?? []) push(m);
  }
  for (const u of product.images) push(u);

  return urls;
}
