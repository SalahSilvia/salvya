/**
 * Central site URL + brand constants for SEO, OG, sitemaps, and future i18n.
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://salvya.com).
 */

export const SITE_NAME = "Salvya";
export const SITE_TAGLINE = "Artist merch & limited drops";
export const DEFAULT_DESCRIPTION =
  "Shop official artist merch on Salvya — limited drops, oversized hoodies and graphic tees, on-model fit guides, and secure fan-first checkout with European shipping.";

/** Default OG/Twitter image (absolute URL resolved at runtime). */
export const DEFAULT_OG_IMAGE_PATH = "/brand/salvya-mark.svg";

export const SUPPORTED_LOCALES = ["en", "fr", "es", "it", "nl", "ar"] as const;
export type SalvyaLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: SalvyaLocale = "en";

function normalizeSiteUrl(raw: string): string {
  const withProto = raw.startsWith("http") ? raw : `https://${raw}`;
  return withProto.replace(/\/$/, "");
}

/**
 * Canonical site origin for metadata, OG, and JSON-LD.
 * In development we default to localhost so manifest/OG URLs do not point at production
 * when `NEXT_PUBLIC_SITE_URL=https://salvya.com` is set in a local env file.
 */
export function getSiteUrl(): string {
  if (process.env.NODE_ENV === "development") {
    const devOverride = process.env.NEXT_PUBLIC_DEV_SITE_URL?.trim();
    if (devOverride) return normalizeSiteUrl(devOverride);
    const port = process.env.PORT?.trim() || "3000";
    return `http://localhost:${port}`;
  }
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.VERCEL_URL;
  if (!raw) return "https://www.salvyastore.com";
  return normalizeSiteUrl(raw);
}

/** Resolve relative paths and API routes to absolute URLs for OG/schema. */
export function absoluteUrl(path: string): string {
  if (!path) return getSiteUrl();
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalized}`;
}

export function localePath(path: string, locale: SalvyaLocale = DEFAULT_LOCALE): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized === "/") return `/${locale}`;
  return `/${locale}${normalized}`;
}

/** Locale-prefixed absolute URL for canonicals, OG, and JSON-LD. */
export function localizedAbsoluteUrl(path: string, locale: SalvyaLocale = DEFAULT_LOCALE): string {
  return absoluteUrl(localePath(path, locale));
}

export function resolveSalvyaLocale(locale: string | undefined): SalvyaLocale {
  if (locale && (SUPPORTED_LOCALES as readonly string[]).includes(locale)) {
    return locale as SalvyaLocale;
  }
  return DEFAULT_LOCALE;
}
