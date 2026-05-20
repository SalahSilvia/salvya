import { afterEach, describe, expect, it } from "vitest";
import { computePayPalAmountFromCheckout } from "@/lib/currency/convert";

describe("computePayPalAmountFromCheckout", () => {
  const env = process.env;

  afterEach(() => {
    process.env = env;
  });

  it("converts MAD line × qty to USD using SALVYA_FX_MAD_USD", () => {
    process.env.SALVYA_FX_MAD_USD = "0.1";
    process.env.PAYPAL_CHECKOUT_CURRENCY = "USD";
    const out = computePayPalAmountFromCheckout("250 DH", 2, 0);
    expect(out.currency_code).toBe("USD");
    expect(out.value).toBe("50.00");
  });

  it("converts EUR catalog cents to USD for PayPal", () => {
    process.env.SALVYA_BASE_CURRENCY = "EUR";
    process.env.PAYPAL_CHECKOUT_CURRENCY = "USD";
    process.env.SALVYA_FX_EUR_USD = "1.08";
    const out = computePayPalAmountFromCheckout("€49.00 · Hoodie", 1, 0, { priceCents: 4900 });
    expect(out.currency_code).toBe("USD");
    expect(out.value).toBe("52.92");
  });

  it("keeps EUR when PayPal checkout currency is EUR", () => {
    process.env.PAYPAL_CHECKOUT_CURRENCY = "EUR";
    const out = computePayPalAmountFromCheckout("€49.00", 1, 0, { priceCents: 4900 });
    expect(out.currency_code).toBe("EUR");
    expect(out.value).toBe("49.00");
  });
});
