import { isMoroccoTimezoneOffset, parseTimezoneOffsetMinutes } from "@/lib/geo/tz-offset";

export const SALVYA_TZ_OFFSET_HEADER = "x-salvya-tz-offset";
export const SALVYA_INTL_LOCALES_HEADER = "x-salvya-intl-locales";

function hasArabicAcceptLanguage(acceptLanguage: string | null | undefined): boolean {
  if (!acceptLanguage) return false;
  const al = acceptLanguage.toLowerCase();
  return /\bar(-|_|,|;|$)/.test(al) || /\bar-ma\b/.test(al) || al.startsWith("ar");
}

function hasMoroccoIntlLocale(intlLocales: string | null | undefined): boolean {
  if (!intlLocales) return false;
  const raw = intlLocales.toLowerCase();
  return /\bar-ma\b/.test(raw) || /\bfr-ma\b/.test(raw) || /\bber-ma\b/.test(raw);
}

export type MoroccoParisHeuristicResult = {
  country: "MA";
  reason: string;
} | null;

/**
 * Many Moroccan Windows PCs use Europe/Paris while IP geo is unavailable.
 * Prefer MA when Arabic / MA Intl / weak MA offset supports it.
 */
export function reconcileMoroccoParisHeuristic(opts: {
  timezone: string | null;
  acceptLanguage: string | null;
  tzOffsetHeader: string | null;
  intlLocalesHeader: string | null;
}): MoroccoParisHeuristicResult {
  const tz = opts.timezone?.trim();
  if (tz !== "Europe/Paris") return null;

  const offset = parseTimezoneOffsetMinutes(opts.tzOffsetHeader);
  const arabic = hasArabicAcceptLanguage(opts.acceptLanguage);
  const maIntl = hasMoroccoIntlLocale(opts.intlLocalesHeader);
  const maOffset = isMoroccoTimezoneOffset(offset);

  if (arabic) {
    return {
      country: "MA",
      reason: "Morocco heuristic: Europe/Paris timezone with Arabic signals",
    };
  }

  if (maIntl) {
    return {
      country: "MA",
      reason: "Morocco heuristic: Europe/Paris with MA Intl locale",
    };
  }

  if (maOffset) {
    return {
      country: "MA",
      reason: "Morocco heuristic: Europe/Paris with Morocco timezone offset",
    };
  }

  return null;
}
