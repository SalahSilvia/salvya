import { readDevCountryFromStorage, SALVYA_DEV_GEO_HEADER, SALVYA_DEV_GEO_QUERY } from "@/lib/geo/dev-override";
import { SALVYA_INTL_LOCALES_HEADER, SALVYA_TZ_OFFSET_HEADER } from "@/lib/geo/morocco-heuristic";
import { SALVYA_TZ_HEADER } from "@/lib/geo/resolve-country";

/** Apply geo query params to request headers for resolution. */
export function applyGeoQueryParamsToHeaders(
  headers: Headers,
  searchParams: URLSearchParams,
): void {
  const tz = searchParams.get("tz")?.trim();
  if (tz && !headers.get(SALVYA_TZ_HEADER)) {
    headers.set(SALVYA_TZ_HEADER, tz);
  }

  const tzOffset = searchParams.get("tzOffset")?.trim();
  if (tzOffset && !headers.get(SALVYA_TZ_OFFSET_HEADER)) {
    headers.set(SALVYA_TZ_OFFSET_HEADER, tzOffset);
  }

  const intlLocales = searchParams.get("intlLocales")?.trim();
  if (intlLocales && !headers.get(SALVYA_INTL_LOCALES_HEADER)) {
    headers.set(SALVYA_INTL_LOCALES_HEADER, intlLocales);
  }

  const geo = searchParams.get(SALVYA_DEV_GEO_QUERY)?.trim();
  if (geo && !headers.get(SALVYA_DEV_GEO_HEADER)) {
    headers.set(SALVYA_DEV_GEO_HEADER, geo);
  }
}

/** Build query string + fetch headers from the browser for /api/geo/detect. */
export function buildClientGeoDetectRequest(): {
  query: string;
  headers: Record<string, string>;
} {
  const params = new URLSearchParams();
  const headers: Record<string, string> = {};

  if (typeof Intl !== "undefined") {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) {
      params.set("tz", tz);
      headers[SALVYA_TZ_HEADER] = tz;
    }
  }

  const offset = new Date().getTimezoneOffset();
  params.set("tzOffset", String(offset));
  headers[SALVYA_TZ_OFFSET_HEADER] = String(offset);

  if (typeof navigator !== "undefined" && navigator.languages?.length) {
    const intlLocales = navigator.languages.join(",");
    params.set("intlLocales", intlLocales);
    headers[SALVYA_INTL_LOCALES_HEADER] = intlLocales;
  }

  const devCountry = readDevCountryFromStorage();
  if (devCountry) {
    params.set(SALVYA_DEV_GEO_QUERY, devCountry);
    headers[SALVYA_DEV_GEO_HEADER] = devCountry;
  }

  const qs = params.toString();
  return { query: qs ? `?${qs}` : "", headers };
}
