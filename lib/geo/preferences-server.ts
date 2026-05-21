import { cookies, headers } from "next/headers";
import type { AppLocale } from "@/i18n/routing";
import { COOKIE_DISPLAY_CURRENCY } from "@/lib/geo/constants";
import { acceptLanguageFromHeaders } from "@/lib/geo/detect-country";
import {
  formatRegionalSnapshotForLog,
  geoLogServer,
  isGeoDebugEnabled,
} from "@/lib/geo/debug";
import { readGeoCookieState } from "@/lib/geo/cookie-state";
import { repairGeoCookieState } from "@/lib/geo/geo-consistency";
import { logResolvedRegion, resolveRegionSync } from "@/lib/geo/resolve-region";
import type { RegionalPreferencesSnapshot } from "@/lib/geo/preferences";

export type RegionalPreferencesServer = RegionalPreferencesSnapshot;

/**
 * SSR-first regional prefs — Morocco-first when signals are ambiguous.
 * Avoids EUR/MAD flicker by resolving country/currency before the client hydrates.
 */
export async function getRegionalPreferences(): Promise<RegionalPreferencesServer> {
  const store = await cookies();
  const hdrs = await headers();
  const acceptLanguage = acceptLanguageFromHeaders(hdrs);
  const cookieGet = (name: string) => store.get(name)?.value;
  const cookieState = repairGeoCookieState(readGeoCookieState(cookieGet)).state;

  const region = resolveRegionSync({
    cookieState,
    headers: hdrs,
    acceptLanguage,
  });

  logResolvedRegion(region);

  const edge = hdrs.get("x-vercel-ip-country") ?? hdrs.get("x-salvya-edge-country");
  const detectedCountry = cookieState.detected ?? edge ?? region.edgeCountry ?? region.country;

  const out: RegionalPreferencesServer = {
    detectedCountry: detectedCountry ?? null,
    prefCountry: region.country,
    displayCurrency: region.currency,
    geoResolved: true,
    geoManual: cookieState.geoManual || cookieState.geoLocked,
    geoLocked: cookieState.geoLocked || region.country === "MA",
    moroccoLikely: region.moroccoLikely,
    weakDetection: region.weakDetection,
    confidence: region.moroccoLikely ? "HIGH" : "MEDIUM",
    bootstrapCountry: region.country,
    bootstrapCurrency: region.currency,
    bootstrapLocale: region.locale as AppLocale,
  };

  if (isGeoDebugEnabled()) {
    geoLogServer("[GEO] SSR regional prefs", formatRegionalSnapshotForLog(out));
  }

  return out;
}

export async function getAcceptLanguage(): Promise<string | null> {
  const hdrs = await headers();
  return acceptLanguageFromHeaders(hdrs);
}
