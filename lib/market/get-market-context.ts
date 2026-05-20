import { cookies, headers } from "next/headers";
import type { AppLocale } from "@/i18n/routing";
import { defaultLocale, isAppLocale } from "@/i18n/routing";
import { parseDisplayCurrency, type CurrencyCode } from "@/lib/currency/config";
import {
  COOKIE_DETECTED_COUNTRY,
  COOKIE_DISPLAY_CURRENCY,
  COOKIE_GEO_MANUAL,
  COOKIE_GEO_RESOLVED,
  COOKIE_GEO_WEAK,
  COOKIE_PREF_COUNTRY,
} from "@/lib/geo/constants";
import { geoLogServer, isGeoDebugEnabled, priceTierLabel } from "@/lib/geo/debug";
import { acceptLanguageFromHeaders, detectCountryFromHeaders } from "@/lib/geo/detect-country";
import { currencyForCountry, normalizeCountryCode } from "@/lib/geo/country-map";
import { countryToMarketCode, marketToCurrency } from "@/lib/market/country-to-market";
import type { MarketContext } from "@/lib/market/market-context";
import { loadUserGeoPreferences } from "@/lib/market/user-geo-preferences";

function resolveLocale(
  explicit: AppLocale | undefined,
  profileLocale: AppLocale | null,
  acceptLanguage: string | null,
): AppLocale {
  if (explicit && isAppLocale(explicit)) return explicit;
  if (profileLocale) return profileLocale;
  const al = (acceptLanguage ?? "").toLowerCase();
  if (/\bar(-|_|,|;|$)/.test(al) || al.startsWith("ar")) return "ar";
  if (/\bfr(-|_|,|;|$)/.test(al) || al.startsWith("fr")) return "fr";
  if (/\bit(-|_|,|;|$)/.test(al) || al.startsWith("it")) return "it";
  if (/\bes(-|_|,|;|$)/.test(al) || al.startsWith("es")) return "es";
  if (/\bnl(-|_|,|;|$)/.test(al) || al.startsWith("nl")) return "nl";
  return defaultLocale;
}

/**
 * Single resolver for geo + locale + display market.
 * Profile → cookies → headers → EU default.
 */
export async function getMarketContext(opts?: {
  userId?: string | null;
  locale?: AppLocale;
  userCountry?: string | null;
}): Promise<MarketContext> {
  const hdrs = await headers();
  const acceptLanguage = acceptLanguageFromHeaders(hdrs);
  const cookieStore = await cookies();

  let source: MarketContext["source"] = "default";
  let country: string | null = normalizeCountryCode(opts?.userCountry);
  let profileLocale: AppLocale | null = null;
  let profileCurrency: CurrencyCode | null = null;

  if (opts?.userId) {
    const prefs = await loadUserGeoPreferences(opts.userId);
    if (!country && prefs.country) {
      country = prefs.country;
      source = "profile";
    }
    profileLocale = prefs.locale;
    profileCurrency = prefs.displayCurrency;
  }

  const geoManual = cookieStore.get(COOKIE_GEO_MANUAL)?.value === "1";
  const geoWeak = cookieStore.get(COOKIE_GEO_WEAK)?.value === "1";
  const geoResolved = cookieStore.get(COOKIE_GEO_RESOLVED)?.value === "1";
  const prefCookie = normalizeCountryCode(cookieStore.get(COOKIE_PREF_COUNTRY)?.value);
  const detectedCookie = normalizeCountryCode(cookieStore.get(COOKIE_DETECTED_COUNTRY)?.value);
  const cookieCurrency = parseDisplayCurrency(cookieStore.get(COOKIE_DISPLAY_CURRENCY)?.value);

  if (!country) {
    if (geoManual) {
      country = prefCookie ?? detectedCookie;
    } else if (geoWeak) {
      country = prefCookie ?? null;
    } else if (geoResolved) {
      country = detectedCookie ?? prefCookie;
    } else {
      country = prefCookie;
    }
    if (country) source = source === "profile" ? "profile" : "cookie";
    if (!geoManual && cookieCurrency === "MAD" && country === "FR") {
      country = "MA";
    }
  }
  if (!country) {
    const fromIp = detectCountryFromHeaders(hdrs);
    if (fromIp) {
      country = fromIp;
      source = source === "profile" ? "profile" : "cookie";
    }
  }

  const locale = resolveLocale(opts?.locale, profileLocale, acceptLanguage);

  const marketCode = countryToMarketCode(country);
  const currency = marketToCurrency(marketCode);

  const displayCurrency =
    profileCurrency ??
    cookieCurrency ??
    currencyForCountry(country) ??
    currency;

  const ctx: MarketContext = {
    marketCode,
    currency,
    displayCurrency,
    countryCode: country,
    locale,
    originalBaseCurrency: "EUR",
    source,
  };

  if (isGeoDebugEnabled()) {
    geoLogServer("getMarketContext =", {
      country,
      marketCode,
      chargeCurrency: currency,
      displayCurrency,
      priceTier: priceTierLabel(country),
      geoManual,
      prefCookie,
      detectedCookie,
      source,
    });
  }

  return ctx;
}

/** @deprecated Use `getMarketContext` — kept for checkout + existing imports. */
export async function getUserMarket(userId?: string | null) {
  const ctx = await getMarketContext({ userId });
  return {
    marketCode: ctx.marketCode,
    currency: ctx.currency,
    countryCode: ctx.countryCode,
    source: ctx.source,
  };
}
