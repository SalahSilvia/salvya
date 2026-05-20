import type { GeoDetectSource } from "@/lib/geo/types";

const STRONG_PERSIST_SOURCES = new Set<GeoDetectSource>(["edge", "ip", "manual", "dev"]);

/** Only IP/edge/manual/dev may write pref + geo_resolved cookies. */
export function shouldPersistPrefCountry(opts: {
  source: GeoDetectSource | null;
  geoManual: boolean;
  weakDetection: boolean;
}): boolean {
  if (opts.geoManual) return true;
  if (opts.weakDetection) return false;
  if (!opts.source) return false;
  return STRONG_PERSIST_SOURCES.has(opts.source);
}

export function isStrongGeoSource(source: GeoDetectSource | null): boolean {
  return source != null && STRONG_PERSIST_SOURCES.has(source);
}

export function cookieDecisionReason(opts: {
  source: GeoDetectSource | null;
  geoManual: boolean;
  weakDetection: boolean;
  writePref: boolean;
}): string {
  if (opts.geoManual) return "manual override — persist pref + geo_resolved";
  if (opts.weakDetection) return "weak detection — session detected only, no pref lock";
  if (opts.writePref) return `strong source (${opts.source}) — persist pref + geo_resolved`;
  return "no pref write — insufficient strong signal";
}
