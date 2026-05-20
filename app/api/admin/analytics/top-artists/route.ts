import type { NextRequest } from "next/server";
import { computeTopArtists } from "@/lib/admin/analytics-snapshot";
import { parseAnalyticsDays, parseAnalyticsLimit } from "@/lib/admin/analytics-api-params";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import { rbacApiJsonWithAuthCookies } from "@/lib/auth/api-errors";

export async function GET(request: NextRequest) {
  const ctx = await requireAdminService(request);
  if (!ctx.ok) return ctx.response;

  const days = parseAnalyticsDays(request.nextUrl.searchParams.get("days"));
  const limit = parseAnalyticsLimit(request.nextUrl.searchParams.get("limit"));

  try {
    const items = await computeTopArtists(ctx.service, days, limit);
    return rbacApiJsonWithAuthCookies(ctx.authResponse, { ok: true, items });
  } catch (e) {
    return rbacApiJsonWithAuthCookies(
      ctx.authResponse,
      { ok: false, error: e instanceof Error ? e.message : "top_artists_failed" },
      { status: 500 },
    );
  }
}
