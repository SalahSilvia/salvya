import { describe, expect, it } from "vitest";
import type { GeoCookieState } from "@/lib/geo/cookie-state";
import { resolveRegionSync } from "@/lib/geo/resolve-region";

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

describe("resolveRegionSync", () => {
  it("defaults to MA/MAD when edge and cookies are empty", () => {
    const r = resolveRegionSync({ cookieState: cookie({}) });
    expect(r.country).toBe("MA");
    expect(r.currency).toBe("MAD");
    expect(r.marketCode).toBe("MA");
    expect(r.source).toBe("morocco_default");
  });

  it("FR edge yields to Casablanca timezone signals", () => {
    const headers = new Headers({
      "x-vercel-ip-country": "FR",
      "x-salvya-timezone": "Africa/Casablanca",
      "accept-language": "fr-FR,fr;q=0.9",
    });
    const r = resolveRegionSync({ cookieState: cookie({}), headers });
    expect(r.country).toBe("MA");
    expect(r.currency).toBe("MAD");
  });

  it("respects geo lock over FR edge", () => {
    const headers = new Headers({ "x-vercel-ip-country": "FR" });
    const r = resolveRegionSync({
      cookieState: cookie({ geoLocked: true, pref: "MA", displayCurrency: "MAD" }),
      headers,
    });
    expect(r.country).toBe("MA");
    expect(r.source).toBe("locked");
  });
});
