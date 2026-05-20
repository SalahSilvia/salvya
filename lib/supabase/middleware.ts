import { NextResponse, type NextRequest } from "next/server";
import { rbacApiForbidden, rbacApiUnauthorized } from "@/lib/auth/api-errors";
import { getAuthenticatedUserFromRequest, getUserRoleById } from "@/lib/auth/get-user-role";
import { roleSatisfies } from "@/lib/auth/roles";
import {
  resolveRouteAccess,
  routeRequiresAuthentication,
} from "@/lib/auth/route-policy";
import { loginHref } from "@/lib/auth/login-href";
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
    return NextResponse.redirect(new URL("/", request.url));
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
    return NextResponse.redirect(login);
  }

  const role = (await getUserRoleById(user.id)) ?? "customer";

  if (!roleSatisfies(role, access.roles)) {
    if (access.kind === "api") {
      return rbacApiForbidden();
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathForPolicy.startsWith("/admin")) {
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  }

  return response;
}
