import type { SupabaseClient } from "@supabase/supabase-js";
import { logPaymentAudit } from "@/lib/orders/payment-audit";
import { pushOrderNotification } from "@/lib/notifications/push-order-event";
import type { CartLine } from "@/lib/cart/types";

export const PAYMENT_ABANDON_AFTER_MINUTES = 45;

export async function upsertAbandonedCheckout(
  service: SupabaseClient,
  row: {
    userId?: string | null;
    buyerEmail?: string | null;
    placementKey: string;
    checkoutPath: string;
    cartLines: CartLine[];
    paypalOrderId?: string | null;
  },
): Promise<void> {
  await service.from("abandoned_checkouts").upsert(
    {
      user_id: row.userId ?? null,
      buyer_email: row.buyerEmail?.trim().toLowerCase() ?? null,
      placement_key: row.placementKey,
      checkout_path: row.checkoutPath,
      cart_lines: row.cartLines,
      paypal_order_id: row.paypalOrderId ?? null,
      abandoned_at: new Date().toISOString(),
    },
    { onConflict: "placement_key" },
  );
}

export async function processStaleAbandonedCheckouts(service: SupabaseClient): Promise<{
  marked: number;
  emailsSent: number;
}> {
  const cutoff = new Date(Date.now() - PAYMENT_ABANDON_AFTER_MINUTES * 60 * 1000).toISOString();
  const { data: rows } = await service
    .from("abandoned_checkouts")
    .select("id, user_id, buyer_email, placement_key, checkout_path, cart_lines, recovery_email_sent_at")
    .is("recovered_at", null)
    .lt("abandoned_at", cutoff)
    .is("recovery_email_sent_at", null)
    .limit(40);

  let emailsSent = 0;
  for (const row of rows ?? []) {
    if (row.user_id) {
      await pushOrderNotification(service, {
        userId: row.user_id,
        event: "payment_abandoned",
        orderId: row.id,
        orderNumber: row.placement_key?.slice(0, 12) ?? "checkout",
        sendEmail: true,
        buyerEmail: row.buyer_email ?? undefined,
      }).catch(() => undefined);
    }
    await service
      .from("abandoned_checkouts")
      .update({ recovery_email_sent_at: new Date().toISOString() })
      .eq("id", row.id);
    emailsSent += 1;
    await logPaymentAudit(service, {
      eventType: "payment_abandoned",
      metadata: { placementKey: row.placement_key, checkoutPath: row.checkout_path },
    });
  }

  const { data: stalePending } = await service
    .from("customer_orders")
    .select("id, payment_status, user_id, order_number, shipping")
    .eq("payment_status", "pending")
    .lt("created_at", cutoff)
    .is("payment_abandoned_at", null)
    .limit(20);

  let marked = 0;
  for (const o of stalePending ?? []) {
    const now = new Date().toISOString();
    await service
      .from("customer_orders")
      .update({ payment_status: "payment_abandoned", payment_abandoned_at: now, updated_at: now })
      .eq("id", o.id);
    marked += 1;
    await logPaymentAudit(service, {
      orderId: o.id,
      eventType: "payment_abandoned",
      statusBefore: "pending",
      statusAfter: "payment_abandoned",
    });
    const shipping = o.shipping as { buyerEmail?: string } | null;
    if (o.user_id) {
      await pushOrderNotification(service, {
        userId: o.user_id,
        event: "payment_abandoned",
        orderId: o.id,
        orderNumber: o.order_number,
        sendEmail: true,
        buyerEmail: shipping?.buyerEmail,
      }).catch(() => undefined);
    }
  }

  return { marked, emailsSent };
}

export async function fetchRecoverableCart(
  service: SupabaseClient,
  userId: string,
): Promise<CartLine[] | null> {
  const { data } = await service
    .from("abandoned_checkouts")
    .select("cart_lines")
    .eq("user_id", userId)
    .is("recovered_at", null)
    .order("abandoned_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data?.cart_lines || !Array.isArray(data.cart_lines)) return null;
  return data.cart_lines as CartLine[];
}

export async function markCheckoutRecovered(
  service: SupabaseClient,
  userId: string,
  placementKey?: string,
): Promise<void> {
  let q = service
    .from("abandoned_checkouts")
    .update({ recovered_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("recovered_at", null);
  if (placementKey) q = q.eq("placement_key", placementKey);
  await q;
}
