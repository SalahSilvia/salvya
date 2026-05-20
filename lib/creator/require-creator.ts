import type { NextRequest } from "next/server";
import { rbacApiForbidden, rbacApiJson, rbacApiNotConfigured, rbacApiUnauthorized } from "@/lib/auth/api-errors";
import { getAuthenticatedSalvyaUser } from "@/lib/auth/get-user-role";
import { canAccessCreatorDashboard } from "@/lib/auth/creator-lifecycle";
import type { AuthenticatedSalvyaUser } from "@/lib/auth/roles";
import { getSsrEnv } from "@/lib/supabase/server-ssr";
import { NextResponse } from "next/server";

export type RequireCreatorSuccess = {
  ok: true;
  user: AuthenticatedSalvyaUser;
  response: NextResponse;
};

export type RequireCreatorFailure = { ok: false; response: NextResponse };

export async function requireCreator(
  request: NextRequest,
): Promise<RequireCreatorSuccess | RequireCreatorFailure> {
  if (!getSsrEnv()) {
    return { ok: false, response: rbacApiNotConfigured() };
  }

  const response = NextResponse.next();
  const session = await getAuthenticatedSalvyaUser(request, response);
  if (!session) {
    return { ok: false, response: rbacApiUnauthorized() };
  }

  if (!canAccessCreatorDashboard(session.role)) {
    return { ok: false, response: rbacApiForbidden() };
  }

  return { ok: true, user: session, response };
}

export function creatorOnlyJsonError(): NextResponse {
  return rbacApiJson({ ok: false, error: "Creator access required." }, { status: 403 });
}
