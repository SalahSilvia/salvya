import { describe, expect, it } from "vitest";
import { applyCouponToSubtotal, normalizeCouponCode } from "@/lib/checkout/coupons";

describe("coupons", () => {
  it("normalizes codes", () => {
    expect(normalizeCouponCode("  salvya10 ")).toBe("SALVYA10");
  });

  it("applies percent discount", () => {
    const r = applyCouponToSubtotal("SALVYA10", 5000, "€50");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.discountCents).toBe(500);
  });

  it("rejects unknown code", () => {
    const r = applyCouponToSubtotal("NOPE", 5000, "€50");
    expect(r.ok).toBe(false);
  });
});
