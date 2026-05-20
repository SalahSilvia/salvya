import { describe, expect, it } from "vitest";
import { shouldPersistPrefCountry } from "@/lib/geo/persist-policy";

describe("shouldPersistPrefCountry", () => {
  it("allows edge and ip", () => {
    expect(shouldPersistPrefCountry({ source: "edge", geoManual: false, weakDetection: false })).toBe(true);
    expect(shouldPersistPrefCountry({ source: "ip", geoManual: false, weakDetection: false })).toBe(true);
  });

  it("blocks timezone-only weak", () => {
    expect(
      shouldPersistPrefCountry({ source: "timezone", geoManual: false, weakDetection: true }),
    ).toBe(false);
  });

  it("allows manual", () => {
    expect(shouldPersistPrefCountry({ source: "manual", geoManual: true, weakDetection: false })).toBe(true);
  });
});
