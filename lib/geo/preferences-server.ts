import { cookies, headers } from "next/headers";
import type { AppLocale } from "@/i18n/routing";
import {
  COOKIE_DETECTED_COUNTRY,
  COOKIE_DISPLAY_CURRENCY,
  COOKIE_GEO_MANUAL,
  COOKIE_GEO_RESOLVED,
  COOKIE_GEO_WEAK,
  COOKIE_PREF_COUNTRY,
} from "@/lib/geo/constants";
import { acceptLanguageFromHeaders } from "@/lib/geo/detect-country";
import { geoProfileForCountry, normalizeCountryCode } from "@/lib/geo/country-map";
import {
  formatRegionalSnapshotForLog,
  geoLogServer,
  isGeoDebugEnabled,
  priceTierLabel,
} from "@/lib/geo/debug";
import { shouldPersistPrefCountry } from "@/lib/geo/persist-policy";
import { resolveShopperCountryDetailed } from "@/lib/geo/resolve-country";
import { snapshotFromCookies, type RegionalPreferencesSnapshot } from "@/lib/geo/preferences";

export type RegionalPreferencesServer = RegionalPreferencesSnapshot;

export async function getRegionalPreferences(): Promise<RegionalPreferencesServer> {
  const store = await cookies();
  const hdrs = await headers();
  const acceptLanguage = acceptLanguageFromHeaders(hdrs);
  const cookieGet = (name: string) => store.get(name)?.value;

  const snapshot = snapshotFromCookies(cookieGet, acceptLanguage);
  const geoWeak = snapshot.weakDetection === true;
  const geoManual = snapshot.geoManual;
  const geoResolved = snapshot.geoResolved;
  const prevPref = normalizeCountryCode(cookieGet(COOKIE_PREF_COUNTRY));
  const prevDetected = normalizeCountryCode(cookieGet(COOKIE_DETECTED_COUNTRY));

  const persistedStrong = geoManual
    ? prevPref
    : geoWeak
      ? null
      : geoResolved
        ? prevPref ?? prevDetected
        : null;

  const resolution = await resolveShopperCountryDetailed(hdrs, {
    persistedStrongCountry: persistedStrong,
    manualCountry: geoManual ? prevPref : null,
    displayCurrency: cookieGet(COOKIE_DISPLAY_CURRENCY) ?? null,
    geoManual,
  });

  const detected = resolution.country ?? prevDetected;

  if (!detected) {
    return { ...snapshot, detectedCountry: null };
  }

  if (geoManual) {
    return {
      ...snapshot,
      detectedCountry: detected,
      prefCountry: prevPref ?? detected,
      weakDetection: false,
    };
  }

  if (resolution.weakDetection || geoWeak) {
    return {
      ...snapshot,
      detectedCountry: detected,
      weakDetection: true,
      confidence: resolution.confidence,
      geoResolved: false,
      prefCountry: prevPref,
    };
  }

  const profile = geoProfileForCountry(detected, acceptLanguage);
  const canBootstrap = shouldPersistPrefCountry({
    source: resolution.source,
    geoManual: false,
    weakDetection: false,
  });

  if (
    canBootstrap &&
    (!snapshot.geoResolved || prevPref !== profile.countryCode || snapshot.displayCurrency !== profile.currency)
  ) {
    const next: RegionalPreferencesServer = {
      detectedCountry: detected,
      prefCountry: profile.countryCode,
      displayCurrency: profile.currency,
      geoResolved: true,
      geoManual: false,
      weakDetection: false,
      confidence: resolution.confidence,
      bootstrapCountry: profile.countryCode,
      bootstrapCurrency: profile.currency,
      bootstrapLocale: !snapshot.geoResolved ? profile.locale : undefined,
    };
    if (isGeoDebugEnabled()) {
      geoLogServer("[GEO] SSR bootstrap (strong)", formatRegionalSnapshotForLog(next));
    }
    return next;
  }

  const out: RegionalPreferencesServer = {
    ...snapshot,
    detectedCountry: detected,
    confidence: resolution.confidence,
    weakDetection: false,
  };
  if (isGeoDebugEnabled()) {
    geoLogServer("[GEO] SSR snapshot (no bootstrap)", formatRegionalSnapshotForLog(out));
  }
  return out;
}

export async function getAcceptLanguage(): Promise<string | null> {
  const hdrs = await headers();
  return acceptLanguageFromHeaders(hdrs);
}
