import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { getLocaleFromPathname, withLocalePath } from "@/lib/i18n/pathname";
import {
  isLocaleFreePath,
  localePrefixedAdminPath,
} from "@/lib/i18n/locale-free-paths";
import { COOKIE_DETECTED_COUNTRY, GEO_COOKIE_MAX_AGE } from "@/lib/geo/constants";
import { geoLogServer, isGeoDebugEnabled } from "@/lib/geo/debug";
import { detectCountryFromHeaders } from "@/lib/geo/detect-country";
import { updateSession } from "@/lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

function attachDetectedCountryCookie(request: NextRequest, response: NextResponse): NextResponse {
  const country = detectCountryFromHeaders(request.headers);
  if (!country) return response;
  const existing = request.cookies.get(COOKIE_DETECTED_COUNTRY)?.value?.trim().toUpperCase();
  if (existing === country) return response;
  if (isGeoDebugEnabled()) {
    geoLogServer("middleware edge detected country =", { country, previous: existing ?? null });
  }
  response.cookies.set(COOKIE_DETECTED_COUNTRY, country, {
    path: "/",
    maxAge: GEO_COOKIE_MAX_AGE,
    sameSite: "lax",
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

const LOCALE_MANIFEST = /^\/(en|fr|es|it|nl|ar)\/manifest\.webmanifest$/;

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (LOCALE_MANIFEST.test(pathname)) {
    return NextResponse.redirect(new URL("/manifest.webmanifest", request.url));
  }

  const adminWithoutLocale = localePrefixedAdminPath(pathname);
  if (adminWithoutLocale) {
    return NextResponse.redirect(new URL(adminWithoutLocale, request.url));
  }

  if (isLocaleFreePath(pathname)) {
    const sessionResponse = await updateSession(request);
    return attachDetectedCountryCookie(request, sessionResponse);
  }

  const intlResponse = intlMiddleware(request);
  const sessionResponse = await updateSession(request);

  if (sessionResponse.status >= 300 && sessionResponse.status < 400) {
    const location = sessionResponse.headers.get("location");
    if (location) {
      return NextResponse.redirect(localizeRedirectLocation(request, location));
    }
    return sessionResponse;
  }

  sessionResponse.headers.forEach((value, key) => {
    if (key.toLowerCase() === "location") return;
    intlResponse.headers.set(key, value);
  });

  return attachDetectedCountryCookie(request, intlResponse);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sentry-tunnel|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
