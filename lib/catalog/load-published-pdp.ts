import { fetchPublishedProductBySlug } from "@/lib/catalog/fetch-published-products";
import type { StorefrontProductWithVariants } from "@/lib/catalog/attach-variants-to-products";

export type PdpProductKind = "hoodie" | "tshirt";

/**
 * Load a published PDP product from Supabase only.
 * Returns null if missing, unpublished, or wrong product kind.
 */
export async function loadPublishedPdpProduct(
  artistSlug: string,
  itemSlug: string,
  expectedKind: PdpProductKind,
): Promise<StorefrontProductWithVariants | null> {
  const product = await fetchPublishedProductBySlug(artistSlug, itemSlug);
  if (!product) return null;
  if (product.productKind !== expectedKind) return null;
  return product;
}
