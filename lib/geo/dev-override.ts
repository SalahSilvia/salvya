import { normalizeCountryCode } from "@/lib/geo/country-map";
import { geoLogServer, isGeoDebugEnabled } from "@/lib/geo/debug";
import { devCountryOverride } from "@/lib/geo/detect-country";
import type { DevOverrideSource } from "@/lib/geo/types";

export const SALVYA_DEV_GEO_QUERY = "geo";
export const SALVYA_DEV_GEO_HEADER = "x-salvya-dev-country";
export const DEV_COUNTRY_STORAGE_KEY = "salvya-dev-country";

export type DevOverride = {
  country: string;
  source: DevOverrideSource;
};

function isDevGeoEnvironment(): boolean {
  return process.env.NODE_ENV !== "production";
}

/** Dev-only overrides — bypass all detection when present. */
export function resolveDevOverride(
  headers: Headers,
  searchParams?: URLSearchParams,
): DevOverride | null {
  if (!isDevGeoEnvironment()) return null;

  const fromEnv = devCountryOverride();
  if (fromEnv) {
    logDevOverride(fromEnv, "env");
    return { country: fromEnv, source: "env" };
  }

  const fromQuery = normalizeCountryCode(
    searchParams?.get(SALVYA_DEV_GEO_QUERY) ?? headers.get(SALVYA_DEV_GEO_QUERY),
  );
  if (fromQuery) {
    logDevOverride(fromQuery, "query");
    return { country: fromQuery, source: "query" };
  }

  const fromHeader = normalizeCountryCode(headers.get(SALVYA_DEV_GEO_HEADER));
  if (fromHeader) {
    logDevOverride(fromHeader, "localStorage");
    return { country: fromHeader, source: "localStorage" };
  }

  return null;
}

function logDevOverride(country: string, source: DevOverrideSource): void {
  if (!isGeoDebugEnabled()) return;
  geoLogServer(`[GEO] DEV OVERRIDE ACTIVE → ${country}`, { source });
}

export function readDevCountryFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return normalizeCountryCode(localStorage.getItem(DEV_COUNTRY_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function writeDevCountryToStorage(country: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (!country) localStorage.removeItem(DEV_COUNTRY_STORAGE_KEY);
    else localStorage.setItem(DEV_COUNTRY_STORAGE_KEY, country);
  } catch {
    /* private mode */
  }
}
