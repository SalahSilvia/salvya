import type { GeoConfidence, GeoDetectSource, GeoSignalTrace } from "@/lib/geo/types";
import { isStrongGeoSource } from "@/lib/geo/persist-policy";

const WEAK_SOURCES = new Set<GeoDetectSource>(["timezone", "accept-language", "tz-offset"]);

/**
 * Confidence rules (strict):
 * - edge / ip / manual / dev → HIGH, not weak
 * - timezone only OR locale only → LOW, weak
 * - timezone + locale (no IP) → LOW, weak (must not persist)
 */
export function deriveConfidence(
  country: string,
  source: GeoDetectSource,
  signals: GeoSignalTrace[],
): { confidence: GeoConfidence; weakDetection: boolean } {
  if (isStrongGeoSource(source) || source === "cookie") {
    return { confidence: "HIGH", weakDetection: false };
  }

  if (source === "currency-hint") {
    return { confidence: "MEDIUM", weakDetection: true };
  }

  const tzMatch = signals.some((s) => s.source === "timezone" && s.country === country);
  const localeMatch = signals.some(
    (s) => s.source === "accept-language" && s.country === country,
  );

  if (source === "timezone" && !localeMatch) {
    return { confidence: "LOW", weakDetection: true };
  }

  if (source === "accept-language" && !tzMatch) {
    return { confidence: "LOW", weakDetection: true };
  }

  if (WEAK_SOURCES.has(source) || (tzMatch && localeMatch)) {
    return { confidence: "LOW", weakDetection: true };
  }

  return { confidence: "LOW", weakDetection: true };
}

export function computeSignalScores(signals: GeoSignalTrace[]): {
  edge: number;
  ip: number;
  timezone: number;
  locale: number;
} {
  const max = (source: GeoDetectSource) =>
    signals.filter((s) => s.source === source).reduce((m, s) => Math.max(m, s.weight), 0);

  return {
    edge: max("edge"),
    ip: max("ip"),
    timezone: Math.max(max("timezone"), max("tz-offset")),
    locale: max("accept-language"),
  };
}
