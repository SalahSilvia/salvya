import { describe, expect, it } from "vitest";
import { CHECKOUT_SESSION_MAX_AGE_MS, isCheckoutSessionExpired } from "@/lib/checkout/session-guard";

describe("isCheckoutSessionExpired", () => {
  it("expires sessions older than max age", () => {
    const old = Date.now() - CHECKOUT_SESSION_MAX_AGE_MS - 1000;
    expect(isCheckoutSessionExpired(old)).toBe(true);
  });

  it("accepts fresh sessions", () => {
    expect(isCheckoutSessionExpired(Date.now())).toBe(false);
  });
});
