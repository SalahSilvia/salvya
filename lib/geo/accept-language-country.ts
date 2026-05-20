import { normalizeCountryCode } from "@/lib/geo/country-map";

/** Infer country from Accept-Language when IP/geo headers are unavailable (weak fallback). */
export function countryFromAcceptLanguage(acceptLanguage: string | null | undefined): string | null {
  if (!acceptLanguage) return null;
  const al = acceptLanguage.toLowerCase();

  if (/\b(ar-ma|fr-ma|ber-ma)\b/.test(al)) return "MA";
  if (/\ben-gb\b/.test(al)) return "GB";
  // Do not map en-US → US (English browser ≠ US market; use IP/timezone instead).
  if (/\bfr-ch\b/.test(al) || /\bde-ch\b/.test(al)) return "CH";
  if (/\bfr-fr\b/.test(al)) return "FR";
  if (/\bes-es\b/.test(al) || /\bes-mx\b/.test(al)) return "ES";
  if (/\bit-it\b/.test(al)) return "IT";
  if (/\bnl-nl\b/.test(al)) return "NL";
  if (/\bde-de\b/.test(al)) return "DE";

  return null;
}

export function normalizeDetectedCountry(
  raw: string | null | undefined,
  acceptLanguage?: string | null,
): string | null {
  return normalizeCountryCode(raw) ?? countryFromAcceptLanguage(acceptLanguage);
}
