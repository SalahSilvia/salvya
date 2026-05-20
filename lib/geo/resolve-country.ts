import { countryFromAcceptLanguage } from "@/lib/geo/accept-language-country";
import { computeSignalScores, deriveConfidence } from "@/lib/geo/confidence";
import { normalizeCountryCode } from "@/lib/geo/country-map";
import { detectCountryFromHeaders } from "@/lib/geo/detect-country";
import { resolveDevOverride } from "@/lib/geo/dev-override";
import { geoLogServer, isGeoDebugEnabled } from "@/lib/geo/debug";
import { getClientIpFromHeaders } from "@/lib/geo/client-ip";
import { lookupCountryFromIp } from "@/lib/geo/ip-lookup";
import { isLocalhostRequest } from "@/lib/geo/localhost-geo";
import { SALVYA_TZ_OFFSET_HEADER } from "@/lib/geo/morocco-heuristic";
import { shouldPersistPrefCountry } from "@/lib/geo/persist-policy";
import { isMoroccoTimezoneOffset, parseTimezoneOffsetMinutes } from "@/lib/geo/tz-offset";
import type {
  GeoDetectResult,
  GeoDetectSource,
  GeoResolution,
  GeoSignalTrace,
} from "@/lib/geo/types";
import { countryFromTimezone } from "@/lib/geo/timezone-country";

export type { GeoDetectResult, GeoResolution, GeoSignalTrace };
export type { GeoResolveTrace } from "@/lib/geo/types";

const SALVYA_TZ_HEADER = "x-salvya-timezone";

const WEAK_ONLY_SOURCES = new Set<GeoDetectSource>(["timezone", "accept-language", "tz-offset"]);

export type ResolveGeoContext = {
  searchParams?: URLSearchParams;
  /** Strong pref/detected from cookies (not weak). */
  persistedStrongCountry?: string | null;
  manualCountry?: string | null;
  displayCurrency?: string | null;
  geoManual?: boolean;
};

type Signal = GeoSignalTrace;

function addSignal(list: Signal[], country: string | null, source: GeoDetectSource, weight: number) {
  const code = normalizeCountryCode(country);
  if (!code) return;
  list.push({ country: code, source, weight });
}

function pickWeakBest(signals: Signal[]): { country: string; source: GeoDetectSource } | null {
  const weak = signals.filter((s) => WEAK_ONLY_SOURCES.has(s.source));
  if (weak.length === 0) return null;

  const byCountry = new Map<string, { weight: number; source: GeoDetectSource }>();
  for (const s of weak) {
    const prev = byCountry.get(s.country);
    if (!prev || s.weight > prev.weight) {
      byCountry.set(s.country, { weight: s.weight, source: s.source });
    }
  }

  let best: { country: string; source: GeoDetectSource; weight: number } | null = null;
  for (const [country, meta] of byCountry) {
    if (!best || meta.weight > best.weight) {
      best = { country, source: meta.source, weight: meta.weight };
    }
  }
  return best ? { country: best.country, source: best.source } : null;
}

function finalizeResolution(res: GeoResolution): GeoResolution {
  if (isGeoDebugEnabled()) {
    geoLogServer("[GEO] final resolution", {
      country: res.country,
      source: res.source,
      confidence: res.confidence,
      weakDetection: res.weakDetection,
      persistable: res.persistable,
      reason: res.reason,
    });
  }
  return res;
}

function buildResolution(
  partial: Omit<GeoResolution, "persistable" | "scores"> & {
    scores?: GeoResolution["scores"];
    persistable?: boolean;
  },
): GeoResolution {
  const scores = partial.scores ?? computeSignalScores(partial.signals);
  const winner =
    partial.country && partial.source
      ? { country: partial.country, source: partial.source }
      : null;

  const derived =
    winner && partial.confidence == null
      ? deriveConfidence(winner.country, winner.source, partial.signals)
      : {
          confidence: partial.confidence ?? null,
          weakDetection: partial.weakDetection ?? false,
        };

  const weakDetection = partial.weakDetection ?? derived.weakDetection;
  const resolution: GeoResolution = {
    ...partial,
    scores,
    confidence: derived.confidence,
    weakDetection,
    persistable:
      partial.persistable ??
      shouldPersistPrefCountry({
        source: partial.source,
        geoManual: partial.source === "manual",
        weakDetection,
      }),
    reason: partial.reason,
  };

  return resolution;
}

export function timezoneFromHeaders(headers: Headers): string | null {
  return headers.get(SALVYA_TZ_HEADER)?.trim() || null;
}

function tzOffsetFromHeaders(headers: Headers): number | null {
  return parseTimezoneOffsetMinutes(headers.get(SALVYA_TZ_OFFSET_HEADER));
}

/**
 * Strict production order:
 * 1. Dev override (dev only)
 * 2. Manual user country (from cookies)
 * 3. Edge / client IP (ONLY strong auto sources)
 * 4. Strong persisted cookie
 * 5. Weak signals (timezone / locale) — session hint only, never persist alone
 */
export async function resolveShopperCountryDetailed(
  headers: Headers,
  ctx: ResolveGeoContext = {},
): Promise<GeoResolution> {
  const isLocalDev = isLocalhostRequest(headers);
  const emptyScores = { edge: 0, ip: 0, timezone: 0, locale: 0 };
  const timezone = timezoneFromHeaders(headers);
  const tzOffsetMinutes = tzOffsetFromHeaders(headers);
  const acceptLanguage = headers.get("accept-language");
  const browserLocaleCountry = countryFromAcceptLanguage(acceptLanguage);

  if (isLocalDev && isGeoDebugEnabled()) {
    geoLogServer("[GEO] Running in DEV mode → IP GEO unavailable");
  }

  const devOverride = resolveDevOverride(headers, ctx.searchParams);
  if (devOverride) {
    return finalizeResolution(
      buildResolution({
        country: devOverride.country,
        source: "dev",
        confidence: "HIGH",
        weakDetection: false,
        persistable: true,
        signals: [{ country: devOverride.country, source: "dev", weight: 200 }],
        reason: `[GEO] DEV OVERRIDE ACTIVE → ${devOverride.country} (${devOverride.source})`,
        overrideSource: devOverride.source,
        edgeCountry: null,
        ipCountry: null,
        timezone,
        tzOffsetMinutes,
        acceptLanguage,
        browserLocaleCountry,
        isLocalDev,
        edgeAvailable: false,
        ipAvailable: false,
        scores: emptyScores,
      }),
    );
  }

  const edgeCountry = detectCountryFromHeaders(headers);
  const clientIp = getClientIpFromHeaders(headers);
  let ipCountry: string | null = null;
  if (clientIp) {
    ipCountry = await lookupCountryFromIp(clientIp);
  }
  const edgeAvailable = Boolean(edgeCountry);
  const ipAvailable = Boolean(ipCountry);

  if (isGeoDebugEnabled()) {
    geoLogServer("[GEO] signal availability", {
      edgeCountry,
      ipCountry,
      clientIp: clientIp ?? "(none)",
      timezone,
      browserLocaleCountry,
    });
  }

  if (ctx.geoManual && ctx.manualCountry) {
    return finalizeResolution(
      buildResolution({
        country: ctx.manualCountry,
        source: "manual",
        confidence: "HIGH",
        weakDetection: false,
        persistable: true,
        signals: [{ country: ctx.manualCountry, source: "manual", weight: 300 }],
        reason: "Manual user override — locks country",
        overrideSource: null,
        edgeCountry,
        ipCountry,
        timezone,
        tzOffsetMinutes,
        acceptLanguage,
        browserLocaleCountry,
        isLocalDev,
        edgeAvailable,
        ipAvailable,
        scores: emptyScores,
      }),
    );
  }

  const strongCountry = normalizeCountryCode(edgeCountry) ?? normalizeCountryCode(ipCountry);
  if (strongCountry) {
    const source: GeoDetectSource = edgeCountry ? "edge" : "ip";
    const localeAgrees = browserLocaleCountry === strongCountry;
    return finalizeResolution(
      buildResolution({
        country: strongCountry,
        source,
        confidence: "HIGH",
        weakDetection: false,
        persistable: true,
        signals: [
          ...(edgeCountry ? [{ country: edgeCountry, source: "edge" as const, weight: 100 }] : []),
          ...(ipCountry ? [{ country: ipCountry, source: "ip" as const, weight: 92 }] : []),
        ],
        reason: localeAgrees
          ? `IP/edge ${source} → ${strongCountry} (locale agrees)`
          : `IP/edge ${source} → ${strongCountry}`,
        overrideSource: null,
        edgeCountry,
        ipCountry,
        timezone,
        tzOffsetMinutes,
        acceptLanguage,
        browserLocaleCountry,
        isLocalDev,
        edgeAvailable,
        ipAvailable,
      }),
    );
  }

  const persisted = normalizeCountryCode(ctx.persistedStrongCountry);
  if (persisted) {
    return finalizeResolution(
      buildResolution({
        country: persisted,
        source: "cookie",
        confidence: "HIGH",
        weakDetection: false,
        persistable: true,
        signals: [{ country: persisted, source: "cookie", weight: 75 }],
        reason: "Strong persisted country cookie (from prior IP/manual)",
        overrideSource: null,
        edgeCountry,
        ipCountry,
        timezone,
        tzOffsetMinutes,
        acceptLanguage,
        browserLocaleCountry,
        isLocalDev,
        edgeAvailable,
        ipAvailable,
      }),
    );
  }

  const signals: Signal[] = [];
  const tzCountry = countryFromTimezone(timezone);
  addSignal(signals, tzCountry, "timezone", 88);
  addSignal(signals, browserLocaleCountry, "accept-language", 35);
  if (isMoroccoTimezoneOffset(tzOffsetMinutes)) {
    addSignal(signals, "MA", "tz-offset", 42);
  }

  const weak = pickWeakBest(signals);
  if (weak) {
    const base = buildResolution({
      country: weak.country,
      source: weak.source,
      confidence: "LOW",
      weakDetection: true,
      signals,
      timezone,
      tzOffsetMinutes,
      acceptLanguage,
      browserLocaleCountry,
      edgeCountry,
      ipCountry,
      reason: `Weak fallback (${weak.source}) — session hint only, will NOT persist pref`,
      overrideSource: null,
      isLocalDev,
      edgeAvailable,
      ipAvailable,
    });

    if (!ctx.geoManual && ctx.displayCurrency === "MAD" && weak.country !== "MA") {
      return finalizeResolution({
        ...base,
        country: "MA",
        source: "currency-hint",
        confidence: "MEDIUM",
        weakDetection: true,
        persistable: false,
        reason:
          "MAD display currency contradicts weak geo — pricing hints Morocco (no pref lock)",
      });
    }

    return finalizeResolution(base);
  }

  return finalizeResolution(
    buildResolution({
      country: null,
      source: null,
      signals,
      timezone,
      tzOffsetMinutes,
      acceptLanguage,
      browserLocaleCountry,
      edgeCountry,
      ipCountry,
      reason: isLocalDev
        ? "No IP/edge in DEV — set SALVYA_DEV_COUNTRY or ?geo=MA (timezone ignored for persistence)"
        : "No geo signals available",
      overrideSource: null,
      isLocalDev,
      edgeAvailable,
      ipAvailable,
      scores: emptyScores,
      confidence: null,
      weakDetection: false,
    }),
  );
}

export async function resolveShopperCountry(
  headers: Headers,
  ctx?: ResolveGeoContext,
): Promise<GeoDetectResult | null> {
  const r = await resolveShopperCountryDetailed(headers, ctx);
  return r.country && r.source ? { country: r.country, source: r.source } : null;
}

export { SALVYA_TZ_HEADER };
