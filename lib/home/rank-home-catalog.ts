import type { PremiumTrendingCard } from "@/lib/home/premium-trending";
import type { ProductWithDiscoveryMetrics } from "@/lib/discovery/build-discovery-catalog";
import { rankProductScore } from "@/lib/discovery/ranking";
import type { PersonalizationProfile } from "@/lib/discovery/types";
import type { MarketContext } from "@/lib/market/market-context";
import { pdpPath, toCarouselItem } from "@/lib/catalog/storefront-product";

function shelfBadgeForProduct(p: ProductWithDiscoveryMetrics): PremiumTrendingCard["badge"] {
  if (p.isLimitedDrop) return "limited";
  const b = p.badge?.toLowerCase();
  if (b === "new" || b === "limited") return b;
  if (p.featured) return "new";
  if ((p.metrics?.trendingScore ?? 0) > 25) return "new";
  return undefined;
}

export function rankProductsToHomeCards(
  products: ProductWithDiscoveryMetrics[],
  artistNames: Map<string, string>,
  market: MarketContext,
  profile?: PersonalizationProfile | null,
  maxTotal = 18,
): PremiumTrendingCard[] {
  const scored = products
    .filter((p) => p.images[0])
    .map((p) => {
      const inStock = p.variants.length ? p.variants.some((v) => v.stock > 0) : p.stock > 0;
      const score = rankProductScore(
        {
          query: "",
          title: p.title,
          artistSlug: p.artistSlug,
          artistLabel: artistNames.get(p.artistSlug) ?? p.artistSlug,
          category: p.category,
          priceCents: p.priceCents,
          inStock: inStock && !p.soldOut,
          publishedAt: p.publishedAt,
          productId: p.id,
          likedProductId: `${p.artistSlug}:${p.productKind === "tshirt" ? "tee" : "hoodie"}:${encodeURIComponent(p.slug)}`,
          metrics: p.metrics,
        },
        profile,
      );
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  const cards: PremiumTrendingCard[] = [];
  for (const { p } of scored) {
    const carousel = toCarouselItem(p, market);
    cards.push({
      id: `db-${p.id}`,
      kind: p.productKind === "tshirt" ? "tshirt" : "hoodie",
      artistSlug: p.artistSlug,
      href: pdpPath(p),
      imageSrc: p.images[0]!,
      title: p.title,
      priceLabel: carousel.priceLabel,
      artistLabel: artistNames.get(p.artistSlug) ?? p.artistSlug,
      badge: shelfBadgeForProduct(p),
    });
    if (cards.length >= maxTotal) break;
  }
  return cards;
}
