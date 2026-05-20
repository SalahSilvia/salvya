import { describe, expect, it } from "vitest";
import { runUnifiedSearch } from "@/lib/search/unified-search";
import type { UnifiedSearchContext } from "@/lib/search/unified-search";
import { DEFAULT_SEARCH_FILTERS, discoverTilesToCollections } from "@/lib/search/types";
import type { ArtistCard } from "@/lib/site-data";
import type { SearchProductHit } from "@/lib/member/search-catalog";
import { DISCOVER_CATEGORIES, TRENDING_EDITORIAL } from "@/lib/member/search-discovery";

const artist = (slug: string, name: string, tag: ArtistCard["statusTag"]): ArtistCard => ({
  slug,
  name,
  statusTag: tag,
  gradient: "",
  ambient: "",
  profileImage: "",
  coverImage: "",
  aboutLead: "",
});

describe("runUnifiedSearch", () => {
  const artists: ArtistCard[] = [
    artist("babygang", "BabyGang", "LIMITED DROP"),
    artist("elgrandetoto", "ElGrandeToto", "AVAILABLE"),
  ];

  const products = [
    {
      id: "1",
      productId: "p1",
      kind: "hoodie" as const,
      href: "/x",
      imageSrc: "/i",
      title: "No Signal Hoodie",
      priceLabel: "€89",
      artistLabel: "BABYGANG",
      artistSlug: "babygang",
      rankMeta: {
        dbProductId: "uuid-1",
        category: "hoodie",
        priceCents: 8900,
        inStock: true,
        publishedAt: new Date().toISOString(),
        metrics: {
          productId: "uuid-1",
          views24h: 10,
          views7d: 40,
          sales24h: 2,
          sales7d: 5,
          cartAdds: 3,
          conversionRate: 0.12,
          trendingScore: 50,
          popularityScore: 60,
          metricsUpdatedAt: new Date().toISOString(),
        },
      },
    },
  ];

  const ctx: UnifiedSearchContext = {
    artists,
    products,
    collections: discoverTilesToCollections(DISCOVER_CATEGORIES),
    trends: TRENDING_EDITORIAL,
    likedProductIds: new Set(["p1"]),
    personalization: {
      likedProductIds: new Set(["p1"]),
      likedArtistSlugs: new Set(["babygang"]),
      viewedProductIds: new Set(),
      viewedArtistSlugs: new Set(),
      purchasedArtistSlugs: new Set(),
      purchasedCategories: new Set(),
    },
    artistBySlug: new Map(artists.map((a) => [a.slug, a])),
  };

  it("ranks exact slug match highly for artists", () => {
    const r = runUnifiedSearch("babygang", DEFAULT_SEARCH_FILTERS, ctx);
    expect(r.artists[0]?.data.slug).toBe("babygang");
  });

  it("surfaces liked products under trending boost filter", () => {
    const r = runUnifiedSearch("", { ...DEFAULT_SEARCH_FILTERS, popularity: "trending" }, ctx);
    expect(r.products.some((p) => p.data.productId === "p1")).toBe(true);
  });
});
