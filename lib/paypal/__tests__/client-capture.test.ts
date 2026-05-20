import { describe, expect, it } from "vitest";
import { extractPayPalCaptureIdFromClientDetails } from "@/lib/paypal/client-capture";

describe("extractPayPalCaptureIdFromClientDetails", () => {
  it("reads capture id from SDK capture payload", () => {
    const id = extractPayPalCaptureIdFromClientDetails({
      purchase_units: [{ payments: { captures: [{ id: "CAPTURE-XYZ" }] } }],
    });
    expect(id).toBe("CAPTURE-XYZ");
  });

  it("returns undefined for malformed payloads", () => {
    expect(extractPayPalCaptureIdFromClientDetails(null)).toBeUndefined();
    expect(extractPayPalCaptureIdFromClientDetails({})).toBeUndefined();
  });
});
