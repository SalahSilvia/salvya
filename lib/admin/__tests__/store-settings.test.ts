import { describe, expect, it } from "vitest";
import { sanitizeStoreSettingsSection } from "@/lib/admin/store-settings";

describe("sanitizeStoreSettingsSection", () => {
  it("clamps shipping processing days", () => {
    const out = sanitizeStoreSettingsSection("shipping", { estimatedProcessingDays: 99 });
    expect(out.estimatedProcessingDays).toBe(30);
  });

  it("defaults paypal mode to sandbox", () => {
    const out = sanitizeStoreSettingsSection("payments", { paypalMode: "invalid" });
    expect(out.paypalMode).toBe("sandbox");
  });

  it("sanitizes platform faviconUrl", () => {
    const out = sanitizeStoreSettingsSection("platform", {
      faviconUrl: "https://cdn.example.com/site/favicon.png",
    });
    expect(out.faviconUrl).toBe("https://cdn.example.com/site/favicon.png");
    const bad = sanitizeStoreSettingsSection("platform", { faviconUrl: "//evil.com/x" });
    expect(bad.faviconUrl).toBeNull();
  });
});
