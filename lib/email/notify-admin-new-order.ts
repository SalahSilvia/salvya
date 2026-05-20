import { loadStoreSettings } from "@/lib/admin/store-settings";
import { buildResendHeaders, buildResendTags } from "@/lib/email/deliverability";
import { renderOrderInvoiceBlock } from "@/lib/email/render-order-invoice-email";
import { formatResendFrom, getResendEnv, SALVYA_EMAIL_ALIASES } from "@/lib/email/resend-config";
import type { CustomerOrder } from "@/lib/orders/types";
import type { SupabaseClient } from "@supabase/supabase-js";

function siteOrigin(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.VERCEL_URL;
  if (!url) return "https://salvya.com";
  if (url.startsWith("http")) return url.replace(/\/$/, "");
  return `https://${url}`;
}

function resolveAdminInbox(settingsEmail: string): string {
  const fromEnv =
    process.env.SALVYA_ADMIN_ALERT_EMAIL?.trim() ||
    process.env.ADMIN_ALERT_EMAIL?.trim() ||
    process.env.ADMIN_EMAIL?.trim();
  if (fromEnv?.includes("@")) return fromEnv.toLowerCase();
  if (settingsEmail.includes("@")) return settingsEmail.toLowerCase();
  return SALVYA_EMAIL_ALIASES.support.address;
}

export async function notifyAdminNewOrder(
  service: SupabaseClient,
  order: CustomerOrder,
): Promise<void> {
  const settings = await loadStoreSettings(service);
  if (!settings.notifications.emailOnNewOrder) return;

  const to = resolveAdminInbox(settings.notifications.adminAlertEmail);
  const origin = siteOrigin();
  const adminOrdersUrl = `${origin}/admin/orders`;
  const accent = "#2D6BFF";
  const invoice = renderOrderInvoiceBlock(order, accent);
  const subject = `New order · ${order.orderNumber} · ${order.lineItem.displayTitle}`;
  const preview = `${order.shipping.buyerName} — ${order.lineItem.priceLabel}`;

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;">${preview}</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e8eaed;">
        <tr><td style="background:#050508;padding:24px 28px;">
          <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${accent};">Salvya Admin</p>
          <h1 style="margin:10px 0 0;font-size:22px;font-weight:600;color:#fff;">New order received</h1>
          <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.6);">Open the orders queue to confirm and fulfill.</p>
        </td></tr>
        <tr><td style="padding:24px 28px 8px;">
          ${invoice}
          <p style="margin:20px 0 0;"><a href="${adminOrdersUrl}" style="display:inline-block;background:${accent};color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:10px;">Open orders dashboard</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const text = `New Salvya order ${order.orderNumber}\n${order.shipping.buyerEmail}\n${adminOrdersUrl}`;

  const env = getResendEnv();
  if (!env) {
    console.info("[admin] new order alert (no Resend):", order.orderNumber, "→", to);
    return;
  }

  const from = formatResendFrom(env.fromName, SALVYA_EMAIL_ALIASES.orders.address);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: order.shipping.buyerEmail,
      subject,
      html,
      text,
      headers: buildResendHeaders({ templateId: "order_confirmation", supportEmail: env.supportEmail, siteOrigin: origin }),
      tags: buildResendTags("order_confirmation"),
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.warn("[admin] new order email failed", order.orderNumber, errText.slice(0, 200));
  }
}
