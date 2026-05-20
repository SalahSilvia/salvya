import type { CustomerOrder } from "@/lib/orders/types";
import { appendNotification } from "@/lib/notifications/append";
import { sanitizeNotificationPrefs, sanitizeNotifications } from "@/lib/notifications/validate";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function appendOrderNotification(
  supabase: SupabaseClient,
  userId: string,
  order: CustomerOrder,
): Promise<void> {
  const { data } = await supabase.from("customer_notifications").select("items, prefs").eq("user_id", userId).maybeSingle();

  const existing = sanitizeNotifications(data?.items);
  const prefs = sanitizeNotificationPrefs(data?.prefs);
  const now = new Date().toISOString();
  const notifId = `order-${order.id}`;

  const items = appendNotification(
    existing,
    {
      id: notifId,
      kind: "order",
      title: `Order ${order.orderNumber} confirmed`,
      body: `${order.lineItem.displayTitle} — we will email ${order.shipping.buyerEmail} when it ships.`,
      href: "/track-order",
      createdAt: now,
      read: false,
    },
    prefs,
  );

  if (items === existing) return;

  await supabase.from("customer_notifications").upsert(
    {
      user_id: userId,
      items,
      prefs,
      updated_at: now,
    },
    { onConflict: "user_id" },
  );
}
