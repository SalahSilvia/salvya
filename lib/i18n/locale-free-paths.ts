import { locales } from "@/i18n/routing";
import { stripLocaleFromPathname } from "@/lib/i18n/pathname";

const LOCALE_FREE_PREFIXES = ["/admin", "/api", "/auth", "/p"] as const;

const LOCALE_SEGMENT = locales.join("|");

/** Paths that must never receive a locale prefix (admin, API, auth callbacks). */
export function isLocaleFreePath(pathname: string): boolean {
  const path = stripLocaleFromPathname(pathname);
  return LOCALE_FREE_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );
}

/** Mistaken `/en/admin` style URLs from localized auth redirects. */
export function localePrefixedAdminPath(pathname: string): string | null {
  const match = pathname.match(
    new RegExp(`^/(${LOCALE_SEGMENT})(/admin(?:/.*)?)$`)
  );
  return match?.[2] ?? null;
}
