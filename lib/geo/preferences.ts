import type { AppLocale } from "@/i18n/routing";
import { parseDisplayCurrency, type CurrencyCode } from "@/lib/currency/config";
import {
  COOKIE_DETECTED_COUNTRY,
  COOKIE_DISPLAY_CURRENCY,
  COOKIE_GEO_LOCKED,
  COOKIE_GEO_MANUAL,
  COOKIE_GEO_RESOLVED,
  COOKIE_GEO_WEAK,
  COOKIE_PREF_COUNTRY,
  GEO_COOKIE_MAX_AGE,
  GEO_LOCKED_STORAGE_KEY,
  GEO_WEAK_COOKIE_MAX_AGE,
} from "@/lib/geo/constants";
import type { GeoConfidence } from "@/lib/geo/types";
import { currencyForCountry, geoProfileForCountry, normalizeCountryCode } from "@/lib/geo/country-map";
import { readGeoCookieState } from "@/lib/geo/cookie-state";
import { selectedCountryFromCookieState } from "@/lib/geo/effective-region";
import { buildGeoMismatchNotice } from "@/lib/geo/geo-consistency";
import {
  enforceMoroccoManualSelection,
  MOROCCO_COUNTRY,
  MOROCCO_CURRENCY,
} from "@/lib/geo/morocco-stability";

export const REGIONAL_PREFERENCES_EVENT = "salvya:regional-preferences-updated";

export type RegionalPreferencesSnapshot = {
  detectedCountry: string | null;
  prefCountry: string | null;
  displayCurrency: CurrencyCode;
  geoResolved: boolean;
  /** User explicitly chose country in menu — skip auto VPN switches. */
  geoManual: boolean;
  /** Strong Morocco lock — never downgrade to EUR on edge misroutes. */
  geoLocked?: boolean;
  /** SSR hint for subtle Morocco UX banner. */
  moroccoLikely?: boolean;
  weakDetection?: boolean;
  confidence?: GeoConfidence | null;
  /** Server computed region — client persists via /api/geo/detect (no cookies in RSC). */
  bootstrapLocale?: AppLocale;
  bootstrapCountry?: string;
  bootstrapCurrency?: CurrencyCode;
};

/** Active pricing country from snapshot (matches SSR cookie priority). */
export function pricingCountryFromSnapshot(snapshot: RegionalPreferencesSnapshot): string | null {
  return selectedCountryFromCookieState({
    pref: normalizeCountryCode(snapshot.prefCountry),
    detected: normalizeCountryCode(snapshot.detectedCountry),
    displayCurrency: snapshot.displayCurrency,
    geoManual: snapshot.geoManual,
    geoLocked: snapshot.geoLocked === true,
    geoWeak: snapshot.weakDetection === true,
    geoResolved: snapshot.geoResolved,
  });
}

export function snapshotFromCookies(
  cookieGet: (name: string) => string | undefined,
  acceptLanguage?: string | null,
): RegionalPreferencesSnapshot {
  const cookieState = readGeoCookieState(cookieGet);
  const { detected, pref: prefOnly, geoResolved, geoManual, geoWeak: weakDetection } = cookieState;
  const selected = selectedCountryFromCookieState(cookieState);
  const prefCountry = prefOnly ?? selected;
  const explicitCurrency = cookieState.displayCurrency;
  const pricingCode = selected ?? detected ?? MOROCCO_COUNTRY;
  const displayCurrency =
    explicitCurrency ??
    (pricingCode === MOROCCO_COUNTRY ? MOROCCO_CURRENCY : currencyForCountry(pricingCode)) ??
    MOROCCO_CURRENCY;

  return {
    detectedCountry: detected,
    prefCountry,
    displayCurrency,
    geoResolved,
    geoManual,
    geoLocked: cookieState.geoLocked,
    moroccoLikely: pricingCode === MOROCCO_COUNTRY || displayCurrency === MOROCCO_CURRENCY,
    weakDetection,
  };
}

export function suggestedLocaleForDetectedCountry(
  country: string | null,
  acceptLanguage?: string | null,
): AppLocale {
  return geoProfileForCountry(country, acceptLanguage).locale;
}

export type GeoSuggestion = {
  profile: ReturnType<typeof geoProfileForCountry>;
  suggestedLocale: AppLocale;
  suggestedCurrency: CurrencyCode;
};

/**
 * Only prompt when the shopper manually picked a country and we detect a different one (travel/VPN).
 * First-time / automatic detection never shows a banner — handled silently in syncGeoDetection.
 */
export function buildGeoSuggestion(
  snapshot: RegionalPreferencesSnapshot,
  currentLocale: AppLocale,
  acceptLanguage?: string | null,
): GeoSuggestion | null {
  if (!snapshot.geoManual) return null;

  const country = snapshot.detectedCountry;
  if (!country || !snapshot.geoResolved || !snapshot.prefCountry) return null;

  const pref = normalizeCountryCode(snapshot.prefCountry);
  const detected = normalizeCountryCode(country);
  if (!pref || !detected || pref === detected) return null;

  if (snapshot.geoManual && pref === MOROCCO_COUNTRY) {
    return null;
  }

  const profile = geoProfileForCountry(country, acceptLanguage);
  const suggestedLocale =
    profile.countryCode === "MA"
      ? localeApplyForMorocco(currentLocale, profile.locale) ?? "fr"
      : profile.locale;
  return {
    profile,
    suggestedLocale,
    suggestedCurrency: profile.currency,
  };
}

/** Locale to apply when auto-switching to Morocco (French storefront default, not browser ar). */
export function localeApplyForMorocco(currentLocale: AppLocale, profileLocale: AppLocale): AppLocale | undefined {
  if (currentLocale === "ar") return undefined;
  if (currentLocale === "fr") return undefined;
  return profileLocale === "ar" ? "fr" : profileLocale !== currentLocale ? profileLocale : undefined;
}

function setClientCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${GEO_COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}

function setClientCookieWithMaxAge(name: string, value: string, maxAge: number) {
  if (typeof document === "undefined") return;
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

export function buildGeoMismatchFromSnapshot(
  snapshot: RegionalPreferencesSnapshot,
  names: { selected: string; detected: string },
) {
  return buildGeoMismatchNotice(
    {
      pref: normalizeCountryCode(snapshot.prefCountry),
      detected: normalizeCountryCode(snapshot.detectedCountry),
      displayCurrency: snapshot.displayCurrency,
      geoManual: snapshot.geoManual,
      geoLocked: snapshot.geoLocked === true,
      geoWeak: snapshot.weakDetection === true,
      geoResolved: snapshot.geoResolved,
    },
    names,
  );
}

export function persistGeoChoice(opts: {
  locale?: AppLocale;
  currency: CurrencyCode;
  country: string;
  resolved?: boolean;
  manual?: boolean;
  weakDetection?: boolean;
  /** When manual Morocco lock: keep network-detected country for informational UI only. */
  detectedOnly?: string | null;
}) {
  const normalized = enforceMoroccoManualSelection({
    country: opts.country,
    currency: opts.currency,
    manual: opts.manual,
  });

  if (opts.weakDetection) {
    setClientCookieWithMaxAge(COOKIE_DETECTED_COUNTRY, opts.country, GEO_WEAK_COOKIE_MAX_AGE);
    setClientCookieWithMaxAge(COOKIE_GEO_WEAK, "1", GEO_WEAK_COOKIE_MAX_AGE);
    return;
  }

  if (typeof document !== "undefined") {
    document.cookie = `${COOKIE_GEO_WEAK}=; Path=/; Max-Age=0; SameSite=Lax`;
  }

  setClientCookie(COOKIE_DISPLAY_CURRENCY, normalized.currency);
  setClientCookie(COOKIE_PREF_COUNTRY, normalized.country);
  const detectedValue = opts.detectedOnly ?? normalized.country;
  setClientCookie(COOKIE_DETECTED_COUNTRY, detectedValue);
  if (normalized.manual) {
    setClientCookie(COOKIE_GEO_MANUAL, "1");
  }
  if (normalized.geoLocked || (normalized.manual && normalized.country === MOROCCO_COUNTRY)) {
    setClientCookie(COOKIE_GEO_LOCKED, "1");
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(GEO_LOCKED_STORAGE_KEY, "1");
    }
  }
  if (opts.resolved !== false) {
    setClientCookie(COOKIE_GEO_RESOLVED, "1");
  }
}

export function setClientDetectedCountry(country: string) {
  setClientCookie(COOKIE_DETECTED_COUNTRY, country);
}

export function clearGeoManual() {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_GEO_MANUAL}=; Path=/; Max-Age=0; SameSite=Lax`;
}

/** Wipe regional cookies (e.g. cookie settings reset) so geo can detect again. */
export function clearRegionalPreferenceCookies() {
  if (typeof document === "undefined") return;
  const names = [
    COOKIE_DETECTED_COUNTRY,
    COOKIE_DISPLAY_CURRENCY,
    COOKIE_GEO_RESOLVED,
    COOKIE_PREF_COUNTRY,
    COOKIE_GEO_MANUAL,
    COOKIE_GEO_LOCKED,
    COOKIE_GEO_WEAK,
  ];
  for (const name of names) {
    document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
  }
  try {
    localStorage.removeItem(GEO_LOCKED_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function dispatchRegionalPreferencesUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(REGIONAL_PREFERENCES_EVENT));
}

export function dismissGeoSuggestion(country: string) {
  setClientCookie(COOKIE_GEO_RESOLVED, "1");
  const code = normalizeCountryCode(country);
  if (code) setClientCookie(COOKIE_PREF_COUNTRY, code);
}

export function readClientRegionalPreferences(): RegionalPreferencesSnapshot {
  if (typeof document === "undefined") {
    return {
      detectedCountry: null,
      prefCountry: null,
      displayCurrency: MOROCCO_CURRENCY,
      geoResolved: false,
      geoManual: false,
      moroccoLikely: true,
    };
  }
  const get = (name: string) => {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : undefined;
  };
  const snap = snapshotFromCookies(get);
  if (typeof localStorage !== "undefined" && localStorage.getItem(GEO_LOCKED_STORAGE_KEY) === "1") {
    return {
      ...snap,
      prefCountry: MOROCCO_COUNTRY,
      displayCurrency: MOROCCO_CURRENCY,
      geoLocked: true,
      geoManual: true,
      moroccoLikely: true,
      weakDetection: false,
    };
  }
  return snap;
}
