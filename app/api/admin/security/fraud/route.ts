import type { NextRequest } from "next/server";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import { rbacApiJson } from "@/lib/auth/api-errors";
import { summarizeFraudByIpEmail } from "@/lib/security/fraud-log";

export async function GET(request: NextRequest) {
  const admin = await requireAdminService(request);
  if (!admin.ok) return admin.response;

  const url = new URL(request.url);
  const limitRaw = url.searchParams.get("limit");
  const limit = limitRaw ? Math.min(200, Math.max(10, Number.parseInt(limitRaw, 10) || 50)) : 50;

  const summary = summarizeFraudByIpEmail(limit);
  return rbacApiJson({ ok: true, ...summary });
}
