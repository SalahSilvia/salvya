import { describe, expect, it } from "vitest";
import type { MarketContext } from "@/lib/market/market-context";
import { resolveDisplayPrice } from "@/lib/market/resolve-display-price";
import type { ProductPricingSource } from "@/lib/market/product-pricing";

const euContext: MarketContext = {
  marketCode: "EU",
  currency: "EUR",
  displayCurrency: "EUR",
  countryCode: "FR",
  locale: "fr",
  originalBaseCurrency: "EUR",
  source: "cookie",
};

const maContext: MarketContext = {
  marketCode: "MA",
  currency: "MAD",
  displayCurrency: "MAD",
  countryCode: "MA",
  locale: "fr",
  originalBaseCurrency: "EUR",
  source: "cookie",
};

const hoodie: ProductPricingSource = {
  id: "h1",
  category: "hoodie",
  priceCents: 4500,
  priceEur: 45,
  priceUsd: 49,
  priceMad: 250,
  marketPrices: {
    MA: { currency: "MAD", price: 250 },
    EU: { currency: "EUR", price: 45 },
    US: { currency: "USD", price: 49 },
  },
};

describe("resolveDisplayPrice", () => {
  it("returns EU market price and EUR base", () => {
    const r = resolveDisplayPrice(hoodie, euContext);
    expect(r.currency).toBe("EUR");
    expect(r.market).toBe("EU");
    expect(r.unitAmount).toBe(45);
    expect(r.originalBaseCents).toBe(4500);
    expect(r.displayPrice).toMatch(/45/);
  });

  it("returns MAD for Morocco market", () => {
    const r = resolveDisplayPrice(hoodie, maContext);
    expect(r.currency).toBe("MAD");
    expect(r.unitAmount).toBe(250);
    expect(r.displayPrice).toMatch(/250/);
  });

  it("scales qty without changing market", () => {
    const r = resolveDisplayPrice(hoodie, euContext, { qty: 2 });
    expect(r.unitAmount).toBe(90);
    expect(r.originalBaseCents).toBe(9000);
  });

  it("keeps EU tier when display currency is GBP (FX only)", () => {
    const frGbp: MarketContext = { ...euContext, displayCurrency: "GBP", countryCode: "FR" };
    const r = resolveDisplayPrice(hoodie, frGbp);
    expect(r.market).toBe("EU");
    expect(r.currency).toBe("GBP");
    expect(r.unitAmount).toBeGreaterThan(35);
    expect(r.unitAmount).toBeLessThan(50);
  });

  it("uses Morocco tier even when display currency is EUR", () => {
    const maEur: MarketContext = { ...maContext, displayCurrency: "EUR" };
    const r = resolveDisplayPrice(hoodie, maEur);
    expect(r.market).toBe("MA");
    expect(r.currency).toBe("EUR");
    expect(r.unitAmount).toBeGreaterThan(20);
    expect(r.unitAmount).toBeLessThan(30);
  });
});
