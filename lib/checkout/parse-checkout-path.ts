import { stripLocaleFromPathname } from "@/lib/i18n/pathname";

export type ProductCheckoutKind = "hoodie" | "tshirt";

export type ProductCheckoutMeta = {
  artistSlug: string;
  itemSlug: string;
  productKind: ProductCheckoutKind;
};

/** Matches `/artist/:slug/(item|tshirt)/:itemSlug/checkout` (+ optional `/payment` or `/confirm`). */
const PRODUCT_CHECKOUT_PATH_RE =
  /^\/artist\/([^/]+)\/(item|tshirt)\/([^/]+)\/checkout(?:\/(payment|confirm))?$/;

/**
 * Resolve artist/item slugs from checkout URLs (with or without locale prefix).
 */
export function parseProductCheckoutPath(pathname: string | null | undefined): ProductCheckoutMeta | null {
  if (!pathname?.trim()) return null;
  const path = stripLocaleFromPathname(pathname.trim());
  const m = path.match(PRODUCT_CHECKOUT_PATH_RE);
  if (!m) return null;
  return {
    artistSlug: m[1]!,
    itemSlug: m[3]!,
    productKind: m[2] === "tshirt" ? "tshirt" : "hoodie",
  };
}

const BAG_CHECKOUT_PATH_RE = /^\/preview-bag\/checkout(?:\/(payment|confirm))?$/;

export function isBagCheckoutPath(pathname: string | null | undefined): boolean {
  if (!pathname?.trim()) return false;
  return BAG_CHECKOUT_PATH_RE.test(stripLocaleFromPathname(pathname.trim()));
}

/** Base checkout session path (`…/checkout`) from payment or confirm pathname (keeps locale prefix). */
export function checkoutDetailsPathFromPathname(pathname: string | null | undefined): string | null {
  if (!pathname) return null;
  if (pathname.endsWith("/checkout/payment")) return pathname.slice(0, -"/payment".length);
  if (pathname.endsWith("/checkout/confirm")) return pathname.slice(0, -"/confirm".length);
  if (pathname.endsWith("/checkout")) return pathname;
  return null;
}
