import { describe, expect, it, vi, beforeEach } from "vitest";
import { resolveHoodieCheckoutProduct, resolveTshirtCheckoutProduct } from "@/lib/catalog/resolve-checkout-product";
import type { StorefrontProductWithVariants } from "@/lib/catalog/attach-variants-to-products";

const fetchPublishedProductBySlug = vi.fn();

vi.mock("@/lib/catalog/fetch-published-products", () => ({
  fetchPublishedProductBySlug: (...args: unknown[]) => fetchPublishedProductBySlug(...args),
}));

vi.mock("@/lib/market/get-user-market", () => ({
  getUserMarket: vi.fn().mockResolvedValue({
    marketCode: "EU",
    currency: "EUR",
    countryCode: "FR",
    source: "default",
  }),
}));

const hoodieProduct: StorefrontProductWithVariants = {
  id: "p1",
  artistSlug: "elgrandetoto",
  slug: "night-run",
  title: "Night Run Hoodie",
  subtitle: null,
  description: null,
  priceCents: 8900,
  priceEur: 45,
  priceUsd: 49,
  priceMad: 250,
  marketPrices: {
    MA: { currency: "MAD", price: 250 },
    EU: { currency: "EUR", price: 45 },
    US: { currency: "USD", price: 49 },
  },
  compareAtCents: null,
  category: "hoodie",
  productKind: "hoodie",
  images: ["https://cdn.example/hoodie.jpg"],
  stock: 2,
  soldOut: false,
  lowStock: false,
  isLimitedDrop: false,
  badge: null,
  sizes: ["M"],
  colors: [],
  sizeFit: null,
  material: null,
  featured: true,
  preorder: false,
  preorderShipDate: null,
  metaTitle: null,
  metaDescription: null,
  publishedAt: "2025-01-01T00:00:00.000Z",
  variants: [
    {
      id: "v1",
      productId: "p1",
      size: "M",
      color: "default",
      stock: 2,
      priceDeltaCents: 0,
      sku: "night-run-m",
      imageOverride: null,
      soldOut: false,
    },
  ],
};

describe("resolve checkout (Supabase only)", () => {
  beforeEach(() => {
    fetchPublishedProductBySlug.mockReset();
  });

  it("returns null when product is not in database", async () => {
    fetchPublishedProductBySlug.mockResolvedValue(null);
    const result = await resolveHoodieCheckoutProduct("elgrandetoto", "missing");
    expect(result).toBeNull();
  });

  it("returns DB product context with price and soldOut", async () => {
    fetchPublishedProductBySlug.mockResolvedValue(hoodieProduct);
    const result = await resolveHoodieCheckoutProduct("elgrandetoto", "night-run", {
      qty: 1,
      size: "M",
      colorId: "default",
      colorLabel: "Default",
    });
    expect(result).not.toBeNull();
    expect(result?.productId).toBe("p1");
    expect(result?.variantId).toBe("v1");
    expect(result?.priceCents).toBe(4500);
    expect(result?.priceLabel).toContain("45");
    expect(result?.soldOut).toBe(false);
    expect(result?.displayTitle).toBe("Night Run Hoodie");
  });

  it("rejects wrong product kind for tshirt resolver", async () => {
    fetchPublishedProductBySlug.mockResolvedValue(hoodieProduct);
    const result = await resolveTshirtCheckoutProduct("elgrandetoto", "night-run");
    expect(result).toBeNull();
  });
});
