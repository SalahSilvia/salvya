import { afterEach, describe, expect, it } from "vitest";
import { computePayPalCheckoutTotal } from "@/lib/paypal/checkout-amount";

describe("computePayPalCheckoutTotal", () => {
  const env = process.env;

  afterEach(() => {
    process.env = env;
  });

  it("converts MAD line × qty to USD for PayPal", () => {
    process.env.SALVYA_FX_MAD_USD = "0.1";
    process.env.PAYPAL_CHECKOUT_CURRENCY = "USD";
    const out = computePayPalCheckoutTotal("250 DH", 2, 0);
    expect(out.currency_code).toBe("USD");
    expect(out.value).toBe("50.00");
  });

  it("applies discount before currency conversion", () => {
    process.env.SALVYA_FX_MAD_USD = "0.1";
    process.env.PAYPAL_CHECKOUT_CURRENCY = "USD";
    const out = computePayPalCheckoutTotal("250 DH", 1, 5000);
    expect(out.currency_code).toBe("USD");
    expect(out.value).toBe("20.00");
  });

  it("uses EUR for euro-priced items when PayPal currency is EUR", () => {
    process.env.PAYPAL_CHECKOUT_CURRENCY = "EUR";
    const out = computePayPalCheckoutTotal("€49.00", 1, 0, { priceCents: 4900 });
    expect(out.currency_code).toBe("EUR");
    expect(out.value).toBe("49.00");
  });
});
