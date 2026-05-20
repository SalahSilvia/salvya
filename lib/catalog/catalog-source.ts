/**
 * Salvya catalog runtime policy.
 *
 * Live storefront, checkout, search, and PDPs resolve products ONLY from Supabase
 * (`salvya_products`). Folder scanners and `shop-data.ts` are import/migration tools only.
 *
 * Emergency rollback: set `SALVYA_CATALOG_LEGACY_FALLBACK=1` and restore
 * `resolve-checkout-product.legacy.ts` wiring (see docs/CATALOG-SOURCES.md).
 */

export function isLegacyCatalogFallbackEnabled(): boolean {
  return process.env.SALVYA_CATALOG_LEGACY_FALLBACK === "1";
}

/** @deprecated Runtime storefront must not use hybrid resolution. */
export const CATALOG_RUNTIME_SOURCE = "supabase" as const;
