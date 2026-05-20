import { beforeEach, describe, expect, it, vi } from "vitest";
import { resolveServerCheckoutQuote } from "@/lib/orders/resolve-server-checkout";
import type { OrderLineItem } from "@/lib/orders/types";
import type { StorefrontProductWithVariants } from "@/lib/catalog/attach-variants-to-products";

const fetchPublishedProductBySlug = vi.fn();
const getUserMarket = vi.fn();

vi.mock("@/lib/catalog/fetch-published-products", () => ({
  fetchPublishedProductBySlug: (...args: unknown[]) => fetchPublishedProductBySlug(...args),
}));

vi.mock("@/lib/market/get-user-market", () => ({
  getUserMarket: (...args: unknown[]) => getUserMarket(...args),
}));

const hasActiveCheckoutStockReservation = vi.fn();

vi.mock("@/lib/inventory/checkout-reservation", () => ({
  hasActiveCheckoutStockReservation: (...args: unknown[]) => hasActiveCheckoutStockReservation(...args),
}));

const product: StorefrontProductWithVariants = {
  id: "p1",
  artistSlug: "elgrandetoto",
  slug: "night-run",
  title: "Night Run Hoodie",
  subtitle: null,
  description: null,
  priceCents: 4500,
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
  stock: 3,
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
      stock: 3,
      priceDeltaCents: 0,
      sku: "night-run-m-default",
      imageOverride: null,
      soldOut: false,
    },
  ],
};

const lineItem: OrderLineItem = {
  artistSlug: "elgrandetoto",
  itemSlug: "night-run",
  productKind: "hoodie",
  displayTitle: "Hacked title",
  priceLabel: "€1 · Hoodie",
  kindLabel: "Hoodie",
  qty: 1,
  size: "M",
  colorId: "default",
  colorLabel: "Default",
  variantId: "v1",
};

describe("resolveServerCheckoutQuote", () => {
  beforeEach(() => {
    fetchPublishedProductBySlug.mockReset();
    getUserMarket.mockReset();
    hasActiveCheckoutStockReservation.mockReset();
    hasActiveCheckoutStockReservation.mockResolvedValue(false);
    getUserMarket.mockResolvedValue({
      marketCode: "EU",
      currency: "EUR",
      countryCode: "FR",
      source: "profile",
    });
  });

  it("rejects when product is missing", async () => {
    fetchPublishedProductBySlug.mockResolvedValue(null);
    const result = await resolveServerCheckoutQuote(lineItem);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(404);
  });

  it("rejects out of stock", async () => {
    fetchPublishedProductBySlug.mockResolvedValue({
      ...product,
      stock: 0,
      soldOut: true,
      variants: [{ ...product.variants[0]!, stock: 0, soldOut: true }],
    });
    const result = await resolveServerCheckoutQuote(lineItem);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("out_of_stock");
  });

  it("allows checkout when stock is held for this session", async () => {
    fetchPublishedProductBySlug.mockResolvedValue({
      ...product,
      stock: 0,
      soldOut: true,
      variants: [{ ...product.variants[0]!, stock: 0, soldOut: true }],
    });
    hasActiveCheckoutStockReservation.mockResolvedValue(true);
    const result = await resolveServerCheckoutQuote(lineItem, null, {
      checkoutSessionId: "session-abc",
    });
    expect(result.ok).toBe(true);
    expect(hasActiveCheckoutStockReservation).toHaveBeenCalledWith("v1", 1, "session-abc");
  });

  it("uses server market price and ignores client label", async () => {
    fetchPublishedProductBySlug.mockResolvedValue(product);
    const result = await resolveServerCheckoutQuote(lineItem);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.quote.priceLabel).toContain("45");
    expect(result.quote.priceLabel).not.toContain("€1");
    expect(result.quote.productSnapshot.currency).toBe("EUR");
    expect(result.quote.productSnapshot.unitPrice).toBe(45);
    expect(result.quote.productSnapshot.marketCode).toBe("EU");
    expect(result.quote.lineTotal.unitAmount).toBe(45);
  });
});
