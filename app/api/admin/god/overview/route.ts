import type { NextRequest } from "next/server";
import { buildGodAdminSnapshot } from "@/lib/admin/god-overview";
import { requireGodAdminService } from "@/lib/admin/require-god-admin-service";
import { rbacApiJsonWithAuthCookies } from "@/lib/auth/api-errors";

export async function GET(request: NextRequest) {
  const ctx = await requireGodAdminService(request);
  if (!ctx.ok) return ctx.response;

  try {
    const snapshot = await buildGodAdminSnapshot(ctx.service);
    return rbacApiJsonWithAuthCookies(ctx.authResponse, { ok: true, snapshot });
  } catch (e) {
    return rbacApiJsonWithAuthCookies(
      ctx.authResponse,
      { ok: false, error: e instanceof Error ? e.message : "god_overview_failed" },
      { status: 500 },
    );
  }
}
