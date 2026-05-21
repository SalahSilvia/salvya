import { stripLocaleFromPathname } from "@/lib/i18n/pathname";

const AUTH_ENTRY_PREFIXES = [
  "/login",
  "/register",
  "/signup",
  "/forgot-password",
  "/auth",
] as const;

/** Guest auth surfaces — never redirect guests away in a loop. */
export function isAuthEntryPath(pathname: string): boolean {
  const path = stripLocaleFromPathname(pathname);
  return AUTH_ENTRY_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}
