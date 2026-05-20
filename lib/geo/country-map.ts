import type { AppLocale } from "@/i18n/routing";
import type { CurrencyCode } from "@/lib/currency/config";

export type CountryCode =
  | "MA"
  | "IT"
  | "ES"
  | "FR"
  | "NL"
  | "US"
  | "GB"
  | "DE"
  | "BE"
  | "CH"
  | "EU"
  | string;

export type GeoCountryProfile = {
  countryCode: string;
  countryName: string;
  flag: string;
  currency: CurrencyCode;
  /** Primary suggested locale for this country. */
  locale: AppLocale;
  /** Alternate locale when relevant (e.g. Morocco → Arabic). */
  alternateLocale?: AppLocale;
};

const PROFILES: Record<string, Omit<GeoCountryProfile, "countryCode">> = {
  MA: { countryName: "Morocco", flag: "🇲🇦", currency: "MAD", locale: "fr", alternateLocale: "ar" },
  FR: { countryName: "France", flag: "🇫🇷", currency: "EUR", locale: "fr" },
  GB: { countryName: "United Kingdom", flag: "🇬🇧", currency: "GBP", locale: "en" },
  IT: { countryName: "Italy", flag: "🇮🇹", currency: "EUR", locale: "it" },
  ES: { countryName: "Spain", flag: "🇪🇸", currency: "EUR", locale: "es" },
  NL: { countryName: "Netherlands", flag: "🇳🇱", currency: "EUR", locale: "nl" },
  DE: { countryName: "Germany", flag: "🇩🇪", currency: "EUR", locale: "en" },
  US: { countryName: "United States", flag: "🇺🇸", currency: "USD", locale: "en" },
  CH: { countryName: "Switzerland", flag: "🇨🇭", currency: "CHF", locale: "fr" },
  EU: { countryName: "Europe (other)", flag: "🇪🇺", currency: "EUR", locale: "en" },
};

const FALLBACK_PROFILE: Omit<GeoCountryProfile, "countryCode"> = {
  countryName: "International",
  flag: "🌍",
  currency: "EUR",
  locale: "en",
};

export function normalizeCountryCode(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== "string") return null;
  const c = raw.trim().toUpperCase();
  if (c.length !== 2 || c === "XX" || c === "T1") return null;
  return c;
}

/** Pick Moroccan locale from Accept-Language when available. */
export function localeForMorocco(acceptLanguage: string | null): AppLocale {
  const al = (acceptLanguage ?? "").toLowerCase();
  if (/\bar(-|_|,|;|$)/.test(al) || al.startsWith("ar")) return "ar";
  if (/\bfr(-|_|,|;|$)/.test(al) || al.startsWith("fr")) return "fr";
  return "fr";
}

export function geoProfileForCountry(
  countryCode: string | null,
  acceptLanguage?: string | null,
): GeoCountryProfile {
  const code = normalizeCountryCode(countryCode) ?? "EU";
  const base = PROFILES[code] ?? FALLBACK_PROFILE;
  const locale = code === "MA" ? localeForMorocco(acceptLanguage ?? null) : base.locale;
  return {
    countryCode: code,
    ...base,
    locale,
  };
}

export function isMappedCountry(countryCode: string | null): boolean {
  const code = normalizeCountryCode(countryCode);
  return code !== null && code in PROFILES;
}

export function currencyForCountry(countryCode: string | null): CurrencyCode {
  return geoProfileForCountry(countryCode).currency;
}
