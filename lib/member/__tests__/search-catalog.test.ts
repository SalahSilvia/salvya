import { describe, expect, it } from "vitest";
import type { StorefrontProduct } from "@/lib/catalog/storefront-product";
import {
  mergeSearchProductHits,
  storefrontProductToSearchHit,
  type SearchProductHit,
} from "@/lib/member/search-catalog";

const sampleProduct: StorefrontProduct = {
  id: "prod-1",
  artistSlug: "elgrandetoto",
  slug: "night-run",
  title: "Night Run Hoodie",
  subtitle: null,
  description: null,
  priceCents: 4500,
  priceEur: 45,
  priceUsd: 49,
  priceMad: 250,
  marketPrices: { EU: { currency: "EUR", price: 45 } },
  compareAtCents: null,
  category: "hoodie",
  productKind: "hoodie",
  images: ["https://cdn.example/hoodie.jpg"],
  stock: 3,
  soldOut: false,
  lowStock: false,
  isLimitedDrop: true,
  badge: "new",
  sizes: ["M", "L"],
  colors: [],
  sizeFit: null,
  material: null,
  featured: true,
  preorder: false,
  preorderShipDate: null,
  metaTitle: null,
  metaDescription: null,
  publishedAt: "2025-01-01T00:00:00.000Z",
};

const euMarket = {
  marketCode: "EU" as const,
  currency: "EUR" as const,
  displayCurrency: "EUR" as const,
  countryCode: "FR",
  locale: "en" as const,
  originalBaseCurrency: "EUR" as const,
  source: "default" as const,
};

describe("storefrontProductToSearchHit", () => {
  it("maps published catalog rows to searchable hits", () => {
    const hit = storefrontProductToSearchHit(sampleProduct, euMarket);
    expect(hit.title).toBe("Night Run Hoodie");
    expect(hit.href).toBe("/artist/elgrandetoto/item/night-run");
    expect(hit.priceLabel).toContain("45");
    expect(hit.artistSlug).toBe("elgrandetoto");
    expect(hit.kind).toBe("hoodie");
  });
});

describe("mergeSearchProductHits", () => {
  it("prefers primary hits and drops duplicate hrefs", () => {
    const primary: SearchProductHit[] = [
      {
        id: "db-1",
        productId: "p1",
        kind: "hoodie",
        href: "/artist/elgrandetoto/item/night-run",
        imageSrc: "/a.jpg",
        title: "Night Run Hoodie",
        priceLabel: "€89.00 · Hoodie",
        artistLabel: "ELGRANDETOTO",
        artistSlug: "elgrandetoto",
      },
    ];
    const secondary: SearchProductHit[] = [
      {
        id: "folder-1",
        productId: "p2",
        kind: "hoodie",
        href: "/artist/elgrandetoto/item/night-run",
        imageSrc: "/b.jpg",
        title: "Folder duplicate",
        priceLabel: "€89",
        artistLabel: "ELGRANDETOTO",
        artistSlug: "elgrandetoto",
      },
      {
        id: "folder-2",
        productId: "p3",
        kind: "tshirt",
        href: "/artist/elgrandetoto/tshirt/blue-wave",
        imageSrc: "/c.jpg",
        title: "Blue Wave Tee",
        priceLabel: "€49",
        artistLabel: "ELGRANDETOTO",
        artistSlug: "elgrandetoto",
      },
    ];

    const merged = mergeSearchProductHits(primary, secondary);
    expect(merged).toHaveLength(2);
    expect(merged[0]?.title).toBe("Night Run Hoodie");
    expect(merged[1]?.title).toBe("Blue Wave Tee");
  });
});
