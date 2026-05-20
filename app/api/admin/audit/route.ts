import type { NextRequest } from "next/server";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import { rbacApiJson } from "@/lib/auth/api-errors";

export async function GET(request: NextRequest) {
  const ctx = await requireAdminService(request);
  if (!ctx.ok) return ctx.response;

  const limit = Math.min(50, Math.max(5, parseInt(new URL(request.url).searchParams.get("limit") ?? "20", 10) || 20));

  const { data, error } = await ctx.service
    .from("admin_audit_log")
    .select("id, actor_id, action, target_type, target_id, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (error.code === "42P01" || error.message.includes("does not exist")) {
      return rbacApiJson({ ok: true, log: [] });
    }
    return rbacApiJson({ ok: false, error: error.message }, { status: 500 });
  }

  const log = (data ?? []).map((r) => ({
    id: r.id,
    actorId: r.actor_id,
    action: r.action,
    targetType: r.target_type,
    targetId: r.target_id,
    metadata: r.metadata as Record<string, unknown> | null,
    createdAt: r.created_at,
  }));

  return rbacApiJson({ ok: true, log });
}
