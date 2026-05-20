import { toCarouselItem, type StorefrontCarouselItem, type StorefrontProduct } from "@/lib/catalog/storefront-product";
import type { MarketContext } from "@/lib/market/market-context";

export type ShopSectionsPayload = {
  tshirtCarousel: StorefrontCarouselItem[];
  hoodieCarousel: StorefrontCarouselItem[];
  limitedDrops: StorefrontCarouselItem[];
  sellingFast: StorefrontCarouselItem[];
  editorsPicks: StorefrontCarouselItem[];
  newArrivals: StorefrontCarouselItem[];
  spotlight: StorefrontCarouselItem | null;
};

export function buildShopSections(
  products: StorefrontProduct[],
  market: MarketContext,
): ShopSectionsPayload {
  const items = products
    .filter((p) => p.images.length > 0)
    .map((p) => toCarouselItem(p, market));

  const hoodieCarousel = items.filter((i) => i.kind === "hoodie");
  const tshirtCarousel = items.filter((i) => i.kind === "tshirt");

  const inStock = (i: StorefrontCarouselItem) => !i.soldOut;

  const limitedDrops = products
    .filter((p) => (p.isLimitedDrop || p.badge?.toLowerCase().includes("limited")) && p.images.length > 0)
    .map((p) => toCarouselItem(p, market));

  const sellingFast = products
    .filter((p) => p.lowStock && !p.soldOut && p.images.length > 0)
    .map((p) => toCarouselItem(p, market));

  const featuredProducts = products.filter((p) => p.featured);
  const editorsPicks = (featuredProducts.length ? featuredProducts : products)
    .map((p) => toCarouselItem(p, market))
    .filter((i) => i.modelImageUrl)
    .slice(0, 6);

  const sortedByDate = [...products].sort((a, b) => {
    const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return tb - ta;
  });
  const newArrivals = sortedByDate.slice(0, 8).map((p) => toCarouselItem(p, market));

  const spotlightCandidate =
    items.find((i) => inStock(i) && i.limited) ??
    items.find((i) => inStock(i) && featuredProducts.some((p) => p.id === i.id)) ??
    items.find(inStock) ??
    items[0] ??
    null;

  return {
    tshirtCarousel,
    hoodieCarousel,
    limitedDrops: limitedDrops.length ? limitedDrops : items.filter((i) => i.limited).slice(0, 8),
    sellingFast: sellingFast.length ? sellingFast.slice(0, 6) : items.filter(inStock).slice(0, 4),
    editorsPicks,
    newArrivals,
    spotlight: spotlightCandidate,
  };
}
