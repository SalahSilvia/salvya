import type { CurrencyCode } from "@/lib/currency/config";
import { normalizeCountryCode } from "@/lib/geo/country-map";
import type { GeoCookieState } from "@/lib/geo/cookie-state";
import {
  CASABLANCA_TIMEZONE,
  hasMoroccoAcceptLanguage,
  hasMoroccoIntlLocale,
  MOROCCO_COUNTRY,
  MOROCCO_CURRENCY,
} from "@/lib/geo/morocco-stability";
import { isMoroccoTimezoneOffset, parseTimezoneOffsetMinutes } from "@/lib/geo/tz-offset";

/** Morocco wins when score >= this (manual selection is handled separately at +100). */
export const MOROCCO_WIN_THRESHOLD = 45;

const EU_MISROUTE_COUNTRIES = new Set(["FR", "EU", "BE", "ES", "IT", "NL", "DE", "GB", "CH"]);

export type MoroccoConfidenceInput = {
  cookieState: GeoCookieState;
  timezone?: string | null;
  acceptLanguage?: string | null;
  intlLocales?: string | null;
  tzOffsetHeader?: string | null;
  edgeCountry?: string | null;
  ipCountry?: string | null;
  shippingCountry?: string | null;
  phone?: string | null;
  geoManual?: boolean;
};

export type MoroccoConfidenceResult = {
  score: number;
  wins: boolean;
  reasons: string[];
  breakdown: Record<string, number>;
};

function add(
  breakdown: Record<string, number>,
  reasons: string[],
  key: string,
  points: number,
  reason: string,
): number {
  if (points <= 0) return 0;
  breakdown[key] = points;
  reasons.push(`${key}(+${points})`);
  return points;
}

function isMoroccoShippingCountry(raw: string | null | undefined): boolean {
  if (!raw) return false;
  const t = raw.trim().toLowerCase();
  return (
    t === "ma" ||
    t === "morocco" ||
    t === "maroc" ||
    t === "المغرب" ||
    /\bmorocco\b/.test(t) ||
    /\bmaroc\b/.test(t)
  );
}

function isMoroccoPhone(phone: string | null | undefined): boolean {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("212") || digits.startsWith("00212");
}

function browserLanguageBiasMorocco(acceptLanguage: string | null | undefined): boolean {
  if (!acceptLanguage) return false;
  const al = acceptLanguage.toLowerCase();
  if (hasMoroccoAcceptLanguage(al)) return true;
  return (
    /^ar(-|_|,|;|$)/.test(al) ||
    al.startsWith("ar") ||
    /^fr(-|_|,|;|$)/.test(al) ||
    al.startsWith("fr")
  );
}

/**
 * Weighted Morocco confidence (Salvya is Morocco-first).
 * Manual lock (+100) is applied outside this function.
 */
export function scoreMoroccoConfidence(input: MoroccoConfidenceInput): MoroccoConfidenceResult {
  const breakdown: Record<string, number> = {};
  const reasons: string[] = [];
  const { cookieState } = input;

  let score = 0;

  if (cookieState.geoLocked || (cookieState.geoManual && cookieState.pref === MOROCCO_COUNTRY)) {
    score += add(breakdown, reasons, "geo_locked", 100, "geo locked / manual Morocco");
    return { score, wins: true, reasons, breakdown };
  }

  if (cookieState.pref === MOROCCO_COUNTRY) {
    score += add(breakdown, reasons, "pref_ma", 50, "saved pref MA");
  }
  if (cookieState.displayCurrency === MOROCCO_CURRENCY) {
    score += add(breakdown, reasons, "currency_mad", 40, "MAD display currency");
  }
  if (cookieState.geoResolved && cookieState.pref === MOROCCO_COUNTRY) {
    score += add(breakdown, reasons, "returning_ma", 50, "returning Morocco visitor");
  } else if (cookieState.geoResolved && cookieState.detected === MOROCCO_COUNTRY) {
    score += add(breakdown, reasons, "detected_ma", 25, "prior detected MA");
  }

  const edge = normalizeCountryCode(input.edgeCountry);
  const ip = normalizeCountryCode(input.ipCountry);
  if (edge === MOROCCO_COUNTRY) score += add(breakdown, reasons, "edge_ma", 40, "edge MA");
  if (ip === MOROCCO_COUNTRY) score += add(breakdown, reasons, "ip_ma", 40, "IP MA");

  const tz = input.timezone?.trim();
  if (tz === CASABLANCA_TIMEZONE) {
    score += add(breakdown, reasons, "tz_casablanca", 35, "Africa/Casablanca");
  }

  if (hasMoroccoIntlLocale(input.intlLocales) || hasMoroccoAcceptLanguage(input.acceptLanguage)) {
    score += add(breakdown, reasons, "locale_ma", 30, "ar-MA / fr-MA locale");
  }

  if (browserLanguageBiasMorocco(input.acceptLanguage)) {
    score += add(breakdown, reasons, "browser_ar_fr", 15, "browser ar/fr");
  }

  const offset = parseTimezoneOffsetMinutes(input.tzOffsetHeader ?? null);
  if (isMoroccoTimezoneOffset(offset)) {
    score += add(breakdown, reasons, "tz_offset_ma", 20, "Morocco UTC offset");
  }

  if (isMoroccoShippingCountry(input.shippingCountry)) {
    score += add(breakdown, reasons, "shipping_ma", 45, "shipping Morocco");
  }

  if (isMoroccoPhone(input.phone)) {
    score += add(breakdown, reasons, "phone_212", 35, "phone +212");
  }

  const misrouteEdge = edge && EU_MISROUTE_COUNTRIES.has(edge);
  const misrouteIp = ip && EU_MISROUTE_COUNTRIES.has(ip);
  if ((misrouteEdge || misrouteIp) && score >= 30) {
    score += add(breakdown, reasons, "isp_misroute_bias", 15, "EU/FR edge with strong MA signals");
  }

  if (score < MOROCCO_WIN_THRESHOLD) {
    score += add(breakdown, reasons, "morocco_first_default", 30, "Salvya Morocco-first default bias");
  }

  return {
    score,
    wins: score >= MOROCCO_WIN_THRESHOLD,
    reasons,
    breakdown,
  };
}

/** Edge/IP should not override Morocco when confidence is high enough. */
export function shouldEdgeYieldToMorocco(
  edgeOrIpCountry: string | null,
  confidence: MoroccoConfidenceResult,
): boolean {
  const code = normalizeCountryCode(edgeOrIpCountry);
  if (!code || code === MOROCCO_COUNTRY) return false;
  if (!confidence.wins) return false;
  return EU_MISROUTE_COUNTRIES.has(code);
}

export function isMoroccoLockedState(state: GeoCookieState): boolean {
  return Boolean(
    state.geoLocked ||
    (state.geoManual && state.pref === MOROCCO_COUNTRY) ||
    state.pref === MOROCCO_COUNTRY,
  );
}
