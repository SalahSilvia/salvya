import type { SupabaseClient } from "@supabase/supabase-js";
import { sendCustomerEmail, sendOrderEmail } from "@/lib/email/send";
import type { EmailTemplateId } from "@/lib/email/types";
import type { CustomerOrder, OrderFulfillmentStatus, OrderPaymentStatus } from "@/lib/orders/types";

/** Maps fulfillment status → primary transactional template (null = no auto email). */
export const FULFILLMENT_EMAIL_TEMPLATE: Partial<Record<OrderFulfillmentStatus, EmailTemplateId>> = {
  preparing: "order_preparing",
  shipped: "order_shipped",
  delivered: "order_delivered",
  cancelled: "order_cancelled",
};

/** Extra templates fired after a status change (e.g. review after delivered). */
export const FULFILLMENT_FOLLOW_UP: Partial<Record<OrderFulfillmentStatus, EmailTemplateId[]>> = {
  delivered: ["order_review_request"],
};

export const PAYMENT_EMAIL_TEMPLATE: Partial<Record<OrderPaymentStatus, EmailTemplateId>> = {
  failed: "order_payment_failed",
};

export type UserLifecyclePayload = {
  email: string;
  customerName?: string;
  cartUrl?: string;
  productTitle?: string;
  discountCode?: string;
  artistName?: string;
  collectionName?: string;
};

export type EmailAutomationEvent =
  | "order.placed"
  | "order.fulfillment_changed"
  | "order.payment_changed"
  | "user.registered"
  | "user.profile_incomplete"
  | "cart.abandoned"
  | "cart.abandoned.reminder"
  | "product.restock"
  | "user.newsletter_opt_in";

const USER_EVENT_TEMPLATE: Partial<Record<EmailAutomationEvent, EmailTemplateId>> = {
  "user.registered": "welcome_account",
  "user.profile_incomplete": "profile_complete_nudge",
  "cart.abandoned": "cart_abandoned",
  "cart.abandoned.reminder": "cart_reminder_final",
  "product.restock": "restock_interest",
  "user.newsletter_opt_in": "newsletter_welcome",
};

function siteOrigin(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.VERCEL_URL;
  if (!url) return "https://salvyastore.com";
  if (url.startsWith("http")) return url.replace(/\/$/, "");
  return `https://${url}`;
}

function firstName(full?: string): string {
  const n = full?.trim().split(/\s+/)[0];
  return n || "there";
}

export function buildUserMergeContext(payload: UserLifecyclePayload): Record<string, string> {
  const origin = siteOrigin();
  return {
    customer_name: firstName(payload.customerName),
    customer_email: payload.email.trim().toLowerCase(),
    product_title: payload.productTitle ?? "your item",
    cart_url: payload.cartUrl ?? `${origin}/shop`,
    discount_code: payload.discountCode ?? "SALVYA10",
    artist_name: payload.artistName ?? "Salvya Artists",
    collection_name: payload.collectionName ?? "New Collection",
    track_order_url: `${origin}/track-order`,
    tracking_number: "",
    tracking_url: "",
    order_number: "",
    order_total: "",
    unsubscribe_url: `${origin}/contact`,
  };
}

/** Fire order emails when admin or system changes fulfillment / payment. */
export async function runOrderStatusAutomations(
  service: SupabaseClient,
  order: CustomerOrder,
  opts: {
    prevFulfillment: OrderFulfillmentStatus;
    nextFulfillment: OrderFulfillmentStatus;
    prevPayment: OrderPaymentStatus;
    nextPayment: OrderPaymentStatus;
    trackingNumber?: string;
    trackingUrl?: string;
  },
): Promise<void> {
  const tracking = {
    trackingNumber: opts.trackingNumber ?? order.shipping.trackingNumber,
    trackingUrl: opts.trackingUrl ?? order.shipping.trackingUrl,
  };

  if (opts.nextFulfillment !== opts.prevFulfillment) {
    const primary = FULFILLMENT_EMAIL_TEMPLATE[opts.nextFulfillment];
    if (primary) {
      try {
        await sendOrderEmail(service, primary, order, tracking);
      } catch {
        /* non-fatal */
      }
    }
    const followUps = FULFILLMENT_FOLLOW_UP[opts.nextFulfillment] ?? [];
    for (const templateId of followUps) {
      try {
        await sendOrderEmail(service, templateId, order, tracking);
      } catch {
        /* non-fatal */
      }
    }
  }

  if (opts.nextPayment !== opts.prevPayment) {
    const paymentTpl = PAYMENT_EMAIL_TEMPLATE[opts.nextPayment];
    if (paymentTpl) {
      try {
        await sendOrderEmail(service, paymentTpl, order, tracking);
      } catch {
        /* non-fatal */
      }
    }
  }
}

export async function runUserLifecycleAutomation(
  service: SupabaseClient,
  event: EmailAutomationEvent,
  payload: UserLifecyclePayload,
): Promise<void> {
  const templateId = USER_EVENT_TEMPLATE[event];
  if (!templateId) return;
  const ctx = buildUserMergeContext(payload);
  try {
    await sendCustomerEmail(service, templateId, payload.email, ctx);
  } catch {
    /* non-fatal */
  }
}

/** Marketing / manual campaign send to one or more addresses. */
export async function sendMarketingBroadcast(
  service: SupabaseClient,
  templateId: EmailTemplateId,
  recipients: string[],
  ctx: Record<string, string>,
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;
  const origin = siteOrigin();
  const base = {
    ...ctx,
    unsubscribe_url: ctx.unsubscribe_url ?? `${origin}/contact`,
    discount_code: ctx.discount_code ?? "SALVYA10",
    collection_name: ctx.collection_name ?? "New Collection",
    artist_name: ctx.artist_name ?? "Salvya",
  };
  for (const raw of recipients) {
    const email = raw.trim().toLowerCase();
    if (!email.includes("@")) continue;
    const result = await sendCustomerEmail(service, templateId, email, {
      ...base,
      customer_email: email,
      customer_name: firstName(ctx.customer_name),
    });
    if (result.ok) sent += 1;
    else failed += 1;
  }
  return { sent, failed };
}
