import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { rbacApiJson, rbacApiJsonWithAuthCookies, rbacApiNotConfigured } from "@/lib/auth/api-errors";
import { getAuthenticatedSalvyaUser } from "@/lib/auth/get-user-role";
import { loadSessionForUser } from "@/lib/auth/load-session-for-user";
import { getSsrEnv } from "@/lib/supabase/server-ssr";

/**
 * Session probe for client nav and account UI.
 * Returns 200 with `user: null` for guests (never 401) so browsers do not log spurious errors.
 */
export async function GET(request: NextRequest) {
  if (!getSsrEnv()) {
    return rbacApiJson({ ok: true, user: null });
  }

  const response = NextResponse.next();
  const authUser = await getAuthenticatedSalvyaUser(request, response);

  if (!authUser) {
    return rbacApiJsonWithAuthCookies(response, { ok: true, user: null });
  }

  try {
    const session = await loadSessionForUser(authUser);
    return rbacApiJsonWithAuthCookies(response, { ok: true, user: session });
  } catch (e) {
    return rbacApiJsonWithAuthCookies(
      response,
      { ok: false, error: e instanceof Error ? e.message : "session_load_failed" },
      { status: 500 },
    );
  }
}
