import { parseDisplayCurrency, type CurrencyCode } from "@/lib/currency/config";
import {
  COOKIE_DETECTED_COUNTRY,
  COOKIE_DISPLAY_CURRENCY,
  COOKIE_GEO_LOCKED,
  COOKIE_GEO_MANUAL,
  COOKIE_GEO_RESOLVED,
  COOKIE_GEO_WEAK,
  COOKIE_PREF_COUNTRY,
} from "@/lib/geo/constants";
import { normalizeCountryCode } from "@/lib/geo/country-map";

/** Normalized geo cookies — single reader for SSR, API, and client. */
export type GeoCookieState = {
  pref: string | null;
  detected: string | null;
  displayCurrency: CurrencyCode | null;
  geoManual: boolean;
  geoLocked: boolean;
  geoWeak: boolean;
  geoResolved: boolean;
};

export function readGeoCookieState(
  cookieGet: (name: string) => string | undefined,
): GeoCookieState {
  return {
    pref: normalizeCountryCode(cookieGet(COOKIE_PREF_COUNTRY)),
    detected: normalizeCountryCode(cookieGet(COOKIE_DETECTED_COUNTRY)),
    displayCurrency: parseDisplayCurrency(cookieGet(COOKIE_DISPLAY_CURRENCY)),
    geoManual: cookieGet(COOKIE_GEO_MANUAL) === "1",
    geoLocked: cookieGet(COOKIE_GEO_LOCKED) === "1",
    geoWeak: cookieGet(COOKIE_GEO_WEAK) === "1",
    geoResolved: cookieGet(COOKIE_GEO_RESOLVED) === "1",
  };
}
