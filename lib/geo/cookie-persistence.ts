import type { NextResponse } from "next/server";
import {
  COOKIE_DETECTED_COUNTRY,
  COOKIE_DISPLAY_CURRENCY,
  COOKIE_GEO_MANUAL,
  COOKIE_GEO_RESOLVED,
  COOKIE_GEO_WEAK,
  COOKIE_PREF_COUNTRY,
  GEO_COOKIE_MAX_AGE,
  GEO_WEAK_COOKIE_MAX_AGE,
} from "@/lib/geo/constants";
import { geoLogServer, isGeoDebugEnabled } from "@/lib/geo/debug";
import { cookieDecisionReason, shouldPersistPrefCountry } from "@/lib/geo/persist-policy";
import type { CurrencyCode } from "@/lib/currency/config";
import type { GeoDetectSource } from "@/lib/geo/types";

const baseOpts = {
  path: "/",
  sameSite: "lax" as const,
};

export function applyGeoCookies(
  res: NextResponse,
  opts: {
    country: string;
    currency: CurrencyCode;
    geoManual: boolean;
    weakDetection: boolean;
    source: GeoDetectSource | null;
    writePref: boolean;
    /** Live network geo for banners; may differ from `country` when Morocco is manually locked. */
    detectedCountry?: string | null;
  },
): string {
  const writePref =
    opts.writePref &&
    shouldPersistPrefCountry({
      source: opts.source,
      geoManual: opts.geoManual,
      weakDetection: opts.weakDetection,
    });

  const reason = cookieDecisionReason({
    source: opts.source,
    geoManual: opts.geoManual,
    weakDetection: opts.weakDetection,
    writePref,
  });

  const detectedMaxAge = opts.weakDetection ? GEO_WEAK_COOKIE_MAX_AGE : GEO_COOKIE_MAX_AGE;
  const detectedValue = opts.detectedCountry ?? opts.country;
  res.cookies.set(COOKIE_DETECTED_COUNTRY, detectedValue, { ...baseOpts, maxAge: detectedMaxAge });

  if (opts.weakDetection) {
    res.cookies.set(COOKIE_GEO_WEAK, "1", { ...baseOpts, maxAge: GEO_WEAK_COOKIE_MAX_AGE });
    res.cookies.set(COOKIE_PREF_COUNTRY, "", { ...baseOpts, maxAge: 0 });
    res.cookies.set(COOKIE_GEO_RESOLVED, "", { ...baseOpts, maxAge: 0 });
    if (isGeoDebugEnabled()) {
      geoLogServer("[GEO] cookie decision", { reason, country: opts.country });
    }
    return reason;
  }

  res.cookies.set(COOKIE_GEO_WEAK, "", { ...baseOpts, maxAge: 0 });

  if (writePref) {
    res.cookies.set(COOKIE_PREF_COUNTRY, opts.country, { ...baseOpts, maxAge: GEO_COOKIE_MAX_AGE });
    res.cookies.set(COOKIE_DISPLAY_CURRENCY, opts.currency, {
      ...baseOpts,
      maxAge: GEO_COOKIE_MAX_AGE,
    });
    res.cookies.set(COOKIE_GEO_RESOLVED, "1", { ...baseOpts, maxAge: GEO_COOKIE_MAX_AGE });
  }

  if (opts.geoManual) {
    res.cookies.set(COOKIE_GEO_MANUAL, "1", { ...baseOpts, maxAge: GEO_COOKIE_MAX_AGE });
  }

  if (isGeoDebugEnabled()) {
    geoLogServer("[GEO] cookie decision", { reason, writePref, country: opts.country });
  }

  return reason;
}
