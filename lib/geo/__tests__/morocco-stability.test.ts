import { describe, expect, it } from "vitest";
import {
  inferMoroccoFromDeviceSignals,
  isMoroccoManualLock,
  shouldPreferMoroccoOverEdge,
} from "@/lib/geo/morocco-stability";
import { repairGeoCookieState } from "@/lib/geo/geo-consistency";
import { SALVYA_INTL_LOCALES_HEADER, SALVYA_TZ_OFFSET_HEADER } from "@/lib/geo/morocco-heuristic";
import { resolveShopperCountryDetailed, SALVYA_TZ_HEADER } from "@/lib/geo/resolve-country";

describe("morocco-stability", () => {
  it("Africa/Casablanca is a strong Morocco signal", () => {
    const signal = inferMoroccoFromDeviceSignals({
      timezone: "Africa/Casablanca",
      acceptLanguage: "fr-FR",
      tzOffsetHeader: "60",
      intlLocalesHeader: "fr-FR",
    });
    expect(signal?.strength).toBe("strong");
    expect(signal?.persistable).toBe(true);
  });

  it("fr-MA intl locale is a strong Morocco signal", () => {
    const signal = inferMoroccoFromDeviceSignals({
      timezone: "Europe/Paris",
      acceptLanguage: "fr-FR",
      tzOffsetHeader: "60",
      intlLocalesHeader: "fr-MA,fr-FR",
    });
    expect(signal?.strength).toBe("strong");
  });

  it("should prefer Morocco over FR edge when medium signal exists", () => {
    const signal = inferMoroccoFromDeviceSignals({
      timezone: "Europe/Paris",
      acceptLanguage: "ar-MA,ar;q=0.9",
      tzOffsetHeader: "-60",
      intlLocalesHeader: null,
    });
    expect(shouldPreferMoroccoOverEdge("FR", signal)).toBe(true);
  });

  it("isMoroccoManualLock when manual MA", () => {
    expect(
      isMoroccoManualLock({
        pref: "MA",
        detected: "FR",
        displayCurrency: "MAD",
        geoManual: true,
        geoWeak: false,
        geoResolved: true,
      }),
    ).toBe(true);
  });

  it("repairs manual MA with EUR currency to MAD", () => {
    const repair = repairGeoCookieState({
      pref: "MA",
      detected: "FR",
      displayCurrency: "EUR",
      geoManual: true,
      geoWeak: true,
      geoResolved: false,
    });
    expect(repair.needsCookieWrite).toBe(true);
    expect(repair.state.displayCurrency).toBe("MAD");
    expect(repair.state.geoWeak).toBe(false);
  });
});

describe("resolveShopperCountryDetailed Morocco ISP", () => {
  it("FR edge loses to Africa/Casablanca on first visit", async () => {
    const headers = new Headers({
      "x-vercel-ip-country": "FR",
      [SALVYA_TZ_HEADER]: "Africa/Casablanca",
      "accept-language": "fr-FR",
    });
    const result = await resolveShopperCountryDetailed(headers);
    expect(result.country).toBe("MA");
    expect(result.persistable).toBe(true);
    expect(result.weakDetection).toBe(false);
  });

  it("FR edge loses to fr-MA intl locales", async () => {
    const headers = new Headers({
      "x-vercel-ip-country": "FR",
      [SALVYA_TZ_HEADER]: "Europe/Paris",
      [SALVYA_INTL_LOCALES_HEADER]: "fr-MA,fr-FR",
      [SALVYA_TZ_OFFSET_HEADER]: "60",
    });
    const result = await resolveShopperCountryDetailed(headers);
    expect(result.country).toBe("MA");
    expect(result.persistable).toBe(true);
  });

  it("saved MA pref beats FR edge even with geo_weak flag", async () => {
    const headers = new Headers({ "x-vercel-ip-country": "FR" });
    const result = await resolveShopperCountryDetailed(headers, {
      savedPrefCountry: "MA",
      geoManual: true,
      geoWeak: true,
    });
    expect(result.country).toBe("MA");
    expect(result.source).toBe("cookie");
  });
});
