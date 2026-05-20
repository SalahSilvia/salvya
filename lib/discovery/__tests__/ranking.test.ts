import { describe, expect, it } from "vitest";
import { computeTrendingScore, rankProductScore } from "@/lib/discovery/ranking";
import { textMatchScore } from "@/lib/discovery/fuzzy";

describe("discovery ranking", () => {
  it("computes trending score from velocity signals", () => {
    expect(computeTrendingScore({ sales24h: 2, cartAdds: 3, views24h: 10 })).toBe(2 * 3 + 3 * 2 + 10);
  });

  it("ranks exact title match above weak match", () => {
    const metrics = {
      productId: "p1",
      views24h: 5,
      views7d: 20,
      sales24h: 1,
      sales7d: 2,
      cartAdds: 1,
      conversionRate: 0.1,
      trendingScore: 20,
      popularityScore: 40,
      metricsUpdatedAt: new Date().toISOString(),
    };
    const strong = rankProductScore({
      query: "night run",
      title: "Night Run Hoodie",
      artistSlug: "elgrandetoto",
      artistLabel: "ELGRANDETOTO",
      category: "hoodie",
      priceCents: 4500,
      inStock: true,
      publishedAt: new Date().toISOString(),
      productId: "p1",
      likedProductId: "x",
      metrics,
    });
    const weak = rankProductScore({
      query: "night run",
      title: "Other Piece",
      artistSlug: "babygang",
      artistLabel: "BABYGANG",
      category: "hoodie",
      priceCents: 4500,
      inStock: true,
      publishedAt: null,
      productId: "p2",
      likedProductId: "y",
      metrics: null,
    });
    expect(strong).toBeGreaterThan(weak);
  });

  it("fuzzy matches close typos", () => {
    const score = textMatchScore("hoody", "Oversize Hoodie", "ELGRANDETOTO");
    expect(score).toBeGreaterThan(40);
  });
});
