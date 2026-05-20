import type { StorefrontProduct } from "@/lib/catalog/storefront-product";
import { fetchVariantsForProducts } from "@/lib/catalog/fetch-product-variants";
import type { StorefrontVariant } from "@/lib/inventory/types";

export type StorefrontProductWithVariants = StorefrontProduct & {
  variants: StorefrontVariant[];
  /** Pre-validated image for creator catalog cards (server-resolved). */
  cardImageUrl?: string | null;
};

export function aggregateProductStock(variants: StorefrontVariant[]): number {
  return variants.reduce((sum, v) => sum + v.stock, 0);
}

export function applyVariantsToProduct(
  product: StorefrontProduct,
  variants: StorefrontVariant[],
): StorefrontProductWithVariants {
  const stock = variants.length ? aggregateProductStock(variants) : product.stock;
  return {
    ...product,
    variants,
    stock,
    soldOut: stock <= 0,
    lowStock: stock > 0 && stock <= 5,
  };
}

export async function attachVariantsToProducts(
  products: StorefrontProduct[],
): Promise<StorefrontProductWithVariants[]> {
  if (!products.length) return [];
  const variantMap = await fetchVariantsForProducts(products.map((p) => p.id));
  return products.map((p) => applyVariantsToProduct(p, variantMap.get(p.id) ?? []));
}
