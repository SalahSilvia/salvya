import type { AppLocale } from "@/i18n/routing";
import { defaultLocale, isAppLocale } from "@/i18n/routing";
import { parseDisplayCurrency, type CurrencyCode } from "@/lib/currency/config";
import { geoProfileForCountry, normalizeCountryCode } from "@/lib/geo/country-map";
import type { GeoCookieState } from "@/lib/geo/cookie-state";

export type { GeoCookieState };
import { detectCountryFromHeaders } from "@/lib/geo/detect-country";
import { MOROCCO_COUNTRY, MOROCCO_CURRENCY } from "@/lib/geo/morocco-stability";
import { resolveRegionSync } from "@/lib/geo/resolve-region";
import { countryToMarketCode, marketToCurrency } from "@/lib/market/country-to-market";
import type { MarketCode } from "@/lib/market/types";

export const DEFAULT_MARKET_COUNTRY = MOROCCO_COUNTRY;
export const DEFAULT_MARKET_CODE: MarketCode = "MA";

/**
 * Selected country priority (sync, cookie/header only):
 * 1. Manual user selection (`geo_manual` + pref)
 * 2. Saved pref cookie
 * 3. Detected cookie (only when `geo_resolved` and no pref)
 * 4. Edge header (live geo hint)
 */
export function selectedCountryFromCookieState(state: GeoCookieState, edgeCountry?: string | null): string | null {
  if (state.geoLocked || (state.geoManual && state.pref === MOROCCO_COUNTRY)) return MOROCCO_COUNTRY;
  if (state.geoManual && state.pref) return state.pref;
  if (state.pref === MOROCCO_COUNTRY) return MOROCCO_COUNTRY;
  if (state.pref) return state.pref;
  if (state.geoWeak) return null;
  if (state.geoResolved && state.detected) return state.detected;
  const edge = normalizeCountryCode(edgeCountry ?? null);
  if (edge) return edge;
  return null;
}

export function resolveLocaleFromSignals(
  explicit: AppLocale | undefined,
  profileLocale: AppLocale | null,
  acceptLanguage: string | null,
  country: string | null,
): AppLocale {
  if (explicit && isAppLocale(explicit)) return explicit;
  if (profileLocale) return profileLocale;
  if (country) return geoProfileForCountry(country, acceptLanguage).locale;
  const al = (acceptLanguage ?? "").toLowerCase();
  if (/\bar(-|_|,|;|$)/.test(al) || al.startsWith("ar")) return "ar";
  if (/\bfr(-|_|,|;|$)/.test(al) || al.startsWith("fr")) return "fr";
  if (/\bit(-|_|,|;|$)/.test(al) || al.startsWith("it")) return "it";
  if (/\bes(-|_|,|;|$)/.test(al) || al.startsWith("es")) return "es";
  if (/\bnl(-|_|,|;|$)/.test(al) || al.startsWith("nl")) return "nl";
  return defaultLocale;
}

export type EffectiveRegionSnapshot = {
  selectedCountry: string | null;
  detectedCountry: string | null;
  marketCode: MarketCode;
  chargeCurrency: CurrencyCode;
  displayCurrency: CurrencyCode;
  locale: AppLocale;
};

/**
 * Build pricing/display region from cookies + headers (no IP fetch).
 * Aligns SSR and client hydration when cookies are the source of truth.
 */
export function buildEffectiveRegionSync(opts: {
  cookieState: GeoCookieState;
  headers?: Headers;
  acceptLanguage?: string | null;
  explicitLocale?: AppLocale;
  profileCountry?: string | null;
  profileLocale?: AppLocale | null;
  profileCurrency?: CurrencyCode | null;
}): EffectiveRegionSnapshot {
  const edge = opts.headers ? detectCountryFromHeaders(opts.headers) : null;
  const acceptLanguage = opts.acceptLanguage ?? opts.headers?.get("accept-language") ?? null;

  if (opts.profileCountry) {
    const code = normalizeCountryCode(opts.profileCountry) ?? MOROCCO_COUNTRY;
    const profile = geoProfileForCountry(code, acceptLanguage);
    return {
      selectedCountry: code,
      detectedCountry: opts.cookieState.detected ?? edge,
      marketCode: countryToMarketCode(code),
      chargeCurrency: marketToCurrency(countryToMarketCode(code)),
      displayCurrency:
        opts.profileCurrency ??
        (code === MOROCCO_COUNTRY ? MOROCCO_CURRENCY : profile.currency),
      locale: opts.profileLocale ?? profile.locale,
    };
  }

  const region = resolveRegionSync({
    cookieState: opts.cookieState,
    headers: opts.headers,
    acceptLanguage,
    edgeCountry: edge,
  });

  return {
    selectedCountry: region.country,
    detectedCountry: opts.cookieState.detected ?? edge,
    marketCode: region.marketCode,
    chargeCurrency: marketToCurrency(region.marketCode),
    displayCurrency: region.currency,
    locale: opts.explicitLocale ?? region.locale,
  };
}
