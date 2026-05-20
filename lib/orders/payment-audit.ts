import type { SupabaseClient } from "@supabase/supabase-js";
import type { PaymentAuditEventType } from "@/lib/orders/production-types";

export async function logPaymentAudit(
  service: SupabaseClient,
  row: {
    orderId?: string | null;
    eventType: PaymentAuditEventType;
    statusBefore?: string | null;
    statusAfter?: string | null;
    metadata?: Record<string, unknown>;
    actorUserId?: string | null;
  },
): Promise<void> {
  const { error } = await service.from("payment_audit_logs").insert({
    order_id: row.orderId ?? null,
    event_type: row.eventType,
    status_before: row.statusBefore ?? null,
    status_after: row.statusAfter ?? null,
    metadata: row.metadata ?? {},
    actor_user_id: row.actorUserId ?? null,
  });
  if (error && error.code !== "42P01") {
    console.warn("[payment-audit] insert failed", error.message);
  }
}
