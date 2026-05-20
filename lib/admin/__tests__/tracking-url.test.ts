import { describe, expect, it } from "vitest";
import { buildCarrierTrackingUrl } from "@/lib/admin/tracking-url";

describe("buildCarrierTrackingUrl", () => {
  it("builds DHL URL with encoded tracking id", () => {
    const url = buildCarrierTrackingUrl("dhl", "ABC 123");
    expect(url).toContain("dhl.com");
    expect(url).toContain(encodeURIComponent("ABC 123"));
  });

  it("returns null for empty tracking", () => {
    expect(buildCarrierTrackingUrl("ups", "  ")).toBeNull();
  });

  it("returns null for unknown carrier", () => {
    expect(buildCarrierTrackingUrl("other", "X1")).toBeNull();
  });
});
