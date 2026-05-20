import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { rbacApiForbidden, rbacApiNotConfigured, rbacApiUnauthorized } from "@/lib/auth/api-errors";
import { getAuthenticatedSalvyaUser } from "@/lib/auth/get-user-role";
import { roleSatisfies, type AuthenticatedSalvyaUser, type SalvyaRole } from "@/lib/auth/roles";
import { getSsrEnv } from "@/lib/supabase/server-ssr";

export type RequireRoleSuccess = {
  ok: true;
  user: AuthenticatedSalvyaUser;
  /** Pass through to merge Set-Cookie headers from auth refresh. */
  response: NextResponse;
};

export type RequireRoleFailure = {
  ok: false;
  response: NextResponse;
};

export type RequireRoleResult = RequireRoleSuccess | RequireRoleFailure;

/**
 * Server-side API guard. Verifies session + role from DB (never client metadata).
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: readonly SalvyaRole[],
): Promise<RequireRoleResult> {
  if (!getSsrEnv()) {
    return { ok: false, response: rbacApiNotConfigured() };
  }

  const response = NextResponse.next();
  const session = await getAuthenticatedSalvyaUser(request, response);

  if (!session) {
    return { ok: false, response: rbacApiUnauthorized() };
  }

  if (!roleSatisfies(session.role, allowedRoles)) {
    return { ok: false, response: rbacApiForbidden() };
  }

  return { ok: true, user: session, response };
}

/** Any signed-in user with a valid DB profile (storefront sync APIs). */
export async function requireAuthenticated(
  request: NextRequest,
): Promise<RequireRoleResult> {
  return requireRole(request, ["customer", "influencer", "admin", "god_admin"]);
}
