import { postalAddressLine } from "@/lib/email/deliverability";
import { mergeEmailText, type EmailMergeContext } from "@/lib/email/merge";
import type { CustomerEmailTemplate, CustomerEmailsBundle } from "@/lib/email/types";

function bodyToHtml(body: string): string {
  const escaped = body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .split(/\n\n+/)
    .map((p) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#3d3d3d;">${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

export function renderCustomerEmailHtml(
  template: CustomerEmailTemplate,
  bundle: CustomerEmailsBundle,
  ctx: EmailMergeContext,
): { subject: string; previewText: string; html: string; text: string } {
  const subject = mergeEmailText(template.subject, ctx);
  const previewText = mergeEmailText(template.previewText, ctx);
  const headline = mergeEmailText(template.headline, ctx);
  const body = mergeEmailText(template.body, ctx);
  const ctaLabel = mergeEmailText(template.ctaLabel, ctx);
  const ctaUrl = mergeEmailText(template.ctaUrl, ctx);
  const footerNote = mergeEmailText(template.footerNote, ctx);
  const accent = bundle.global.brandAccent || "#2D6BFF";

  const postal = postalAddressLine();
  const text = [
    headline,
    "",
    body.replace(/\*\*/g, ""),
    "",
    ctaLabel ? `${ctaLabel}: ${ctaUrl}` : "",
    "",
    footerNote,
    "",
    postal,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width"/>
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;">${previewText}</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e8eaed;">
        <tr><td style="background:#050508;padding:28px 32px;">
          <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:${accent};">${bundle.global.fromName}</p>
        </td></tr>
        <tr><td style="padding:32px 32px 8px;">
          <h1 style="margin:0;font-size:24px;line-height:1.25;color:#111111;font-weight:600;">${headline}</h1>
        </td></tr>
        <tr><td style="padding:8px 32px 24px;">
          ${bodyToHtml(body)}
          ${
            ctaLabel && ctaUrl
              ? `<p style="margin:24px 0 0;"><a href="${ctaUrl}" style="display:inline-block;background:${accent};color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:10px;">${ctaLabel}</a></p>`
              : ""
          }
        </td></tr>
        <tr><td style="padding:0 32px 32px;border-top:1px solid #eef0f2;">
          <p style="margin:16px 0 8px;font-size:12px;line-height:1.5;color:#8c9196;">${footerNote}</p>
          <p style="margin:0;font-size:11px;line-height:1.5;color:#a8adb2;">${postal}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject, previewText, html, text };
}
