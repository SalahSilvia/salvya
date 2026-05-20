import type { NextRequest } from "next/server";
import { loadAdminPreferences } from "@/lib/admin/admin-preferences";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import { rbacApiJson } from "@/lib/auth/api-errors";

export async function GET(request: NextRequest) {
  const ctx = await requireAdminService(request);
  if (!ctx.ok) return ctx.response;

  const prefs = await loadAdminPreferences(ctx.service, ctx.user.id);
  const since = prefs.ordersLastSeenAt;

  let query = ctx.service.from("customer_orders").select("*", { count: "exact", head: true });
  if (since) {
    query = query.gt("created_at", since);
  } else {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    query = query.gte("created_at", weekAgo);
  }

  const { count, error } = await query;
  if (error) {
    if (error.code === "42P01" || error.message.includes("does not exist")) {
      return rbacApiJson({ ok: true, unread: 0 });
    }
    return rbacApiJson({ ok: false, error: error.message }, { status: 500 });
  }

  return rbacApiJson({ ok: true, unread: Math.min(count ?? 0, 99) });
}
