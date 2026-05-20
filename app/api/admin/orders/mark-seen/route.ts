import type { NextRequest } from "next/server";
import { saveAdminPreferences } from "@/lib/admin/admin-preferences";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import { rbacApiJson } from "@/lib/auth/api-errors";

export async function POST(request: NextRequest) {
  const ctx = await requireAdminService(request);
  if (!ctx.ok) return ctx.response;

  const now = new Date().toISOString();
  await saveAdminPreferences(ctx.service, ctx.user.id, { ordersLastSeenAt: now });

  return rbacApiJson({ ok: true, ordersLastSeenAt: now });
}
