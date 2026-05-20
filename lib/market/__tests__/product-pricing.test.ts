import { describe, expect, it } from "vitest";
import { getMarketPrice, pricingFromProductRow } from "@/lib/market/product-pricing";

describe("getMarketPrice", () => {
  const hoodie = pricingFromProductRow({
    id: "h1",
    category: "hoodie",
    price_cents: 4500,
    price_eur: 45,
    price_usd: 49,
    price_mad: 250,
    market_prices: {
      MA: { currency: "MAD", price: 250 },
      EU: { currency: "EUR", price: 45 },
      US: { currency: "USD", price: 49 },
    },
  });

  it("returns Morocco MAD price", () => {
    const ma = getMarketPrice(hoodie, "MA");
    expect(ma.currency).toBe("MAD");
    expect(ma.unitAmount).toBe(250);
    expect(ma.displayPrice).toMatch(/250/);
  });

  it("returns Europe EUR price", () => {
    const eu = getMarketPrice(hoodie, "EU");
    expect(eu.currency).toBe("EUR");
    expect(eu.unitAmount).toBe(45);
  });

  it("returns USA USD price", () => {
    const us = getMarketPrice(hoodie, "US");
    expect(us.currency).toBe("USD");
    expect(us.unitAmount).toBe(49);
  });

  it("falls back to column defaults when market_prices entry missing", () => {
    const tee = pricingFromProductRow({
      id: "t1",
      category: "tee",
      price_cents: 2800,
      price_eur: 28,
      price_usd: 30,
      price_mad: 175,
      market_prices: {},
    });
    expect(getMarketPrice(tee, "EU").unitAmount).toBe(28);
    expect(getMarketPrice(tee, "US").unitAmount).toBe(30);
    expect(getMarketPrice(tee, "MA").unitAmount).toBe(175);
  });
});
