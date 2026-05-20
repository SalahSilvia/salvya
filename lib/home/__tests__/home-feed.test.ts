import { describe, expect, it } from "vitest";
import { buildHomeFeed } from "@/lib/home/home-feed";
import type { PremiumTrendingCard } from "@/lib/home/premium-trending";

const card = (
  id: string,
  artistSlug: string,
  badge?: PremiumTrendingCard["badge"],
): PremiumTrendingCard => ({
  id,
  kind: "hoodie",
  artistSlug,
  href: `/artist/${artistSlug}/item/x`,
  imageSrc: "/img.jpg",
  title: id,
  priceLabel: "€89",
  artistLabel: artistSlug,
  badge,
});

describe("buildHomeFeed", () => {
  const catalog: PremiumTrendingCard[] = [
    card("elgrandetoto-h-a", "elgrandetoto", "new"),
    card("babygang-h-b", "babygang", "limited"),
    card("babygang-h-c", "babygang"),
    card("babygang-h-d", "babygang"),
    card("babygang-h-e", "babygang"),
    card("inkonnu-h-e", "inkonnu"),
    card("elgrandetoto-h-f", "elgrandetoto"),
  ];

  it("For You lists only personalization-linked products with no trending overlap", () => {
    const plan = buildHomeFeed({
      catalog,
      follows: [{ slug: "babygang", name: "BabyGang", profileImage: "/img.jpg", followedAt: Date.now() }],
      likes: [],
      bagQty: 0,
      isSignedIn: true,
    });

    expect(plan.forYou.length).toBeGreaterThan(0);
    expect(plan.forYou.every((c) => c.artistSlug === "babygang")).toBe(true);

    const trendingIds = new Set(plan.trending.map((c) => c.id));
    for (const c of plan.forYou) {
      expect(trendingIds.has(c.id)).toBe(false);
    }

    expect(plan.commerceSections.includes("limitedDrops")).toBe(true);
    expect(plan.commerceSections.includes("trending")).toBe(true);
  });

  it("guest with no signals gets empty For You but global trending", () => {
    const plan = buildHomeFeed({
      catalog,
      follows: [],
      likes: [],
      bagQty: 0,
      isSignedIn: false,
    });
    expect(plan.forYou.length).toBe(0);
    expect(plan.trending.length).toBeGreaterThan(0);
    expect(plan.commerceSections.includes("trending")).toBe(true);
  });

  it("puts bag CTA first when items in bag", () => {
    const plan = buildHomeFeed({
      catalog,
      follows: [],
      likes: [],
      bagQty: 2,
      isSignedIn: false,
    });
    expect(plan.heroPrimaryHref).toBe("/preview-bag");
    expect(plan.heroPrimaryLabel).toContain("Bag");
  });
});
