import type { SupabaseClient } from "@supabase/supabase-js";
import type { FraudEventType } from "@/lib/security/fraud-log";
import { logFraudEvent } from "@/lib/security/fraud-log";

const SCORE_BY_TYPE: Partial<Record<FraudEventType, number>> = {
  checkout_rapid_fire: 15,
  rate_limited: 10,
  paypal_verify_failed: 12,
  paypal_duplicate_blocked: 20,
  duplicate_order_attempt: 18,
  price_cents_mismatch: 25,
  price_label_mismatch: 20,
  placement_key_reuse: 8,
  invalid_discount: 5,
  variant_id_mismatch: 22,
};

export async function persistFraudEvent(
  service: SupabaseClient | null,
  type: FraudEventType,
  meta?: Record<string, unknown>,
  opts?: { userId?: string | null; orderId?: string | null; ip?: string; email?: string },
): Promise<void> {
  logFraudEvent(type, meta, { ip: opts?.ip, email: opts?.email });

  if (!service) return;

  const delta = SCORE_BY_TYPE[type] ?? 3;

  const { error } = await service.from("fraud_events").insert({
    event_type: type,
    user_id: opts?.userId ?? null,
    order_id: opts?.orderId ?? null,
    email: opts?.email ?? null,
    ip: opts?.ip ?? null,
    fraud_score_delta: delta,
    metadata: meta ?? {},
  });

  if (error && error.code !== "42P01") {
    console.warn("[fraud-persist] insert failed", error.message);
  }

  if (opts?.orderId && delta > 0) {
    const { data: order } = await service
      .from("customer_orders")
      .select("fraud_score")
      .eq("id", opts.orderId)
      .maybeSingle();
    const current = typeof order?.fraud_score === "number" ? order.fraud_score : 0;
    await service
      .from("customer_orders")
      .update({ fraud_score: Math.min(100, current + delta) })
      .eq("id", opts.orderId);
  }
}

export function computeCheckoutFraudFlags(opts: {
  checkoutAttemptsLastHour: number;
  countryMismatch: boolean;
  failedPaymentCount: number;
}): { score: number; flags: string[] } {
  let score = 0;
  const flags: string[] = [];
  if (opts.checkoutAttemptsLastHour >= 5) {
    score += 20;
    flags.push("rapid_checkout");
  }
  if (opts.countryMismatch) {
    score += 15;
    flags.push("country_currency_mismatch");
  }
  if (opts.failedPaymentCount >= 3) {
    score += 25;
    flags.push("repeated_payment_failures");
  }
  return { score, flags };
}
