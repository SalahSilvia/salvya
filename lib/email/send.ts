import { loadCustomerEmails } from "@/lib/email/customer-emails-settings";
import { mergeContextFromOrder } from "@/lib/email/merge";
import { renderOrderConfirmationWithInvoice } from "@/lib/email/render-order-invoice-email";
import { renderCustomerEmailHtml } from "@/lib/email/render-html";
import { buildResendHeaders, buildResendTags } from "@/lib/email/deliverability";
import {
  formatResendFrom,
  getResendEnv,
  resolveFromEmailForTemplate,
  resolveReplyTo,
  resolveSupportEmail,
} from "@/lib/email/resend-config";
import type { EmailTemplateId } from "@/lib/email/types";
import type { CustomerOrder } from "@/lib/orders/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export type SendEmailResult =
  | { ok: true; status: "sent" | "queued" | "skipped"; detail?: string }
  | { ok: false; error: string };

function siteOrigin(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.VERCEL_URL;
  if (!url) return "https://salvya.com";
  if (url.startsWith("http")) return url.replace(/\/$/, "");
  return `https://${url}`;
}

async function logSend(
  service: SupabaseClient,
  row: {
    templateId: EmailTemplateId;
    toEmail: string;
    subject: string;
    status: "sent" | "queued" | "failed" | "skipped";
    error?: string;
    meta?: Record<string, unknown>;
  },
): Promise<void> {
  const { error } = await service.from("email_send_log").insert({
    template_id: row.templateId,
    to_email: row.toEmail,
    subject: row.subject,
    status: row.status,
    error: row.error ?? null,
    meta: row.meta ?? null,
  });
  if (error && error.code !== "42P01" && !error.message.includes("does not exist")) {
    console.warn("[email] log insert failed", error.message);
  }
}

async function deliverViaResend(opts: {
  templateId: EmailTemplateId;
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  html: string;
  text: string;
}): Promise<SendEmailResult> {
  const env = getResendEnv();
  if (!env) {
    return { ok: true, status: "queued", detail: "RESEND_API_KEY not set — logged only" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: opts.from,
      to: [opts.to],
      reply_to: opts.replyTo,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      headers: buildResendHeaders({
        templateId: opts.templateId,
        supportEmail: opts.replyTo,
        siteOrigin: siteOrigin(),
      }),
      tags: buildResendTags(opts.templateId),
    }),
  });

  if (!res.ok) {
    let message = `Resend HTTP ${res.status}`;
    try {
      const parsed = (await res.json()) as { message?: string };
      if (parsed.message) message = parsed.message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }
    return { ok: false, error: message };
  }
  return { ok: true, status: "sent" };
}

/** Send a transactional email to a customer (best-effort, non-blocking for checkout). */
export async function sendCustomerEmail(
  service: SupabaseClient,
  templateId: EmailTemplateId,
  toEmail: string,
  ctx: Record<string, string>,
): Promise<SendEmailResult> {
  const bundle = await loadCustomerEmails(service);
  if (!bundle.global.emailsEnabled) {
    await logSend(service, {
      templateId,
      toEmail,
      subject: "(disabled)",
      status: "skipped",
      meta: { reason: "global_disabled" },
    });
    return { ok: true, status: "skipped", detail: "Emails globally disabled" };
  }

  const template = bundle.templates[templateId];
  if (!template.enabled) {
    await logSend(service, {
      templateId,
      toEmail,
      subject: template.subject,
      status: "skipped",
      meta: { reason: "template_disabled" },
    });
    return { ok: true, status: "skipped", detail: "Template disabled" };
  }

  const env = getResendEnv();
  const fromName = env?.fromName || bundle.global.fromName || "Salvya Team";
  const fromEmail = resolveFromEmailForTemplate(templateId, bundle.global.fromEmail);
  const supportEmail = resolveSupportEmail(bundle.global.supportEmail);

  const fullCtx = {
    ...ctx,
    store_name: fromName,
    support_email: supportEmail,
  };

  const { subject, html, text } = renderCustomerEmailHtml(template, bundle, fullCtx);
  const from = formatResendFrom(fromName, fromEmail);
  const replyTo = resolveReplyTo(bundle.global.replyTo);

  const result = await deliverViaResend({
    templateId,
    from,
    to: toEmail,
    replyTo,
    subject,
    html,
    text,
  });

  await logSend(service, {
    templateId,
    toEmail,
    subject,
    status: result.ok ? result.status : "failed",
    error: result.ok ? undefined : result.error,
    meta: { from, replyTo },
  });

  return result;
}

export async function sendOrderEmail(
  service: SupabaseClient,
  templateId: EmailTemplateId,
  order: CustomerOrder,
  extra?: { trackingNumber?: string; trackingUrl?: string },
): Promise<SendEmailResult> {
  const bundle = await loadCustomerEmails(service);
  if (!bundle.global.emailsEnabled) {
    return { ok: true, status: "skipped", detail: "Emails globally disabled" };
  }

  const template = bundle.templates[templateId];
  if (!template.enabled) {
    return { ok: true, status: "skipped", detail: "Template disabled" };
  }

  const ctx = mergeContextFromOrder(
    {
      orderNumber: order.orderNumber,
      shipping: order.shipping,
      lineItem: order.lineItem,
      orderCurrency: order.orderCurrency,
      finalPrice: order.finalPrice,
      shippingMeta: extra,
    },
    bundle,
    siteOrigin(),
  );

  const env = getResendEnv();
  const fromName = env?.fromName || bundle.global.fromName || "Salvya Team";
  const fromEmail = resolveFromEmailForTemplate(templateId, bundle.global.fromEmail);
  const supportEmail = resolveSupportEmail(bundle.global.supportEmail);
  const fullCtx = { ...ctx, store_name: fromName, support_email: supportEmail };

  const rendered =
    templateId === "order_confirmation"
      ? renderOrderConfirmationWithInvoice(template, bundle, fullCtx, order)
      : renderCustomerEmailHtml(template, bundle, fullCtx);

  const from = formatResendFrom(fromName, fromEmail);
  const replyTo = resolveReplyTo(bundle.global.replyTo);
  const toEmail = order.shipping.buyerEmail;

  const result = await deliverViaResend({
    templateId,
    from,
    to: toEmail,
    replyTo,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
  });

  await logSend(service, {
    templateId,
    toEmail,
    subject: rendered.subject,
    status: result.ok ? result.status : "failed",
    error: result.ok ? undefined : result.error,
    meta: { from, replyTo, invoice: templateId === "order_confirmation" },
  });

  return result;
}
