import { describe, expect, it, vi, afterEach } from "vitest";
import { auditPayPalEnvironment } from "@/lib/paypal/env-validation";

describe("auditPayPalEnvironment", () => {
  const env = process.env;

  afterEach(() => {
    process.env = env;
  });

  it("warns when public client id is missing", () => {
    process.env = { ...env, NEXT_PUBLIC_PAYPAL_CLIENT_ID: "", PAYPAL_CLIENT_SECRET: "secret" };
    const report = auditPayPalEnvironment();
    expect(report.warnings.some((w) => w.includes("NEXT_PUBLIC_PAYPAL_CLIENT_ID"))).toBe(true);
  });

  it("warns when public and server client ids differ", () => {
    process.env = {
      ...env,
      NEXT_PUBLIC_PAYPAL_CLIENT_ID: "public-id",
      PAYPAL_CLIENT_ID: "other-id",
      PAYPAL_CLIENT_SECRET: "secret",
    };
    const report = auditPayPalEnvironment();
    expect(report.warnings.some((w) => w.includes("differ"))).toBe(true);
  });
});
