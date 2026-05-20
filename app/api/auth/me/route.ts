import type { NextRequest } from "next/server";
import { rbacApiJson, rbacApiJsonWithAuthCookies } from "@/lib/auth/api-errors";
import { loadSessionForUser } from "@/lib/auth/load-session-for-user";
import { requireAuthenticated } from "@/lib/auth/require-role";

/** Trusted session: DB role, capabilities, and profile (never from client cache). */
export async function GET(request: NextRequest) {
  const auth = await requireAuthenticated(request);
  if (!auth.ok) return auth.response;

  try {
    const session = await loadSessionForUser(auth.user);
    return rbacApiJsonWithAuthCookies(auth.response, { ok: true, user: session });
  } catch (e) {
    return rbacApiJsonWithAuthCookies(
      auth.response,
      { ok: false, error: e instanceof Error ? e.message : "session_load_failed" },
      { status: 500 },
    );
  }
}
