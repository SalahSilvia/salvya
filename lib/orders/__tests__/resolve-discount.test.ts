import { describe, expect, it } from "vitest";
import { resolveCheckoutDiscount } from "@/lib/orders/resolve-discount";

describe("resolveCheckoutDiscount", () => {
  it("rejects discount without coupon code", () => {
    const out = resolveCheckoutDiscount("250 DH", 1, undefined, 500);
    expect("error" in out).toBe(true);
  });

  it("accepts valid SALVYA10 on MAD cart", () => {
    const out = resolveCheckoutDiscount("250 DH", 1, "SALVYA10", 2500);
    expect("error" in out).toBe(false);
    if (!("error" in out)) {
      expect(out.discountCents).toBe(2500);
      expect(out.couponCode).toBe("SALVYA10");
    }
  });

  it("rejects tampered discount amount", () => {
    const out = resolveCheckoutDiscount("250 DH", 1, "SALVYA10", 100);
    expect("error" in out).toBe(true);
  });
});
