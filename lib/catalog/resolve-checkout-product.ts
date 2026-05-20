import { fetchPublishedProductBySlug } from "@/lib/catalog/fetch-published-products";
import { findVariantById, findVariantForSelection } from "@/lib/catalog/fetch-product-variants";
import { kindLabelFromProduct } from "@/lib/catalog/storefront-product";
import { getUserMarket } from "@/lib/market/get-user-market";
import { getMarketPrice } from "@/lib/market/product-pricing";
import { pricingFromStorefrontProduct } from "@/lib/market/resolve-display-price";
import type { PreviewSelection } from "@/lib/shop-preview-selection";

export type CheckoutProductContext = {
  displayTitle: string;
  priceLabel: string;
  productImageSrc: string;
  kindLabel: string;
  productKind: "hoodie" | "tshirt";
  soldOut: boolean;
  productId: string;
  variantId: string;
  priceCents: number;
};

async function fromStorefrontProduct(
  product: Awaited<ReturnType<typeof fetchPublishedProductBySlug>>,
  selection?: PreviewSelection,
): Promise<CheckoutProductContext | null> {
  if (!product) return null;

  const variant =
    (selection?.variantId ? findVariantById(product.variants, selection.variantId) : null) ??
    (selection
      ? findVariantForSelection(product.variants, selection.size, selection.colorId)
      : null) ??
    product.variants.find((v) => v.stock > 0) ??
    product.variants[0] ??
    null;

  if (!variant) return null;

  const market = await getUserMarket();
  const unit = getMarketPrice(pricingFromStorefrontProduct(product), market.marketCode);
  const unitCents = Math.max(0, unit.unitCents + variant.priceDeltaCents);

  return {
    displayTitle: product.title,
    priceLabel: `${unit.displayPrice} · ${kindLabelFromProduct(product)}`,
    productImageSrc: variant.imageOverride ?? product.images[0] ?? "",
    kindLabel: kindLabelFromProduct(product),
    productKind: product.productKind,
    soldOut: variant.soldOut,
    productId: product.id,
    variantId: variant.id,
    priceCents: unitCents,
  };
}


/**

 * Resolve checkout display + pricing from published Supabase products only.

 * No filesystem or static shop-data fallback.

 */

export async function resolveHoodieCheckoutProduct(
  artistSlug: string,
  itemSlug: string,
  selection?: PreviewSelection,
): Promise<CheckoutProductContext | null> {
  const dbProduct = await fetchPublishedProductBySlug(artistSlug, itemSlug);
  if (!dbProduct || dbProduct.productKind !== "hoodie") return null;
  return fromStorefrontProduct(dbProduct, selection);
}

export async function resolveTshirtCheckoutProduct(
  artistSlug: string,
  itemSlug: string,
  selection?: PreviewSelection,
): Promise<CheckoutProductContext | null> {
  const dbProduct = await fetchPublishedProductBySlug(artistSlug, itemSlug);
  if (!dbProduct || dbProduct.productKind !== "tshirt") return null;
  return fromStorefrontProduct(dbProduct, selection);
}

