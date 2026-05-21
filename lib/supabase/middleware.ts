import { NextResponse, type NextRequest } from "next/server";
import { rbacApiForbidden, rbacApiUnauthorized } from "@/lib/auth/api-errors";
import { getAuthenticatedUserFromRequest, getUserRoleById } from "@/lib/auth/get-user-role";
import { loginHref, safeNextPath } from "@/lib/auth/login-href";
import { roleSatisfies } from "@/lib/auth/roles";
import {
  resolveRouteAccess,
  routeRequiresAuthentication,
} from "@/lib/auth/route-policy";
import { isAuthEntryPath } from "@/lib/middleware/auth-entry";
import { isGeoAndIntlBypass } from "@/lib/middleware/bypass";
import { safeRedirect } from "@/lib/middleware/safe-redirect";
import { stripLocaleFromPathname } from "@/lib/i18n/pathname";
import { createServerSupabase, getSsrEnv } from "@/lib/supabase/server-ssr";

function failClosedForProtected(
  request: NextRequest,
  access: ReturnType<typeof resolveRouteAccess>,
  reason: string,
): NextResponse {
  if (access.kind === "api") {
    return rbacApiUnauthorized(reason);
  }
  if (pathRequiresStrictAuth(request.nextUrl.pathname)) {
    return safeRedirect(request, new URL("/", request.url));
  }
  return NextResponse.next({ request });
}

/** Admin and privileged APIs must never bypass RBAC when auth is unavailable. */
function pathRequiresStrictAuth(pathname: string): boolean {
  const path = stripLocaleFromPathname(pathname);
  return (
    path.startsWith("/admin") ||
    path.startsWith("/api/admin") ||
    path.startsWith("/api/me") ||
    path.startsWith("/api/account") ||
    path.startsWith("/api/creator")
  );
}

/**
 * Refreshes auth cookies and enforces RBAC for protected pages and APIs.
 */
export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const pathForPolicy = stripLocaleFromPathname(pathname);
  const access = resolveRouteAccess(pathForPolicy);
  const protectedRoute = routeRequiresAuthentication(access);

  if (isGeoAndIntlBypass(pathname) && access.kind === "public") {
    return NextResponse.next({ request });
  }

  if (isAuthEntryPath(pathname)) {
    return NextResponse.next({ request });
  }

  const env = getSsrEnv();
  if (!env) {
    if (protectedRoute) {
      return failClosedForProtected(request, access, "Auth is not configured");
    }
    return NextResponse.next({ request });
  }

  // eslint-disable-next-line prefer-const -- Supabase SSR attaches Set-Cookie on this response
  let response = NextResponse.next({ request });

  let user: Awaited<ReturnType<typeof getAuthenticatedUserFromRequest>> = null;

  try {
    const supabase = createServerSupabase(request, response);
    const {
      data: { user: sessionUser },
    } = await supabase.auth.getUser();
    user = sessionUser ?? null;
  } catch {
    if (protectedRoute) {
      return failClosedForProtected(request, access, "Session validation failed");
    }
    return NextResponse.next({ request });
  }

  if (!protectedRoute) {
    return response;
  }

  if (!user) {
    if (access.kind === "api") {
      return rbacApiUnauthorized();
    }
    const login = new URL(loginHref(pathname), request.url);
    const loginPath = stripLocaleFromPathname(login.pathname);
    const currentPath = stripLocaleFromPathname(pathname);
    if (currentPath === loginPath) {
      return NextResponse.next({ request });
    }
    const nextParam = request.nextUrl.searchParams.get("next");
    const safeNext = safeNextPath(nextParam);
    if (safeNext && stripLocaleFromPathname(safeNext) === loginPath) {
      return NextResponse.next({ request });
    }
    return safeRedirect(request, login);
  }

  const role = (await getUserRoleById(user.id)) ?? "customer";

  if (!roleSatisfies(role, access.roles)) {
    if (access.kind === "api") {
      return rbacApiForbidden();
    }
    return safeRedirect(request, new URL("/", request.url));
  }

  if (pathForPolicy.startsWith("/admin")) {
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  }

  return response;
}
