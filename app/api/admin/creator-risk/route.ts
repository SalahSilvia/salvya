import type { NextRequest } from "next/server";
import { getCreatorRiskInsights } from "@/lib/creator/admin-risk-service";
import { rbacApiJson } from "@/lib/auth/api-errors";
import { requireAdminService } from "@/lib/admin/require-admin-service";

export async function GET(request: NextRequest) {
  const admin = await requireAdminService(request);
  if (!admin.ok) return admin.response;

  try {
    const insights = await getCreatorRiskInsights(admin.service);
    return rbacApiJson({ ok: true, insights });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load creator risk data";
    return rbacApiJson({ ok: false, error: message }, { status: 500 });
  }
}
