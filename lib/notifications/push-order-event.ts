import type { SupabaseClient } from "@supabase/supabase-js";
import { appendNotification } from "@/lib/notifications/append";
import { defaultNotificationPrefs } from "@/lib/notifications/defaults";
import { sendCustomerEmail } from "@/lib/email/send";
import type { SalvyaNotificationEvent } from "@/lib/orders/production-types";
import { sanitizeNotificationPrefs, sanitizeNotifications } from "@/lib/notifications/validate";

const EVENT_COPY: Record<
  SalvyaNotificationEvent,
  { title: string; body: (orderNumber: string) => string }
> = {
  refund_requested: {
    title: "Refund requested",
    body: (n) => `We received your refund request for order ${n}.`,
  },
  refund_approved: {
    title: "Refund approved",
    body: (n) => `Your refund for order ${n} was approved and is being processed.`,
  },
  refund_rejected: {
    title: "Refund not approved",
    body: (n) => `Your refund request for order ${n} could not be approved.`,
  },
  refund_completed: {
    title: "Refund completed",
    body: (n) => `Your refund for order ${n} has been completed.`,
  },
  refund_processed: {
    title: "Refund processed",
    body: (n) => `Your refund for order ${n} is fully processed and closed.`,
  },
  payment_failed: {
    title: "Payment failed",
    body: (n) => `Payment for order ${n} could not be completed.`,
  },
  payment_abandoned: {
    title: "Checkout not completed",
    body: () => "You left items in your bag — complete checkout when you are ready.",
  },
};

export async function pushOrderNotification(
  service: SupabaseClient,
  opts: {
    userId: string;
    event: SalvyaNotificationEvent;
    orderId: string;
    orderNumber: string;
    extraBody?: string;
    sendEmail?: boolean;
    buyerEmail?: string;
  },
): Promise<void> {
  const copy = EVENT_COPY[opts.event];
  const body = opts.extraBody?.trim()
    ? `${copy.body(opts.orderNumber)} ${opts.extraBody.trim()}`
    : copy.body(opts.orderNumber);

  const { data: existing } = await service
    .from("customer_notifications")
    .select("items, prefs")
    .eq("user_id", opts.userId)
    .maybeSingle();

  const prefs = sanitizeNotificationPrefs(existing?.prefs ?? defaultNotificationPrefs());
  const items = sanitizeNotifications(existing?.items ?? []);
  const href =
    opts.event === "payment_abandoned"
      ? "/shop"
      : opts.event.startsWith("refund") || opts.event === "payment_failed"
        ? `/account/refunds/${opts.orderId}`
        : "/account/profile";

  const nextItems = appendNotification(items, {
    id: `${opts.event}-${opts.orderId}`,
    kind: "order",
    title: copy.title,
    body,
    href,
  }, prefs);

  await service.from("customer_notifications").upsert({
    user_id: opts.userId,
    items: nextItems,
    prefs,
    updated_at: new Date().toISOString(),
  });

  if (opts.sendEmail && opts.buyerEmail) {
    await sendCustomerEmail(service, "order_confirmation", opts.buyerEmail, {
      customer_name: "there",
      order_number: opts.orderNumber,
      product_title: copy.title,
      order_total: body,
    }).catch(() => undefined);
  }
}
