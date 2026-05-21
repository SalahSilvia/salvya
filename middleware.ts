import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { getLocaleFromPathname, withLocalePath } from "@/lib/i18n/pathname";
import {
  isLocaleFreePath,
  localePrefixedAdminPath,
} from "@/lib/i18n/locale-free-paths";
import {
  COOKIE_DETECTED_COUNTRY,
  COOKIE_DISPLAY_CURRENCY,
  COOKIE_GEO_LOCKED,
  COOKIE_GEO_MANUAL,
  COOKIE_GEO_RESOLVED,
  COOKIE_PREF_COUNTRY,
  GEO_COOKIE_MAX_AGE,
} from "@/lib/geo/constants";
import { normalizeCountryCode } from "@/lib/geo/country-map";
import { detectCountryFromHeaders } from "@/lib/geo/detect-country";
import { apexToWwwRedirect } from "@/lib/middleware/canonical-host";
import { isGeoAndIntlBypass, isStaticMiddlewareBypass } from "@/lib/middleware/bypass";
import { safeRedirect } from "@/lib/middleware/safe-redirect";
import { updateSession } from "@/lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

function attachDetectedCountryCookie(request: NextRequest, response: NextResponse): NextResponse {
  const edgeCountry = detectCountryFromHeaders(request.headers);
  if (edgeCountry) {
    response.headers.set("x-salvya-edge-country", edgeCountry);
  }

  if (request.cookies.get(COOKIE_DETECTED_COUNTRY)?.value) {
    return response;
  }

  const pref = normalizeCountryCode(request.cookies.get(COOKIE_PREF_COUNTRY)?.value);
  const geoManual = request.cookies.get(COOKIE_GEO_MANUAL)?.value === "1";
  const geoLocked = request.cookies.get(COOKIE_GEO_LOCKED)?.value === "1";
  if (geoLocked || (geoManual && pref === "MA")) {
    return response;
  }

  if (!edgeCountry) return response;

  response.cookies.set(COOKIE_DETECTED_COUNTRY, edgeCountry, {
    path: "/",
    maxAge: GEO_COOKIE_MAX_AGE,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
  });
  return response;
}

function localizeRedirectLocation(request: NextRequest, location: string): string {
  const locale = getLocaleFromPathname(request.nextUrl.pathname);
  try {
    const url = new URL(location, request.url);
    if (isLocaleFreePath(url.pathname)) {
      return url.toString();
    }
    if (!url.pathname.match(/^\/(en|fr|es|it|nl|ar)(?=\/|$)/)) {
      url.pathname = withLocalePath(url.pathname, locale);
    }
    return url.toString();
  } catch {
    return location;
  }
}

function attachMoroccoEntryCookies(response: NextResponse): NextResponse {
  const base = {
    path: "/",
    maxAge: GEO_COOKIE_MAX_AGE,
    sameSite: "lax" as const,
    secure: true,
  };
  response.cookies.set(COOKIE_PREF_COUNTRY, "MA", base);
  response.cookies.set(COOKIE_DISPLAY_CURRENCY, "MAD", base);
  response.cookies.set(COOKIE_GEO_RESOLVED, "1", base);
  response.cookies.set(COOKIE_GEO_LOCKED, "1", base);
  response.cookies.set(COOKIE_GEO_MANUAL, "1", base);
  return response;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isStaticMiddlewareBypass(pathname)) {
    return NextResponse.next({ request });
  }

  if (pathname === "/ma" || pathname.startsWith("/ma/")) {
    const target = new URL("/fr/shop", request.url);
    return attachMoroccoEntryCookies(safeRedirect(request, target));
  }

  const canonical = apexToWwwRedirect(request);
  if (canonical) return canonical;

  const adminWithoutLocale = localePrefixedAdminPath(pathname);
  if (adminWithoutLocale) {
    return safeRedirect(request, new URL(adminWithoutLocale, request.url));
  }

  if (isLocaleFreePath(pathname) || isGeoAndIntlBypass(pathname)) {
    return updateSession(request);
  }

  const intlResponse = intlMiddleware(request);
  const sessionResponse = await updateSession(request);

  if (sessionResponse.status >= 300 && sessionResponse.status < 400) {
    const location = sessionResponse.headers.get("location");
    if (location) {
      return safeRedirect(request, localizeRedirectLocation(request, location));
    }
    return sessionResponse;
  }

  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    const location = intlResponse.headers.get("location");
    if (location) {
      return safeRedirect(request, location);
    }
    return intlResponse;
  }

  sessionResponse.headers.forEach((value, key) => {
    if (key.toLowerCase() === "location") return;
    intlResponse.headers.set(key, value);
  });

  return attachDetectedCountryCookie(request, intlResponse);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|_next/webpack-hmr|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?|ttf|otf|eot|txt|xml|webmanifest|map)$).*)",
  ],
};
