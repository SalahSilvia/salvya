import { describe, expect, it } from "vitest";
import {
  isPreferenceLanguageCode,
  normalizePreferenceLanguage,
  preferenceLanguageLabel,
  PREFERENCE_LANGUAGE_CODES,
} from "@/lib/account/preference-languages";

describe("preference-languages", () => {
  it("lists six supported languages", () => {
    expect(PREFERENCE_LANGUAGE_CODES).toEqual(["en", "fr", "es", "it", "ar", "nl"]);
  });

  it("normalizes unknown codes to English", () => {
    expect(normalizePreferenceLanguage("de")).toBe("en");
    expect(normalizePreferenceLanguage("")).toBe("en");
    expect(normalizePreferenceLanguage(null)).toBe("en");
  });

  it("accepts valid codes case-insensitively", () => {
    expect(normalizePreferenceLanguage("FR")).toBe("fr");
    expect(isPreferenceLanguageCode("es")).toBe(true);
  });

  it("returns English labels for dropdown", () => {
    expect(preferenceLanguageLabel("fr")).toBe("French");
    expect(preferenceLanguageLabel("nl")).toBe("Dutch");
  });
});
