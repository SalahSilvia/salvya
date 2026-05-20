import type { CurrencyCode } from "@/lib/currency/config";
import type { MarketCode } from "@/lib/market/types";
import { countryToMarketCode } from "@/lib/market/country-to-market";
import {
  COOKIE_DETECTED_COUNTRY,
  COOKIE_DISPLAY_CURRENCY,
  COOKIE_GEO_MANUAL,
  COOKIE_GEO_RESOLVED,
  COOKIE_PREF_COUNTRY,
} from "@/lib/geo/constants";
import type { RegionalPreferencesSnapshot } from "@/lib/geo/preferences";

/** Opt-in only — set SALVYA_GEO_DEBUG=1 (server) or NEXT_PUBLIC_SALVYA_GEO_DEBUG=1 (client). */
export function isGeoDebugEnabled(): boolean {
  return process.env.SALVYA_GEO_DEBUG === "1";
}

export function isGeoDebugEnabledClient(): boolean {
  return process.env.NEXT_PUBLIC_SALVYA_GEO_DEBUG === "1";
}

export type PriceTierLabel = "MOROCCO" | "INTERNATIONAL_US" | "INTERNATIONAL_EU";

export function priceTierLabel(country: string | null | undefined): PriceTierLabel {
  const market = countryToMarketCode(country);
  if (market === "MA") return "MOROCCO";
  if (market === "US") return "INTERNATIONAL_US";
  return "INTERNATIONAL_EU";
}

export function marketCodeToPriceTier(marketCode: MarketCode): PriceTierLabel {
  if (marketCode === "MA") return "MOROCCO";
  if (marketCode === "US") return "INTERNATIONAL_US";
  return "INTERNATIONAL_EU";
}

export type GeoCookieSnapshot = {
  detected: string | null;
  pref: string | null;
  displayCurrency: string | null;
  geoResolved: boolean;
  geoManual: boolean;
};

export function readGeoCookiesFromDocument(): GeoCookieSnapshot | null {
  if (typeof document === "undefined") return null;
  const get = (name: string) => {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
  };
  return {
    detected: get(COOKIE_DETECTED_COUNTRY),
    pref: get(COOKIE_PREF_COUNTRY),
    displayCurrency: get(COOKIE_DISPLAY_CURRENCY),
    geoResolved: get(COOKIE_GEO_RESOLVED) === "1",
    geoManual: get(COOKIE_GEO_MANUAL) === "1",
  };
}

export function geoLogServer(message: string, data?: Record<string, unknown>): void {
  if (!isGeoDebugEnabled()) return;
  if (data && Object.keys(data).length > 0) {
    console.log(`[GEO SERVER] ${message}`, data);
  } else {
    console.log(`[GEO SERVER] ${message}`);
  }
}

export function geoLogBrowser(message: string, data?: Record<string, unknown>): void {
  if (!isGeoDebugEnabledClient()) return;
  if (data && Object.keys(data).length > 0) {
    console.log(`[BROWSER GEO] ${message}`, data);
  } else {
    console.log(`[BROWSER GEO] ${message}`);
  }
}

export function formatRegionalSnapshotForLog(
  snapshot: RegionalPreferencesSnapshot,
  opts?: { locale?: string; marketCode?: MarketCode },
): Record<string, unknown> {
  const country = snapshot.prefCountry ?? snapshot.detectedCountry;
  return {
    detectedCountry: snapshot.detectedCountry,
    prefCountry: snapshot.prefCountry,
    displayCurrency: snapshot.displayCurrency,
    geoResolved: snapshot.geoResolved,
    geoManual: snapshot.geoManual,
    priceTier: priceTierLabel(country),
    marketCode: opts?.marketCode ?? countryToMarketCode(country),
    locale: opts?.locale,
    bootstrapCountry: snapshot.bootstrapCountry,
    bootstrapCurrency: snapshot.bootstrapCurrency,
    bootstrapLocale: snapshot.bootstrapLocale,
  };
}

export function formatCookieSnapshot(cookies: GeoCookieSnapshot): Record<string, unknown> {
  const country = cookies.pref ?? cookies.detected;
  return {
    ...cookies,
    priceTier: priceTierLabel(country),
  };
}
