import { cookies, headers } from "next/headers";
import type { AppLocale } from "@/i18n/routing";
import { parseDisplayCurrency, type CurrencyCode } from "@/lib/currency/config";
import { readGeoCookieState } from "@/lib/geo/cookie-state";
import {
  buildEffectiveRegionSync,
  selectedCountryFromCookieState,
} from "@/lib/geo/effective-region";
import { acceptLanguageFromHeaders } from "@/lib/geo/detect-country";
import { geoLogServer, isGeoDebugEnabled, priceTierLabel } from "@/lib/geo/debug";
import type { MarketContext } from "@/lib/market/market-context";
import { loadUserGeoPreferences } from "@/lib/market/user-geo-preferences";

/**
 * Single resolver for geo + locale + display market.
 * Priority: profile → manual → saved pref cookie → edge header → EU default.
 */
export async function getMarketContext(opts?: {
  userId?: string | null;
  locale?: AppLocale;
  userCountry?: string | null;
}): Promise<MarketContext> {
  const hdrs = await headers();
  const acceptLanguage = acceptLanguageFromHeaders(hdrs);
  const cookieStore = await cookies();
  const cookieGet = (name: string) => cookieStore.get(name)?.value;
  const cookieState = readGeoCookieState(cookieGet);

  let source: MarketContext["source"] = "default";
  let profileCountry: string | null = null;
  let profileLocale: AppLocale | null = null;
  let profileCurrency: CurrencyCode | null = null;

  if (opts?.userId) {
    const prefs = await loadUserGeoPreferences(opts.userId);
    profileCountry = prefs.country;
    profileLocale = prefs.locale;
    profileCurrency = prefs.displayCurrency;
    if (profileCountry) source = "profile";
  }

  const userCountry = opts?.userCountry ?? profileCountry;
  if (userCountry && source !== "profile") source = "profile";

  const region = buildEffectiveRegionSync({
    cookieState,
    headers: hdrs,
    acceptLanguage,
    explicitLocale: opts?.locale,
    profileCountry: userCountry,
    profileLocale,
    profileCurrency,
  });

  if (region.selectedCountry && source === "default") {
    source = "cookie";
  }
  if (userCountry) source = "profile";

  const ctx: MarketContext = {
    marketCode: region.marketCode,
    currency: region.chargeCurrency,
    displayCurrency: region.displayCurrency,
    countryCode: region.selectedCountry,
    locale: region.locale,
    originalBaseCurrency: "EUR",
    source,
  };

  if (isGeoDebugEnabled()) {
    geoLogServer("getMarketContext =", {
      country: region.selectedCountry,
      marketCode: ctx.marketCode,
      chargeCurrency: ctx.currency,
      displayCurrency: ctx.displayCurrency,
      priceTier: priceTierLabel(region.selectedCountry),
      geoManual: cookieState.geoManual,
      prefCookie: cookieState.pref,
      detectedCookie: cookieState.detected,
      selectedFromCookies: selectedCountryFromCookieState(
        cookieState,
        hdrs.get("x-vercel-ip-country"),
      ),
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
