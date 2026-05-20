import { locales, defaultLocale, type AppLocale, isAppLocale } from "@/i18n/routing";

const LOCALE_PATTERN = new RegExp(`^/(${locales.join("|")})(?=/|$)`);

/** Strip `/fr` prefix for auth/route matching. */
export function stripLocaleFromPathname(pathname: string): string {
  const match = pathname.match(LOCALE_PATTERN);
  if (!match) return pathname;
  const rest = pathname.slice(match[0].length);
  return rest === "" ? "/" : rest;
}

export function getLocaleFromPathname(pathname: string): AppLocale {
  const match = pathname.match(LOCALE_PATTERN);
  if (match && isAppLocale(match[1])) return match[1];
  return defaultLocale;
}

/** Prefix internal path with locale (path must start with `/`, no locale yet). */
export function withLocalePath(path: string, locale: AppLocale): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (LOCALE_PATTERN.test(normalized)) return normalized;
  if (normalized === "/") return `/${locale}`;
  return `/${locale}${normalized}`;
}
