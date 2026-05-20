import type { CatalogImportRow } from "@/lib/catalog/catalog-import";

/** Minimal valid import row for unit tests. */
export function catalogImportRowFixture(overrides: Partial<CatalogImportRow> = {}): CatalogImportRow {
  return {
    importKey: "artist|tee|item",
    source: "folder_tee",
    artistSlug: "artist",
    slug: "item-tee",
    category: "tee",
    title: "Test tee",
    description: null,
    priceCents: 1750,
    priceEur: 17.5,
    priceUsd: 19,
    priceMad: 175,
    marketPrices: { EU: { currency: "EUR", price: 17.5 } },
    images: ["https://cdn.example/front.jpg"],
    stock: 12,
    isLimitedDrop: false,
    publishState: "published",
    metadata: {},
    ...overrides,
  };
}
