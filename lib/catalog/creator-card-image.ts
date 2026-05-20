import "server-only";

import { artistShopUrlResolvesOnDisk } from "@/lib/catalog/artist-shop-file";
import {
  allProductImageUrls,
  storefrontBackImageUrl,
  storefrontFrontImageUrl,
} from "@/lib/catalog/storefront-image-slots";
import type { StorefrontProduct } from "@/lib/catalog/storefront-product";

/** True when Next.js can load this product image without a 404 from artist-shop. */
export function isResolvableProductImageUrl(url: string): boolean {
  const u = url.trim();
  if (!u) return false;
  if (u.includes("/api/artist-catalog-")) return true;
  if (u.includes("/api/artist-shop/")) return artistShopUrlResolvesOnDisk(u);
  if (u.startsWith("/media/")) return true;
  return u.startsWith("http://") || u.startsWith("https://");
}

/**
 * Card image for creator catalog — prefers front flat-lay, skips missing artist-shop files.
 * Avoids Next.js "internal image response is empty" on 404 back prints.
 */
export function resolveCreatorCardImageUrl(product: StorefrontProduct): string | null {
  const ordered = [
    storefrontFrontImageUrl(product),
    storefrontBackImageUrl(product),
    ...allProductImageUrls(product),
  ];

  const seen = new Set<string>();
  for (const raw of ordered) {
    const url = raw?.trim();
    if (!url || seen.has(url)) continue;
    seen.add(url);
    if (isResolvableProductImageUrl(url)) return url;
  }
  return null;
}
