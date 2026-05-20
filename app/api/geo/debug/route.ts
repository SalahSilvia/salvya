import { NextResponse, type NextRequest } from "next/server";
import {
  COOKIE_DETECTED_COUNTRY,
  COOKIE_DISPLAY_CURRENCY,
  COOKIE_GEO_MANUAL,
  COOKIE_GEO_RESOLVED,
  COOKIE_GEO_WEAK,
  COOKIE_PREF_COUNTRY,
} from "@/lib/geo/constants";
import { applyGeoCookies } from "@/lib/geo/cookie-persistence";
import { geoProfileForCountry, normalizeCountryCode } from "@/lib/geo/country-map";
import { isGeoDebugEnabled, priceTierLabel } from "@/lib/geo/debug";
import { acceptLanguageFromHeaders } from "@/lib/geo/detect-country";
import { applyGeoQueryParamsToHeaders } from "@/lib/geo/detect-request-headers";
import { cookieDecisionReason, shouldPersistPrefCountry } from "@/lib/geo/persist-policy";
import { snapshotFromCookies } from "@/lib/geo/preferences";
import { resolveShopperCountryDetailed } from "@/lib/geo/resolve-country";
import { countryToMarketCode } from "@/lib/market/country-to-market";

export async function GET(request: NextRequest) {
  if (!isGeoDebugEnabled()) {
    return NextResponse.json({ error: "Geo debug disabled" }, { status: 404 });
  }

  const headers = new Headers(request.headers);
  applyGeoQueryParamsToHeaders(headers, request.nextUrl.searchParams);

  const acceptLanguage = acceptLanguageFromHeaders(headers);
  const geoManual = request.cookies.get(COOKIE_GEO_MANUAL)?.value === "1";
  const geoWeak = request.cookies.get(COOKIE_GEO_WEAK)?.value === "1";
  const geoResolved = request.cookies.get(COOKIE_GEO_RESOLVED)?.value === "1";
  const prevPref = normalizeCountryCode(request.cookies.get(COOKIE_PREF_COUNTRY)?.value);
  const prevDetected = normalizeCountryCode(request.cookies.get(COOKIE_DETECTED_COUNTRY)?.value);

  const persistedStrong = geoManual
    ? prevPref
    : geoWeak
      ? null
      : geoResolved
        ? prevPref ?? prevDetected
        : null;

  const resolution = await resolveShopperCountryDetailed(headers, {
    searchParams: request.nextUrl.searchParams,
    persistedStrongCountry: persistedStrong,
    manualCountry: geoManual ? prevPref : null,
    displayCurrency: request.cookies.get(COOKIE_DISPLAY_CURRENCY)?.value ?? null,
    geoManual,
  });

  const country = resolution.country;
  const profile = country ? geoProfileForCountry(country, acceptLanguage) : null;
  const cookieGet = (name: string) => request.cookies.get(name)?.value;
  const snapshot = snapshotFromCookies(cookieGet, acceptLanguage);

  const writePref = shouldPersistPrefCountry({
    source: resolution.source,
    geoManual,
    weakDetection: resolution.weakDetection,
  });

  const cookieReason = cookieDecisionReason({
    source: resolution.source,
    geoManual,
    weakDetection: resolution.weakDetection,
    writePref,
  });

  const effectiveCountry = geoManual
    ? snapshot.prefCountry ?? snapshot.detectedCountry
    : resolution.weakDetection
      ? snapshot.prefCountry
      : snapshot.prefCountry ?? snapshot.detectedCountry;

  return NextResponse.json({
    ok: true,
    resolution,
    sourceBreakdown: {
      edge: resolution.edgeCountry,
      ip: resolution.ipCountry,
      timezone: resolution.timezone,
      locale: resolution.browserLocaleCountry,
      scores: resolution.scores,
    },
    availability: {
      edgeAvailable: resolution.edgeAvailable,
      ipAvailable: resolution.ipAvailable,
      isLocalDev: resolution.isLocalDev,
    },
    cookieDecision: {
      reason: cookieReason,
      writePref,
      weakDetection: resolution.weakDetection,
      persistable: resolution.persistable,
    },
    rawHeaders: {
      edge: headers.get("x-vercel-ip-country") ?? headers.get("cf-ipcountry"),
      acceptLanguage: headers.get("accept-language"),
      timezone: headers.get("x-salvya-timezone"),
      tzOffset: headers.get("x-salvya-tz-offset"),
      intlLocales: headers.get("x-salvya-intl-locales"),
      devOverride: headers.get("x-salvya-dev-country"),
    },
    cookies: {
      detected: normalizeCountryCode(cookieGet(COOKIE_DETECTED_COUNTRY)),
      pref: normalizeCountryCode(cookieGet(COOKIE_PREF_COUNTRY)),
      displayCurrency: cookieGet(COOKIE_DISPLAY_CURRENCY) ?? null,
      geoResolved: cookieGet(COOKIE_GEO_RESOLVED) === "1",
      geoManual,
      geoWeak,
    },
    snapshot,
    effective: {
      country: effectiveCountry,
      priceTier: priceTierLabel(effectiveCountry),
      marketCode: countryToMarketCode(effectiveCountry),
      confidence: resolution.confidence,
      weakDetection: resolution.weakDetection,
      overrideSource: resolution.overrideSource,
    },
    profile,
    simulateCookieWrite: profile
      ? {
          wouldWritePref: writePref,
          reason: cookieReason,
        }
      : null,
  });
}
