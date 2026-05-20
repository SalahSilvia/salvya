import { devCountryOverride } from "@/lib/geo/detect-country";
import { geoLogServer, isGeoDebugEnabled } from "@/lib/geo/debug";
import { normalizeCountryCode } from "@/lib/geo/country-map";
type LocalhostGeoResult = { country: string; source: "dev" };

function localhostHostname(host: string | null | undefined): string | null {
  if (!host) return null;
  return host.split(":")[0]?.toLowerCase() ?? null;
}

export function isLocalhostRequest(headers: Headers): boolean {
  const host = localhostHostname(headers.get("host"));
  if (!host) return false;
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

/**
 * On localhost without edge/IP geo, apply SALVYA_DEV_COUNTRY immediately (non-production).
 */
export function tryLocalhostDevFallback(
  headers: Headers,
  edgeCountry: string | null,
  ipCountry: string | null,
): LocalhostGeoResult | null {
  if (process.env.NODE_ENV === "production") return null;
  if (!isLocalhostRequest(headers)) return null;
  if (edgeCountry || ipCountry) return null;

  const dev = devCountryOverride();
  if (!dev) return null;

  if (isGeoDebugEnabled()) {
    geoLogServer(`localhost fallback activated = ${dev}`, {
      host: headers.get("host"),
      edgeCountry,
      ipCountry,
    });
  }

  return { country: normalizeCountryCode(dev)!, source: "dev" };
}
