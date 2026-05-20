import type { NextRequest } from "next/server";
import { listCreatorAuditLogs, type CreatorAuditEntityType } from "@/lib/creator/audit-log-service";
import { requireCreator } from "@/lib/creator/require-creator";
import { rbacApiJson, rbacApiNotConfigured } from "@/lib/auth/api-errors";
import { createServiceSupabase } from "@/lib/supabase/service";

const ENTITY_TYPES = new Set<CreatorAuditEntityType>([
  "order",
  "payout",
  "event",
  "campaign",
  "earning",
  "wallet",
  "reconciliation",
]);

export async function GET(request: NextRequest) {
  const auth = await requireCreator(request);
  if (!auth.ok) return auth.response;

  const service = createServiceSupabase();
  if (!service) return rbacApiNotConfigured();

  const entityTypeParam = request.nextUrl.searchParams.get("entityType");
  const entityType =
    entityTypeParam && ENTITY_TYPES.has(entityTypeParam as CreatorAuditEntityType)
      ? (entityTypeParam as CreatorAuditEntityType)
      : undefined;
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? "50");
  const offset = Number(request.nextUrl.searchParams.get("offset") ?? "0");

  try {
    const result = await listCreatorAuditLogs(service, auth.user.id, {
      entityType,
      limit: Number.isFinite(limit) ? limit : 50,
      offset: Number.isFinite(offset) ? offset : 0,
    });
    return rbacApiJson({ ok: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load audit logs";
    return rbacApiJson({ ok: false, error: message }, { status: 500 });
  }
}
