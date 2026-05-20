import type { SupabaseClient } from "@supabase/supabase-js";

export type CreatorAuditEntityType =
  | "order"
  | "payout"
  | "event"
  | "campaign"
  | "earning"
  | "wallet"
  | "reconciliation";

export type CreatorAuditLogRow = {
  id: string;
  actionType: string;
  entityType: CreatorAuditEntityType;
  entityId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};

function isMissingAudit(message: string): boolean {
  return message.includes("creator_audit_logs") || message.includes("does not exist");
}

/** Best-effort audit write — never throws to callers. */
export async function writeCreatorAuditLog(
  service: SupabaseClient,
  row: {
    creatorId: string;
    actionType: string;
    entityType: CreatorAuditEntityType;
    entityId?: string | null;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  try {
    const { error } = await service.from("creator_audit_logs").insert({
      creator_id: row.creatorId,
      action_type: row.actionType,
      entity_type: row.entityType,
      entity_id: row.entityId ?? null,
      metadata: row.metadata ?? {},
    });
    if (error && !isMissingAudit(error.message)) {
      console.warn("[creator_audit]", error.message);
    }
  } catch {
    /* degrade gracefully */
  }
}

export async function listCreatorAuditLogs(
  service: SupabaseClient,
  creatorId: string,
  opts: { entityType?: CreatorAuditEntityType; limit?: number; offset?: number } = {},
): Promise<{ logs: CreatorAuditLogRow[]; total: number }> {
  const limit = Math.min(opts.limit ?? 50, 100);
  const offset = opts.offset ?? 0;

  let query = service
    .from("creator_audit_logs")
    .select("id, action_type, entity_type, entity_id, metadata, created_at", { count: "exact" })
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (opts.entityType) query = query.eq("entity_type", opts.entityType);

  const { data, error, count } = await query;

  if (error) {
    if (error.code === "42P01" || isMissingAudit(error.message)) {
      return { logs: [], total: 0 };
    }
    throw new Error(error.message);
  }

  return {
    logs: (data ?? []).map((row) => ({
      id: row.id as string,
      actionType: row.action_type as string,
      entityType: row.entity_type as CreatorAuditEntityType,
      entityId: (row.entity_id as string | null) ?? null,
      metadata: (row.metadata as Record<string, unknown>) ?? {},
      createdAt: row.created_at as string,
    })),
    total: count ?? 0,
  };
}
