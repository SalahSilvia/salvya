import { cookies, headers } from "next/headers";
import type { AppLocale } from "@/i18n/routing";
import { COOKIE_DISPLAY_CURRENCY } from "@/lib/geo/constants";
import { acceptLanguageFromHeaders } from "@/lib/geo/detect-country";
import { geoProfileForCountry } from "@/lib/geo/country-map";
import {
  formatRegionalSnapshotForLog,
  geoLogServer,
  isGeoDebugEnabled,
  priceTierLabel,
} from "@/lib/geo/debug";
import { readGeoCookieState } from "@/lib/geo/cookie-state";
import { repairGeoCookieState } from "@/lib/geo/geo-consistency";
import { isMoroccoManualLock } from "@/lib/geo/morocco-stability";
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
  const cookieState = repairGeoCookieState(readGeoCookieState(cookieGet)).state;
  const geoWeak = snapshot.weakDetection === true;
  const geoManual = snapshot.geoManual;
  const prevPref = cookieState.pref;
  const prevDetected = cookieState.detected;

  const resolution = await resolveShopperCountryDetailed(hdrs, {
    savedPrefCountry: prevPref,
    manualCountry: geoManual ? prevPref : null,
    displayCurrency: cookieGet(COOKIE_DISPLAY_CURRENCY) ?? null,
    geoManual,
    geoWeak,
  });

  const detected = resolution.country ?? prevDetected;

  if (!detected) {
    return { ...snapshot, detectedCountry: null };
  }

  if (geoManual) {
    const moroccoLocked = isMoroccoManualLock(cookieState);
    return {
      ...snapshot,
      detectedCountry: detected,
      prefCountry: moroccoLocked ? "MA" : (prevPref ?? detected),
      displayCurrency: moroccoLocked ? "MAD" : snapshot.displayCurrency,
      geoManual: true,
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
