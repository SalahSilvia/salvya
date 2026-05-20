import { checkoutCountryLabel } from "@/lib/checkout-country";
import { postalAddressLine } from "@/lib/email/deliverability";
import type { EmailMergeContext } from "@/lib/email/merge";
import { renderCustomerEmailHtml } from "@/lib/email/render-html";
import type { CustomerEmailTemplate, CustomerEmailsBundle } from "@/lib/email/types";
import type { CustomerOrder, OrderLineItem } from "@/lib/orders/types";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function orderLines(order: CustomerOrder): OrderLineItem[] {
  const bag = order.lineItem.bagLines;
  if (bag?.length) return bag;
  return [order.lineItem];
}

function paymentLabel(order: CustomerOrder): string {
  if (order.payment.method === "cod") return "Cash on delivery";
  return order.payment.instrument === "paypal_card" ? "PayPal · Card" : "PayPal";
}

function formatPlacedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function renderOrderInvoiceBlock(order: CustomerOrder, accent: string): string {
  const lines = orderLines(order);
  const ship = order.shipping;
  const rows = lines
    .map(
      (line) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #eef0f2;font-size:14px;color:#202223;">
          <strong style="display:block;font-weight:600;">${escapeHtml(line.displayTitle)}</strong>
          <span style="font-size:12px;color:#6d7175;">${escapeHtml(line.colorLabel)} · ${escapeHtml(line.size)} · ${escapeHtml(line.kindLabel)}</span>
        </td>
        <td style="padding:12px 8px;border-bottom:1px solid #eef0f2;text-align:center;font-size:13px;color:#6d7175;">${line.qty}</td>
        <td style="padding:12px 0;border-bottom:1px solid #eef0f2;text-align:right;font-size:14px;font-weight:600;color:#202223;white-space:nowrap;">${escapeHtml(line.priceLabel)}</td>
      </tr>`,
    )
    .join("");

  const total =
    typeof order.finalPrice === "number" && Number.isFinite(order.finalPrice)
      ? `${order.finalPrice} ${order.orderCurrency ?? "EUR"}`
      : order.lineItem.priceLabel;

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 20px;border:1px solid #e8eaed;border-radius:12px;overflow:hidden;background:#fafbfb;">
      <tr>
        <td style="padding:16px 20px;background:#050508;">
          <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${accent};">Invoice</p>
          <p style="margin:6px 0 0;font-size:20px;font-weight:600;color:#ffffff;">${escapeHtml(order.orderNumber)}</p>
          <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.55);">Placed ${escapeHtml(formatPlacedAt(order.createdAt))}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 20px 8px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <thead>
              <tr>
                <th align="left" style="padding:0 0 8px;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#8c9196;">Item</th>
                <th align="center" style="padding:0 8px 8px;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#8c9196;">Qty</th>
                <th align="right" style="padding:0 0 8px;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#8c9196;">Amount</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
            <tr>
              <td style="padding:12px 0 4px;font-size:13px;color:#6d7175;">Payment</td>
              <td style="padding:12px 0 4px;text-align:right;font-size:13px;font-weight:600;color:#202223;">${escapeHtml(paymentLabel(order))}</td>
            </tr>
            <tr>
              <td style="padding:4px 0 12px;font-size:15px;font-weight:700;color:#202223;">Total</td>
              <td style="padding:4px 0 12px;text-align:right;font-size:15px;font-weight:700;color:#202223;">${escapeHtml(total)}</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:0 20px 18px;">
          <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#8c9196;">Ship to</p>
          <p style="margin:0;font-size:13px;line-height:1.55;color:#3d3d3d;">
            ${escapeHtml(ship.buyerName)}<br/>
            ${escapeHtml([ship.buyerAddress, ship.buyerCity, checkoutCountryLabel(ship.buyerCountry)].filter(Boolean).join(", "))}<br/>
            ${escapeHtml(ship.buyerPhone)} · ${escapeHtml(ship.buyerEmail)}
          </p>
        </td>
      </tr>
    </table>`;
}

export function renderOrderConfirmationWithInvoice(
  template: CustomerEmailTemplate,
  bundle: CustomerEmailsBundle,
  ctx: EmailMergeContext,
  order: CustomerOrder,
): { subject: string; previewText: string; html: string; text: string } {
  const base = renderCustomerEmailHtml(template, bundle, ctx);
  const accent = bundle.global.brandAccent || "#2D6BFF";
  const invoice = renderOrderInvoiceBlock(order, accent);
  const postal = postalAddressLine();

  const html = base.html.replace(
    "</td></tr>\n        <tr><td style=\"padding:0 32px 32px;border-top:1px solid #eef0f2;\">",
    `${invoice}</td></tr>\n        <tr><td style="padding:0 32px 32px;border-top:1px solid #eef0f2;">`,
  );

  const text = [
    base.text,
    "",
    "--- Invoice ---",
    `Order: ${order.orderNumber}`,
    ...orderLines(order).map((l) => `${l.qty}x ${l.displayTitle} — ${l.priceLabel}`),
    `Total: ${order.lineItem.priceLabel}`,
    `Payment: ${paymentLabel(order)}`,
    "",
    postal,
  ].join("\n");

  return { subject: base.subject, previewText: base.previewText, html, text };
}
