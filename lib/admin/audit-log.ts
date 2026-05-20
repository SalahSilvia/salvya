import type { SupabaseClient } from "@supabase/supabase-js";

export type AdminAuditAction =
  | "settings.update"
  | "influencer.approve"
  | "influencer.reject"
  | "influencer.suspend"
  | "influencer.reinstate"
  | "order.update"
  | "email.settings_update"
  | "email.test_send"
  | "security.session_check"
  | "god.role_change"
  | "profile.update";

export async function logAdminAudit(
  service: SupabaseClient,
  row: {
    actorId: string;
    action: AdminAuditAction | string;
    targetType?: string;
    targetId?: string;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  const { error } = await service.from("admin_audit_log").insert({
    actor_id: row.actorId,
    action: row.action,
    target_type: row.targetType ?? null,
    target_id: row.targetId ?? null,
    metadata: row.metadata ?? {},
  });
  if (error && error.code !== "42P01" && !error.message.includes("does not exist")) {
    console.warn("[admin-audit]", error.message);
  }
}
