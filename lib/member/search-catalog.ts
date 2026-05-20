import type { StorefrontProduct } from "@/lib/catalog/storefront-product";
import { pdpPath } from "@/lib/catalog/storefront-product";
import type { MarketContext } from "@/lib/market/market-context";
import { priceLabelForContext } from "@/lib/market/resolve-display-price";
import type { ElgrandetotoFolderHoodieItem } from "@/lib/elgrandetoto-hoodie-fs";
import type { ElgrandetotoFolderTshirtItem } from "@/lib/elgrandetoto-tshirt-fs";
import { artistCatalogHoodieImageSrc } from "@/lib/elgrandetoto-hoodie-public";
import { artistCatalogTshirtImageSrc } from "@/lib/elgrandetoto-tshirt-public";
import {
  formatOversizeHoodieTitle,
  formatOversizeTshirtTitle,
  HOODIE_PRICE_LABEL,
  TSHIRT_PRICE_LABEL,
} from "@/lib/shop-data";
import { makeProductId } from "@/lib/member/likes-storage";

export type SearchProductHit = {
  id: string;
  productId: string;
  kind: "hoodie" | "tshirt";
  href: string;
  imageSrc: string;
  title: string;
  priceLabel: string;
  artistLabel: string;
  artistSlug: string;
};

function artistLabelFromSlug(slug: string): string {
  if (slug === "elgrandetoto") return "ELGRANDETOTO";
  if (slug === "babygang") return "BABYGANG";
  if (slug === "inkonnu") return "INKONNU";
  return slug.replace(/-/g, " ").toUpperCase();
}

export function storefrontProductToSearchHit(
  product: StorefrontProduct,
  marketContext: MarketContext,
): SearchProductHit {
  const storageType = product.productKind === "hoodie" ? "hoodie" : "tee";
  return {
    id: `db-${product.id}`,
    productId: makeProductId(product.artistSlug, storageType, product.slug),
    kind: product.productKind,
    href: pdpPath(product),
    imageSrc: product.images[0] ?? "",
    title: product.title,
    priceLabel: priceLabelForContext(product, marketContext),
    artistLabel: artistLabelFromSlug(product.artistSlug),
    artistSlug: product.artistSlug,
  };
}

export function mergeSearchProductHits(
  primary: SearchProductHit[],
  secondary: SearchProductHit[],
): SearchProductHit[] {
  const seen = new Set(primary.map((h) => `${h.artistSlug}:${h.href}`));
  const extra = secondary.filter((h) => {
    const key = `${h.artistSlug}:${h.href}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return [...primary, ...extra];
}

export function buildSearchProductHits(
  hoodieItems: ElgrandetotoFolderHoodieItem[],
  tshirtItems: ElgrandetotoFolderTshirtItem[],
  artistSlug = "elgrandetoto",
): SearchProductHit[] {
  const hits: SearchProductHit[] = [];
  const label = artistLabelFromSlug(artistSlug);
  for (const item of hoodieItems) {
    const file = item.orderedFiles[0];
    if (!file) continue;
    hits.push({
      id: `h-${artistSlug}-${item.folder}`,
      productId: makeProductId(artistSlug, "hoodie", item.folder),
      kind: "hoodie",
      href: `/artist/${artistSlug}/item/${encodeURIComponent(item.folder)}`,
      imageSrc: artistCatalogHoodieImageSrc(artistSlug, item.folder, file),
      title: formatOversizeHoodieTitle(item.title),
      priceLabel: HOODIE_PRICE_LABEL,
      artistLabel: label,
      artistSlug,
    });
  }
  for (const item of tshirtItems) {
    const file = item.orderedFiles[0];
    if (!file) continue;
    hits.push({
      id: `t-${artistSlug}-${item.folder}`,
      productId: makeProductId(artistSlug, "tee", item.folder),
      kind: "tshirt",
      href: `/artist/${artistSlug}/tshirt/${encodeURIComponent(item.folder)}`,
      imageSrc: artistCatalogTshirtImageSrc(artistSlug, item.folder, file),
      title: formatOversizeTshirtTitle(item.title),
      priceLabel: TSHIRT_PRICE_LABEL,
      artistLabel: label,
      artistSlug,
    });
  }
  return hits;
}

export function productMatchesQuery(hit: SearchProductHit, q: string): boolean {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  return (
    hit.title.toLowerCase().includes(s) ||
    hit.artistLabel.toLowerCase().includes(s) ||
    hit.artistSlug.includes(s)
  );
}
