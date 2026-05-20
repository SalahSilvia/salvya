import { countryFromAcceptLanguage, normalizeDetectedCountry } from "@/lib/geo/accept-language-country";
import { normalizeCountryCode } from "@/lib/geo/country-map";
import { resolveShopperCountry } from "@/lib/geo/resolve-country";

/**
 * Best-effort country from edge headers (Vercel, Cloudflare, common proxies).
 * Safe for middleware — never blocks; returns null when unknown.
 */
export function detectCountryFromHeaders(headers: Headers): string | null {
  const candidates = [
    headers.get("x-vercel-ip-country"),
    headers.get("cf-ipcountry"),
    headers.get("x-country-code"),
    headers.get("cloudfront-viewer-country"),
  ];

  for (const raw of candidates) {
    const normalized = normalizeCountryCode(raw);
    if (normalized) return normalized;
  }

  return null;
}

/** Dev override when edge/IP lookup is unavailable (localhost). */
export function devCountryOverride(): string | null {
  if (process.env.NODE_ENV === "production") return null;
  const raw = process.env.SALVYA_DEV_COUNTRY ?? process.env.NEXT_PUBLIC_SALVYA_DEV_COUNTRY;
  return normalizeCountryCode(raw ?? null);
}

/** Full multi-signal detection — used by /api/geo/detect and server read path. */
export async function resolveDetectedCountry(headers: Headers): Promise<string | null> {
  const result = await resolveShopperCountry(headers);
  return result?.country ?? null;
}

export { normalizeDetectedCountry };

export function acceptLanguageFromHeaders(headers: Headers): string | null {
  return headers.get("accept-language");
}
