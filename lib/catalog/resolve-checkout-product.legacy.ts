/**
 * @deprecated MIGRATION ONLY — not used at runtime after catalog unification.
 * Kept for emergency rollback (`SALVYA_CATALOG_LEGACY_FALLBACK=1`).
 * Previous resolution: DB → shop-data.ts → filesystem folders.
 */
import { fetchPublishedProductBySlug } from "@/lib/catalog/fetch-published-products";
import {
  kindLabelFromProduct,
  priceLabelForProduct,
  type StorefrontProduct,
} from "@/lib/catalog/storefront-product";
import {
  getArtistFolderHoodieItem,
  getArtistFolderTshirtItem,
  isArtistFolderCatalogSlug,
} from "@/lib/artist-folder-catalog";
import { artistCatalogHoodieImageSrc } from "@/lib/elgrandetoto-hoodie-public";
import { artistCatalogTshirtImageSrc } from "@/lib/elgrandetoto-tshirt-public";
import type { CheckoutProductContext } from "@/lib/catalog/resolve-checkout-product";
import {
  findHoodie,
  formatOversizeHoodieTitle,
  formatOversizeTshirtTitle,
  HOODIE_PRICE_LABEL,
  orderHoodieImages,
  shopImageSrc,
  TSHIRT_PRICE_LABEL,
} from "@/lib/shop-data";

function fromStorefrontProduct(
  product: StorefrontProduct & { variants?: { id: string; stock: number; imageOverride?: string | null }[] },
): CheckoutProductContext | null {
  const variant = product.variants?.find((v) => v.stock > 0) ?? product.variants?.[0];
  if (!variant) return null;
  return {
    displayTitle: product.title,
    priceLabel: priceLabelForProduct(product),
    productImageSrc: variant.imageOverride ?? product.images[0] ?? "",
    kindLabel: kindLabelFromProduct(product),
    productKind: product.productKind,
    soldOut: product.soldOut,
    productId: product.id,
    variantId: variant.id,
    priceCents: product.priceCents,
  };
}

export async function resolveHoodieCheckoutProductLegacy(
  artistSlug: string,
  itemSlug: string,
): Promise<CheckoutProductContext | null> {
  const dbProduct = await fetchPublishedProductBySlug(artistSlug, itemSlug);
  if (dbProduct?.productKind === "hoodie") {
    return fromStorefrontProduct(dbProduct);
  }

  const legacy = findHoodie(artistSlug, itemSlug);
  if (legacy) {
    const firstFile = orderHoodieImages(legacy.images)[0]?.file;
    return {
      displayTitle: formatOversizeHoodieTitle(legacy.name),
      priceLabel: legacy.priceLabel,
      productImageSrc: firstFile ? shopImageSrc(artistSlug, firstFile) : "",
      kindLabel: "Hoodie",
      productKind: "hoodie",
      soldOut: false,
      productId: `legacy-hoodie-${artistSlug}-${itemSlug}`,
      variantId: `legacy-hoodie-${artistSlug}-${itemSlug}-default`,
      priceCents: 0,
    };
  }

  if (!isArtistFolderCatalogSlug(artistSlug)) return null;

  const fsItem = getArtistFolderHoodieItem(artistSlug, itemSlug);
  if (!fsItem) return null;

  const firstFile = fsItem.orderedFiles[0];
  return {
    displayTitle: formatOversizeHoodieTitle(fsItem.title),
    priceLabel: HOODIE_PRICE_LABEL,
    productImageSrc: firstFile ? artistCatalogHoodieImageSrc(artistSlug, fsItem.folder, firstFile) : "",
    kindLabel: "Hoodie",
    productKind: "hoodie",
    soldOut: false,
    productId: `legacy-fs-hoodie-${artistSlug}-${itemSlug}`,
    variantId: `legacy-fs-hoodie-${artistSlug}-${itemSlug}-default`,
    priceCents: 0,
  };
}

export async function resolveTshirtCheckoutProductLegacy(
  artistSlug: string,
  itemSlug: string,
): Promise<CheckoutProductContext | null> {
  const dbProduct = await fetchPublishedProductBySlug(artistSlug, itemSlug);
  if (dbProduct?.productKind === "tshirt") {
    return fromStorefrontProduct(dbProduct);
  }

  if (!isArtistFolderCatalogSlug(artistSlug)) return null;

  const fsItem = getArtistFolderTshirtItem(artistSlug, itemSlug);
  if (!fsItem) return null;

  const firstFile = fsItem.orderedFiles[0];
  return {
    displayTitle: formatOversizeTshirtTitle(fsItem.title),
    priceLabel: TSHIRT_PRICE_LABEL,
    productImageSrc: firstFile ? artistCatalogTshirtImageSrc(artistSlug, fsItem.folder, firstFile) : "",
    kindLabel: "T-shirt",
    productKind: "tshirt",
    soldOut: false,
    productId: `legacy-fs-tshirt-${artistSlug}-${itemSlug}`,
    variantId: `legacy-fs-tshirt-${artistSlug}-${itemSlug}-default`,
    priceCents: 0,
  };
}
