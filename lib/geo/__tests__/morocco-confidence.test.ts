import { describe, expect, it } from "vitest";
import type { GeoCookieState } from "@/lib/geo/cookie-state";
import {
  MOROCCO_WIN_THRESHOLD,
  scoreMoroccoConfidence,
  shouldEdgeYieldToMorocco,
} from "@/lib/geo/morocco-confidence";

function cookie(partial: Partial<GeoCookieState>): GeoCookieState {
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

describe("scoreMoroccoConfidence", () => {
  it("Casablanca + fr browser beats FR edge alone", () => {
    const r = scoreMoroccoConfidence({
      cookieState: cookie({}),
      timezone: "Africa/Casablanca",
      acceptLanguage: "fr-FR,fr;q=0.9",
      edgeCountry: "FR",
    });
    expect(r.score).toBeGreaterThanOrEqual(MOROCCO_WIN_THRESHOLD);
    expect(r.wins).toBe(true);
    expect(shouldEdgeYieldToMorocco("FR", r)).toBe(true);
  });

  it("geo_locked forces win regardless of edge", () => {
    const r = scoreMoroccoConfidence({
      cookieState: cookie({ geoLocked: true, pref: "MA", displayCurrency: "MAD" }),
      edgeCountry: "FR",
    });
    expect(r.wins).toBe(true);
    expect(r.score).toBeGreaterThanOrEqual(100);
  });

  it("adds Morocco-first default bias when score is below threshold", () => {
    const r = scoreMoroccoConfidence({
      cookieState: cookie({}),
      edgeCountry: null,
    });
    expect(r.breakdown.morocco_first_default).toBe(30);
    expect(r.score).toBe(30);
    expect(r.wins).toBe(false);
  });
});
