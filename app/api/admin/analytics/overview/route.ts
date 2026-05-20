import type { NextRequest } from "next/server";
import { computeAnalyticsOverview } from "@/lib/admin/analytics-snapshot";
import { parseAnalyticsDays } from "@/lib/admin/analytics-api-params";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import { rbacApiJsonWithAuthCookies } from "@/lib/auth/api-errors";

export async function GET(request: NextRequest) {
  const ctx = await requireAdminService(request);
  if (!ctx.ok) return ctx.response;

  const days = parseAnalyticsDays(request.nextUrl.searchParams.get("days"));
  try {
    const data = await computeAnalyticsOverview(ctx.service, days);
    return rbacApiJsonWithAuthCookies(ctx.authResponse, { ok: true, data });
  } catch (e) {
    return rbacApiJsonWithAuthCookies(
      ctx.authResponse,
      { ok: false, error: e instanceof Error ? e.message : "overview_failed" },
      { status: 500 },
    );
  }
}
