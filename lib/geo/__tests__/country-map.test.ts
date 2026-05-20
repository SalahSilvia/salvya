import { describe, expect, it } from "vitest";
import {
  geoProfileForCountry,
  isMappedCountry,
  localeForMorocco,
} from "@/lib/geo/country-map";
import { buildGeoSuggestion } from "@/lib/geo/preferences";

describe("geoProfileForCountry", () => {
  it("maps Italy to Italian and EUR", () => {
    const p = geoProfileForCountry("IT");
    expect(p.locale).toBe("it");
    expect(p.currency).toBe("EUR");
    expect(p.countryName).toBe("Italy");
  });

  it("maps Morocco with French by default", () => {
    const p = geoProfileForCountry("MA", "en-US,en;q=0.9");
    expect(p.locale).toBe("fr");
    expect(p.currency).toBe("MAD");
  });

  it("maps Morocco to Arabic when Accept-Language prefers ar", () => {
    expect(localeForMorocco("ar-MA,ar;q=0.9,fr;q=0.8")).toBe("ar");
  });

  it("maps United States to English and USD", () => {
    const p = geoProfileForCountry("US");
    expect(p.locale).toBe("en");
    expect(p.currency).toBe("USD");
  });

  it("maps Switzerland to French and CHF", () => {
    const p = geoProfileForCountry("CH");
    expect(p.locale).toBe("fr");
    expect(p.currency).toBe("CHF");
  });

  it("maps United Kingdom to English and GBP", () => {
    const p = geoProfileForCountry("GB");
    expect(p.currency).toBe("GBP");
  });
});

describe("buildGeoSuggestion", () => {
  it("does not prompt when region was auto-applied (not manual)", () => {
    const s = buildGeoSuggestion(
      { detectedCountry: "MA", prefCountry: "FR", displayCurrency: "EUR", geoResolved: true, geoManual: false },
      "fr",
    );
    expect(s).toBeNull();
  });

  it("does not prompt when manual country matches detection (even if locale differs)", () => {
    const s = buildGeoSuggestion(
      {
        detectedCountry: "IT",
        prefCountry: "IT",
        displayCurrency: "EUR",
        geoResolved: true,
        geoManual: true,
      },
      "en",
    );
    expect(s).toBeNull();
  });

  it("returns null when already resolved and preferences match", () => {
    const s = buildGeoSuggestion(
      { detectedCountry: "IT", prefCountry: "IT", displayCurrency: "EUR", geoResolved: true, geoManual: false },
      "it",
    );
    expect(s).toBeNull();
  });

  it("suggests again when detected country changes after manual pick", () => {
    const s = buildGeoSuggestion(
      { detectedCountry: "MA", prefCountry: "FR", displayCurrency: "EUR", geoResolved: true, geoManual: true },
      "fr",
    );
    expect(s?.suggestedCurrency).toBe("MAD");
  });
});
