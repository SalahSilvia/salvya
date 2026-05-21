/**
 * Paths and assets that must not pass through intl/geo rewrites or auth page redirects.
 */

const EXACT_BYPASS_PATHS = new Set([
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.webmanifest",
]);

const PREFIX_BYPASS = [
  "/_next/static",
  "/_next/image",
  "/_next/webpack-hmr",
] as const;

/** Public media (catalog copies, brand assets) — never locale-prefix or auth-gate. */
const PUBLIC_ASSET_PREFIXES = ["/media/", "/images/", "/brand/"] as const;

const STATIC_FILE_EXTENSIONS =
  /\.(?:avif|bmp|gif|ico|jpe?g|png|svg|webp|woff2?|woff|ttf|otf|eot|txt|xml|webmanifest|map)$/i;

export function isStaticMiddlewareBypass(pathname: string): boolean {
  if (EXACT_BYPASS_PATHS.has(pathname)) return true;
  if (PREFIX_BYPASS.some((prefix) => pathname.startsWith(prefix))) return true;
  if (PUBLIC_ASSET_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return true;
  if (STATIC_FILE_EXTENSIONS.test(pathname)) return true;
  return false;
}

/** Skip intl locale redirects and geo cookie writes; session refresh may still run. */
export function isGeoAndIntlBypass(pathname: string): boolean {
  return (
    pathname === "/api" ||
    pathname.startsWith("/api/") ||
    pathname === "/auth" ||
    pathname.startsWith("/auth/")
  );
}
