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
import { geoLogServer, isGeoDebugEnabled, priceTierLabel } from "@/lib/geo/debug";
import { acceptLanguageFromHeaders } from "@/lib/geo/detect-country";
import { applyGeoQueryParamsToHeaders } from "@/lib/geo/detect-request-headers";
import { shouldPersistPrefCountry } from "@/lib/geo/persist-policy";
import { resolveShopperCountryDetailed } from "@/lib/geo/resolve-country";
import { countryToMarketCode } from "@/lib/market/country-to-market";

export async function GET(request: NextRequest) {
  const headers = new Headers(request.headers);
  applyGeoQueryParamsToHeaders(headers, request.nextUrl.searchParams);

  const acceptLanguage = acceptLanguageFromHeaders(headers);
  const geoManual = request.cookies.get(COOKIE_GEO_MANUAL)?.value === "1";
  const geoWeak = request.cookies.get(COOKIE_GEO_WEAK)?.value === "1";
  const geoResolved = request.cookies.get(COOKIE_GEO_RESOLVED)?.value === "1";
  const prevPref = normalizeCountryCode(request.cookies.get(COOKIE_PREF_COUNTRY)?.value);
  const prevDetected = normalizeCountryCode(request.cookies.get(COOKIE_DETECTED_COUNTRY)?.value);
  const displayCurrencyCookie = request.cookies.get(COOKIE_DISPLAY_CURRENCY)?.value ?? null;

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
    displayCurrency: displayCurrencyCookie,
    geoManual,
  });

  const country = resolution.country;
  const profile = country ? geoProfileForCountry(country, acceptLanguage) : null;

  const writePref = shouldPersistPrefCountry({
    source: resolution.source,
    geoManual,
    weakDetection: resolution.weakDetection,
  });

  let applied = false;
  if (country && profile && writePref) {
    const geoResolved = request.cookies.get(COOKIE_GEO_RESOLVED)?.value === "1";
    applied =
      !geoResolved ||
      prevPref !== profile.countryCode ||
      prevDetected !== country ||
      displayCurrencyCookie?.toUpperCase() !== profile.currency;
  }

  if (isGeoDebugEnabled()) {
    geoLogServer("[GEO] detect API", {
      country,
      source: resolution.source,
      confidence: resolution.confidence,
      weakDetection: resolution.weakDetection,
      persistable: resolution.persistable,
      writePref,
      applied,
      priceTier: priceTierLabel(country),
    });
  }

  const res = NextResponse.json({
    ok: true,
    country,
    source: resolution.source,
    confidence: resolution.confidence,
    weakDetection: resolution.weakDetection,
    persistable: resolution.persistable,
    permanent: writePref,
    reason: resolution.reason,
    overrideSource: resolution.overrideSource,
    edgeAvailable: resolution.edgeAvailable,
    ipAvailable: resolution.ipAvailable,
    profile: profile
      ? {
          countryCode: profile.countryCode,
          countryName: profile.countryName,
          currency: profile.currency,
          locale: profile.locale,
        }
      : null,
    applied,
    ...(isGeoDebugEnabled() ? { debug: resolution } : {}),
  });

  if (!country || !profile) return res;

  const cookieReason = applyGeoCookies(res, {
    country: profile.countryCode,
    currency: profile.currency,
    geoManual,
    weakDetection: resolution.weakDetection,
    source: resolution.source,
    writePref: writePref && (applied || geoManual || !request.cookies.get(COOKIE_GEO_RESOLVED)),
  });

  if (isGeoDebugEnabled()) {
    geoLogServer("[GEO] cookie decision summary", {
      cookieReason,
      marketCode: countryToMarketCode(profile.countryCode),
    });
  }

  return res;
}
