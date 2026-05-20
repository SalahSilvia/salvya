# Catalog data sources (Salvya)

**Runtime policy (May 2026):** Live storefront, checkout, search, PDPs, and artist shelves use **Supabase only** (`salvya_products` where `published = true`).

## Runtime (Supabase only)

| Surface | Module |
|---------|--------|
| PDP | `lib/catalog/load-published-pdp.ts` |
| Checkout | `lib/catalog/resolve-checkout-product.ts` |
| Artist page | `fetchPublishedProductsByArtist` |
| Home feed | `lib/home/home-catalog.ts` → `getHomeCatalogCardsAsync` |
| Search index | `lib/catalog/build-search-catalog.ts` |
| Shop bands | `app/[locale]/shop/page.tsx` |
| Sitemap | `app/sitemap.ts` |

## Migration-only (not storefront runtime)

| Source | Purpose |
|--------|---------|
| `lib/shop-data.ts` | Legacy static hoodies; **import via admin catalog-import only** |
| `lib/artist-folder-catalog.ts` | Filesystem folder scanner for admin sync |
| `lib/catalog/catalog-import.ts` | Push folders → Supabase |
| `lib/catalog/resolve-checkout-product.legacy.ts` | Emergency rollback (`SALVYA_CATALOG_LEGACY_FALLBACK=1`) |

## Pre-launch migration checklist

1. In **Admin → Products**, run **Sync folders → Supabase** for each artist.
2. Verify every live slug exists as `published` in `salvya_products`.
3. Spot-check PDP, checkout totals, and PayPal amount for top SKUs.
4. Confirm sitemap URLs match `pdpPath()` (`/artist/{slug}/item/{slug}` or `/tshirt/{slug}`).
5. Unpublish or delete duplicate rows if folder sync created overlaps.

## Images

- **Preferred:** HTTPS URLs stored on `salvya_products.images` (admin upload or import).
- **Legacy:** `/api/artist-catalog-*` and `/public/media/artists/*` remain for imported URL paths; new products should use stable CDN/Supabase storage URLs.

## Rollback

Set `SALVYA_CATALOG_LEGACY_FALLBACK=1` and wire `resolve-checkout-product.legacy.ts` in checkout routes (not enabled by default). Revert only if Supabase outage blocks launch.

## Tests

```bash
npm test -- lib/catalog
```
