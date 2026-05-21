import type { AppLocale } from "@/i18n/routing";
import type { CurrencyCode } from "@/lib/currency/config";
import { geoProfileForCountry, localeForMorocco, normalizeCountryCode } from "@/lib/geo/country-map";
import type { GeoCookieState } from "@/lib/geo/cookie-state";
import { detectCountryFromHeaders } from "@/lib/geo/detect-country";
import { geoLogServer, isGeoDebugEnabled } from "@/lib/geo/debug";
import {
  isMoroccoLockedState,
  MOROCCO_WIN_THRESHOLD,
  scoreMoroccoConfidence,
  shouldEdgeYieldToMorocco,
  type MoroccoConfidenceInput,
} from "@/lib/geo/morocco-confidence";
import { MOROCCO_COUNTRY, MOROCCO_CURRENCY } from "@/lib/geo/morocco-stability";
import { countryToMarketCode } from "@/lib/market/country-to-market";
import type { MarketCode } from "@/lib/market/types";

export type ResolvedShopperRegion = {
  country: string;
  currency: CurrencyCode;
  locale: AppLocale;
  marketCode: MarketCode;
  moroccoScore: number;
  moroccoLikely: boolean;
  source: "manual" | "locked" | "cookie" | "morocco_signals" | "edge" | "morocco_default";
  reason: string;
  edgeCountry: string | null;
  persistable: boolean;
  weakDetection: boolean;
};

export const MOROCCO_DEFAULT_REGION: ResolvedShopperRegion = {
  country: MOROCCO_COUNTRY,
  currency: MOROCCO_CURRENCY,
  locale: "fr",
  marketCode: "MA",
  moroccoScore: MOROCCO_WIN_THRESHOLD,
  moroccoLikely: true,
  source: "morocco_default",
  reason: "Salvya Morocco-first default (weak or ambiguous geo)",
  edgeCountry: null,
  persistable: true,
  weakDetection: false,
};

function buildMoroccoRegion(
  partial: Partial<ResolvedShopperRegion> &
    Pick<ResolvedShopperRegion, "source" | "reason"> & { acceptLanguage?: string | null },
): ResolvedShopperRegion {
  const locale = localeForMorocco(partial.acceptLanguage ?? null);
  return {
    country: MOROCCO_COUNTRY,
    currency: MOROCCO_CURRENCY,
    locale,
    marketCode: "MA",
    moroccoScore: partial.moroccoScore ?? MOROCCO_WIN_THRESHOLD,
    moroccoLikely: true,
    edgeCountry: partial.edgeCountry ?? null,
    persistable: partial.persistable ?? true,
    weakDetection: false,
    source: partial.source,
    reason: partial.reason,
  };
}

/**
 * Synchronous region resolution from cookies + headers (SSR-safe, no IP fetch).
 */
export function resolveRegionSync(opts: {
  cookieState: GeoCookieState;
  headers?: Headers;
  acceptLanguage?: string | null;
  edgeCountry?: string | null;
  shippingCountry?: string | null;
  phone?: string | null;
}): ResolvedShopperRegion {
  const acceptLanguage =
    opts.acceptLanguage ?? opts.headers?.get("accept-language") ?? null;
  const edge =
    opts.edgeCountry ??
    (opts.headers ? detectCountryFromHeaders(opts.headers) : null);
  const intlLocales = opts.headers?.get("x-salvya-intl-locales") ?? null;
  const timezone = opts.headers?.get("x-salvya-timezone") ?? null;
  const tzOffset = opts.headers?.get("x-salvya-tz-offset") ?? null;

  const confidenceInput: MoroccoConfidenceInput = {
    cookieState: opts.cookieState,
    acceptLanguage,
    intlLocales,
    timezone,
    tzOffsetHeader: tzOffset,
    edgeCountry: edge,
    shippingCountry: opts.shippingCountry,
    phone: opts.phone,
    geoManual: opts.cookieState.geoManual,
  };

  const confidence = scoreMoroccoConfidence(confidenceInput);

  if (opts.cookieState.geoManual && opts.cookieState.pref) {
    const profile = geoProfileForCountry(opts.cookieState.pref, acceptLanguage);
    return {
      country: profile.countryCode,
      currency:
        profile.countryCode === MOROCCO_COUNTRY ? MOROCCO_CURRENCY : profile.currency,
      locale: profile.locale,
      marketCode: countryToMarketCode(profile.countryCode),
      moroccoScore: confidence.score,
      moroccoLikely: profile.countryCode === MOROCCO_COUNTRY,
      source: "manual",
      reason: "Manual country selection",
      edgeCountry: edge,
      persistable: true,
      weakDetection: false,
    };
  }

  if (isMoroccoLockedState(opts.cookieState)) {
    return buildMoroccoRegion({
      source: "locked",
      reason: "Morocco geo lock (manual or persisted MA)",
      moroccoScore: confidence.score,
      edgeCountry: edge,
      acceptLanguage,
    });
  }

  if (opts.cookieState.pref && !opts.cookieState.geoWeak) {
    const code = opts.cookieState.pref;
    if (code === MOROCCO_COUNTRY || confidence.wins) {
      if (code === MOROCCO_COUNTRY || shouldEdgeYieldToMorocco(edge, confidence)) {
        return buildMoroccoRegion({
          source: code === MOROCCO_COUNTRY ? "cookie" : "morocco_signals",
          reason:
            code === MOROCCO_COUNTRY
              ? "Saved Morocco preference cookie"
              : `Morocco confidence ${confidence.score} overrides weak edge`,
          moroccoScore: confidence.score,
          edgeCountry: edge,
          acceptLanguage,
        });
      }
    }
    const profile = geoProfileForCountry(code, acceptLanguage);
    return {
      country: profile.countryCode,
      currency: profile.currency,
      locale: profile.locale,
      marketCode: countryToMarketCode(profile.countryCode),
      moroccoScore: confidence.score,
      moroccoLikely: false,
      source: "cookie",
      reason: "Saved country preference cookie",
      edgeCountry: edge,
      persistable: true,
      weakDetection: false,
    };
  }

  if (confidence.wins) {
    return buildMoroccoRegion({
      source: "morocco_signals",
      reason: `Morocco signals (${confidence.score}): ${confidence.reasons.join(", ")}`,
      moroccoScore: confidence.score,
      edgeCountry: edge,
      acceptLanguage,
    });
  }

  const edgeCode = normalizeCountryCode(edge);
  if (edgeCode && !shouldEdgeYieldToMorocco(edgeCode, confidence)) {
    const profile = geoProfileForCountry(edgeCode, acceptLanguage);
    return {
      country: profile.countryCode,
      currency: profile.currency,
      locale: profile.locale,
      marketCode: countryToMarketCode(profile.countryCode),
      moroccoScore: confidence.score,
      moroccoLikely: false,
      source: "edge",
      reason: `Edge geo ${edgeCode} (Morocco score ${confidence.score} below threshold)`,
      edgeCountry: edge,
      persistable: true,
      weakDetection: false,
    };
  }

  return { ...MOROCCO_DEFAULT_REGION, edgeCountry: edge, moroccoScore: confidence.score };
}

export function logResolvedRegion(region: ResolvedShopperRegion): void {
  if (!isGeoDebugEnabled()) return;
  geoLogServer("[GEO] resolveRegionSync", {
    country: region.country,
    currency: region.currency,
    locale: region.locale,
    marketCode: region.marketCode,
    moroccoScore: region.moroccoScore,
    source: region.source,
    reason: region.reason,
  });
}
