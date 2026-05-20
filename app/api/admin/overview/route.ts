import type { NextRequest } from "next/server";
import { buildAdminOverviewSnapshot } from "@/lib/admin/overview-snapshot";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import { rbacApiJsonWithAuthCookies } from "@/lib/auth/api-errors";

export async function GET(request: NextRequest) {
  const ctx = await requireAdminService(request);
  if (!ctx.ok) return ctx.response;

  try {
    const overview = await buildAdminOverviewSnapshot(ctx.service, {
      id: ctx.user.id,
      email: ctx.user.email,
    });
    return rbacApiJsonWithAuthCookies(ctx.authResponse, { ok: true, overview });
  } catch (e) {
    return rbacApiJsonWithAuthCookies(
      ctx.authResponse,
      { ok: false, error: e instanceof Error ? e.message : "overview_failed" },
      { status: 500 },
    );
  }
}
