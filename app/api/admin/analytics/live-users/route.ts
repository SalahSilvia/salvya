import type { NextRequest } from "next/server";
import { computeLiveUsers } from "@/lib/admin/analytics-snapshot";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import { rbacApiJsonWithAuthCookies } from "@/lib/auth/api-errors";

/** Sessions with `last_seen_at` within the last N minutes (default 2 = “online now”). */
export async function GET(request: NextRequest) {
  const ctx = await requireAdminService(request);
  if (!ctx.ok) return ctx.response;

  const raw = request.nextUrl.searchParams.get("minutes");
  const n = Number.parseInt(raw ?? "", 10);
  const minutes = Number.isFinite(n) ? Math.min(15, Math.max(1, n)) : 2;

  try {
    const data = await computeLiveUsers(ctx.service, minutes);
    return rbacApiJsonWithAuthCookies(ctx.authResponse, { ok: true, data });
  } catch (e) {
    return rbacApiJsonWithAuthCookies(
      ctx.authResponse,
      { ok: false, error: e instanceof Error ? e.message : "live_users_failed" },
      { status: 500 },
    );
  }
}
