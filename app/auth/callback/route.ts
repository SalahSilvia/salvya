import { NextResponse, type NextRequest } from "next/server";
import { getAuthRedirectOrigin } from "@/lib/auth/auth-origin";
import { resolvePostLoginRedirect } from "@/lib/auth/post-login-redirect";
import { safeNextPath } from "@/lib/auth/login-href";
import { getUserRoleById } from "@/lib/auth/get-user-role";
import { linkGuestOrdersToUser } from "@/lib/orders/link-guest-orders";
import { createServerSupabase, getSsrEnv } from "@/lib/supabase/server-ssr";
import { createServiceSupabase } from "@/lib/supabase/service";

/**
 * Exchanges the Supabase `code` (PKCE) using cookies from this request, then redirects.
 * Must stay a Route Handler (not a Client Component) so the verifier cookie is available.
 * Destination is chosen from DB role + safe `next` (never an open redirect to protected routes).
 */
export async function GET(request: NextRequest) {
  const env = getSsrEnv();
  if (!env) {
    return NextResponse.redirect(new URL("/login?auth=not_configured", request.url));
  }

  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextRaw = requestUrl.searchParams.get("next");
  const next = safeNextPath(nextRaw);

  if (!code) {
    return NextResponse.redirect(new URL("/login?auth=missing_code", request.url));
  }

  const origin = getAuthRedirectOrigin();

  /** Cookie jar for PKCE exchange — Location header updated after role resolution. */
  // eslint-disable-next-line prefer-const -- Supabase SSR mutates cookies on this response before return
  let response = NextResponse.redirect(new URL("/", origin));

  try {
    const supabase = createServerSupabase(request, response);
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const login = new URL("/login", origin);
      login.searchParams.set("auth", "error");
      login.searchParams.set("message", error.message);
      if (next) login.searchParams.set("next", next);
      return NextResponse.redirect(login);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const login = new URL("/login", origin);
      login.searchParams.set("auth", "error");
      login.searchParams.set("message", "missing_session");
      if (next) login.searchParams.set("next", next);
      return NextResponse.redirect(login);
    }

    const linkService = createServiceSupabase();
    if (linkService && user.email) {
      try {
        await linkGuestOrdersToUser(linkService, user.id, user.email);
      } catch {
        /* non-fatal */
      }
    }

    const role = (await getUserRoleById(user.id)) ?? "customer";
    const dest = resolvePostLoginRedirect(nextRaw, role);
    response.headers.set("Location", new URL(dest, origin).toString());
    return response;
  } catch {
    return NextResponse.redirect(new URL("/login?auth=not_configured", request.url));
  }
}
