import type { SupabaseClient } from "@supabase/supabase-js";
import type { CustomerOrder } from "@/lib/orders/types";
import { rowToCustomerOrder } from "@/lib/orders/validate";

const ORDER_SELECT =
  "id, order_number, placement_key, user_id, shipping_address_id, line_item, shipping, payment, fulfillment_status, payment_status, created_at, updated_at";

export type PayPalIdempotencyResult =
  | { action: "proceed" }
  | { action: "return_existing"; order: CustomerOrder }
  | { action: "reject_duplicate"; message: string };

/**
 * Prevent replay / double-spend for the same PayPal order id.
 */
export async function checkPayPalOrderIdempotency(
  service: SupabaseClient,
  paypalOrderId: string,
  placementKey: string,
  paypalCaptureId?: string,
): Promise<PayPalIdempotencyResult> {
  const orderId = paypalOrderId.trim();
  if (!orderId) {
    return { action: "reject_duplicate", message: "PayPal order id is required." };
  }

  const { data: byPaypal, error } = await service
    .from("customer_orders")
    .select(ORDER_SELECT)
    .eq("paypal_order_id", orderId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (byPaypal) {
    const order = rowToCustomerOrder(byPaypal);
    if (!order) {
      return { action: "reject_duplicate", message: "This PayPal payment was already used." };
    }
    if (byPaypal.placement_key === placementKey) {
      return { action: "return_existing", order };
    }
    console.warn("[paypal] duplicate paypal_order_id for different placement", {
      paypalOrderId: orderId,
      existingPlacement: byPaypal.placement_key,
      attemptedPlacement: placementKey,
    });
    return { action: "reject_duplicate", message: "This PayPal payment was already applied to another order." };
  }

  const captureId = paypalCaptureId?.trim();
  if (captureId) {
    const { data: byCapture, error: capErr } = await service
      .from("customer_orders")
      .select(ORDER_SELECT)
      .eq("paypal_capture_id", captureId)
      .maybeSingle();

    if (capErr) throw new Error(capErr.message);

    if (byCapture) {
      const order = rowToCustomerOrder(byCapture);
      if (order && byCapture.placement_key === placementKey) {
        return { action: "return_existing", order };
      }
      console.warn("[paypal] duplicate capture id attempt", { captureId, placementKey });
      return { action: "reject_duplicate", message: "This PayPal capture was already processed." };
    }
  }

  return { action: "proceed" };
}
