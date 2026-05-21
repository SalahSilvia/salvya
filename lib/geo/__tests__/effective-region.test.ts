import { describe, expect, it } from "vitest";
import type { GeoCookieState } from "@/lib/geo/cookie-state";
import { selectedCountryFromCookieState } from "@/lib/geo/effective-region";

function state(partial: Partial<GeoCookieState>): GeoCookieState {
  return {
    pref: null,
    detected: null,
    displayCurrency: null,
    geoManual: false,
    geoLocked: false,
    geoWeak: false,
    geoResolved: false,
    ...partial,
  };
}

describe("selectedCountryFromCookieState", () => {
  it("prefers manual pref over detected", () => {
    expect(
      selectedCountryFromCookieState(
        state({ geoManual: true, pref: "FR", detected: "MA" }),
      ),
    ).toBe("FR");
  });

  it("prefers saved pref cookie over edge hint", () => {
    expect(
      selectedCountryFromCookieState(state({ pref: "MA", detected: "FR" }), "FR"),
    ).toBe("MA");
  });

  it("uses detected when geo_resolved and no pref", () => {
    expect(
      selectedCountryFromCookieState(
        state({ geoResolved: true, detected: "MA" }),
        "FR",
      ),
    ).toBe("MA");
  });

  it("ignores detected when weak session", () => {
    expect(
      selectedCountryFromCookieState(
        state({ geoWeak: true, detected: "FR" }),
        "MA",
      ),
    ).toBeNull();
  });
});
