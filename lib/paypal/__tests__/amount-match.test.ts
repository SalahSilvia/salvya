import { describe, expect, it } from "vitest";
import { normalizePayPalCurrency, paypalAmountsMatch } from "@/lib/paypal/amount-match";

describe("paypalAmountsMatch", () => {
  it("matches equal decimal strings", () => {
    expect(paypalAmountsMatch("25.00", "25")).toBe(true);
    expect(paypalAmountsMatch("10.50", "10.5")).toBe(true);
  });

  it("rejects mismatched amounts", () => {
    expect(paypalAmountsMatch("25.00", "24.99")).toBe(false);
    expect(paypalAmountsMatch("not-a-number", "25")).toBe(false);
  });
});

describe("normalizePayPalCurrency", () => {
  it("uppercases and trims currency codes", () => {
    expect(normalizePayPalCurrency("usd")).toBe("USD");
    expect(normalizePayPalCurrency(" eur ")).toBe("EUR");
  });
});
