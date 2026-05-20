import { describe, expect, it } from "vitest";
import { deriveConfidence } from "@/lib/geo/confidence";

describe("deriveConfidence", () => {
  it("edge is HIGH and not weak", () => {
    const r = deriveConfidence("MA", "edge", [{ country: "MA", source: "edge", weight: 100 }]);
    expect(r.confidence).toBe("HIGH");
    expect(r.weakDetection).toBe(false);
  });

  it("timezone only is LOW and weak", () => {
    const r = deriveConfidence("FR", "timezone", [{ country: "FR", source: "timezone", weight: 88 }]);
    expect(r.confidence).toBe("LOW");
    expect(r.weakDetection).toBe(true);
  });

  it("timezone + locale (no IP) is still LOW and weak", () => {
    const r = deriveConfidence("FR", "timezone", [
      { country: "FR", source: "timezone", weight: 88 },
      { country: "FR", source: "accept-language", weight: 35 },
    ]);
    expect(r.confidence).toBe("LOW");
    expect(r.weakDetection).toBe(true);
  });
});
