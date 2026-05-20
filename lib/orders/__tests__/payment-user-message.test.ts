import { describe, expect, it } from "vitest";
import { paymentErrorMessage } from "@/lib/orders/payment-user-message";

describe("paymentErrorMessage", () => {
  it("maps duplicate_payment to shopper-friendly copy", () => {
    expect(paymentErrorMessage("raw", "duplicate_payment")).toMatch(/already used/i);
  });

  it("maps checkout_expired", () => {
    expect(paymentErrorMessage("x", "checkout_expired")).toMatch(/expired/i);
  });

  it("maps amount_mismatch", () => {
    expect(paymentErrorMessage("x", "amount_mismatch")).toMatch(/did not match/i);
  });

  it("maps paypal_api_error", () => {
    expect(paymentErrorMessage("x", "paypal_api_error")).toMatch(/temporarily unavailable/i);
  });
});
