import type { CurrencyCode } from "@/lib/currency/config";
import { normalizeCountryCode } from "@/lib/geo/country-map";
import type { GeoCookieState } from "@/lib/geo/cookie-state";
import { reconcileMoroccoParisHeuristic } from "@/lib/geo/morocco-heuristic";
import { isMoroccoTimezoneOffset, parseTimezoneOffsetMinutes } from "@/lib/geo/tz-offset";
import type { GeoDetectSource } from "@/lib/geo/types";

export const MOROCCO_COUNTRY = "MA";
export const MOROCCO_CURRENCY = "MAD";
export const CASABLANCA_TIMEZONE = "Africa/Casablanca";

export function isMoroccoManualLock(state: GeoCookieState): boolean {
  return Boolean(
    state.geoLocked || (state.geoManual && state.pref === MOROCCO_COUNTRY),
  );
}

export function isMoroccoPreference(state: GeoCookieState): boolean {
  return state.pref === MOROCCO_COUNTRY;
}

export function hasMoroccoIntlLocale(intlLocales: string | null | undefined): boolean {
  if (!intlLocales) return false;
  const raw = intlLocales.toLowerCase();
  return /\bar-ma\b/.test(raw) || /\bfr-ma\b/.test(raw) || /\bber-ma\b/.test(raw);
}

export function hasMoroccoAcceptLanguage(acceptLanguage: string | null | undefined): boolean {
  if (!acceptLanguage) return false;
  const al = acceptLanguage.toLowerCase();
  return /\bar-ma\b/.test(al) || /\bfr-ma\b/.test(al);
}

export type MoroccoDeviceSignal = {
  country: typeof MOROCCO_COUNTRY;
  strength: "strong" | "medium";
  source: GeoDetectSource;
  reason: string;
  persistable: boolean;
};

export function inferMoroccoFromDeviceSignals(opts: {
  timezone: string | null;
  acceptLanguage: string | null;
  tzOffsetHeader: string | null;
  intlLocalesHeader: string | null;
  displayCurrency?: string | null;
  geoManual?: boolean;
}): MoroccoDeviceSignal | null {
  const tz = opts.timezone?.trim();
  if (tz === CASABLANCA_TIMEZONE) {
    return {
      country: MOROCCO_COUNTRY,
      strength: "strong",
      source: "timezone",
      reason: "Africa/Casablanca timezone — strong Morocco signal",
      persistable: true,
    };
  }

  if (hasMoroccoIntlLocale(opts.intlLocalesHeader) || hasMoroccoAcceptLanguage(opts.acceptLanguage)) {
    return {
      country: MOROCCO_COUNTRY,
      strength: "strong",
      source: "accept-language",
      reason: "ar-MA / fr-MA locale — strong Morocco signal",
      persistable: true,
    };
  }

  const paris = reconcileMoroccoParisHeuristic({
    timezone: opts.timezone,
    acceptLanguage: opts.acceptLanguage,
    tzOffsetHeader: opts.tzOffsetHeader,
    intlLocalesHeader: opts.intlLocalesHeader,
  });
  if (paris) {
    return {
      country: MOROCCO_COUNTRY,
      strength: "medium",
      source: "timezone",
      reason: paris.reason,
      persistable: true,
    };
  }

  const offset = parseTimezoneOffsetMinutes(opts.tzOffsetHeader);
  if (isMoroccoTimezoneOffset(offset) && hasMoroccoIntlLocale(opts.intlLocalesHeader)) {
    return {
      country: MOROCCO_COUNTRY,
      strength: "medium",
      source: "tz-offset",
      reason: "Morocco UTC offset with MA Intl locale",
      persistable: true,
    };
  }

  if (!opts.geoManual && opts.displayCurrency === MOROCCO_CURRENCY) {
    return {
      country: MOROCCO_COUNTRY,
      strength: "medium",
      source: "currency-hint",
      reason: "MAD display currency — bias toward Morocco",
      persistable: false,
    };
  }

  return null;
}

/** Moroccan mobile ISPs often geo to FR; device signals should win on first visit. */
export function shouldPreferMoroccoOverEdge(
  edgeOrIpCountry: string | null,
  signal: MoroccoDeviceSignal | null,
): boolean {
  const edge = normalizeCountryCode(edgeOrIpCountry);
  if (!edge || edge === MOROCCO_COUNTRY || !signal) return false;
  if (edge !== "FR") return false;
  return signal.strength === "strong" || (signal.strength === "medium" && signal.persistable);
}

export function shouldBlockEdgeOverrideOfSavedMorocco(
  savedPref: string | null,
  geoManual: boolean,
): boolean {
  const pref = normalizeCountryCode(savedPref);
  return pref === MOROCCO_COUNTRY && geoManual;
}

export function enforceMoroccoManualSelection(input: {
  country: string;
  currency: CurrencyCode;
  manual?: boolean;
}): { country: string; currency: CurrencyCode; manual?: boolean; geoLocked?: boolean } {
  const code = normalizeCountryCode(input.country);
  if (input.manual && code === MOROCCO_COUNTRY) {
    return {
      country: MOROCCO_COUNTRY,
      currency: MOROCCO_CURRENCY,
      manual: true,
      geoLocked: true,
    };
  }
  return input;
}

export function moroccoPricingCountry(
  cookieState: GeoCookieState,
  resolvedCountry: string | null,
): string | null {
  if (isMoroccoManualLock(cookieState) || isMoroccoPreference(cookieState)) {
    return MOROCCO_COUNTRY;
  }
  if (cookieState.displayCurrency === MOROCCO_CURRENCY && !cookieState.geoManual) {
    const resolved = normalizeCountryCode(resolvedCountry);
    if (resolved === "FR") return MOROCCO_COUNTRY;
  }
  return resolvedCountry;
}
