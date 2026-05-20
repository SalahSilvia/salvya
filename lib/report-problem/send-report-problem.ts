import { formatResendFrom, getResendEnv, SALVYA_EMAIL_ALIASES } from "@/lib/email/resend-config";
import {
  labelForArea,
  labelForCategory,
  labelForImpact,
  type ReportProblemPayload,
} from "@/lib/report-problem/report-problem-data";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendReportProblemEmail(
  referenceId: string,
  payload: ReportProblemPayload,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const env = getResendEnv();
  const to = SALVYA_EMAIL_ALIASES.support.address;
  const category = labelForCategory(payload.category);
  const area = labelForArea(payload.area);
  const impact = labelForImpact(payload.impact);
  const subject = `[${referenceId}] Problem report · ${category} · ${impact}`;

  const text = [
    `Reference: ${referenceId}`,
    `Category: ${category}`,
    `Area: ${area}`,
    `Impact: ${impact}`,
    payload.orderNumber ? `Order: ${payload.orderNumber}` : null,
    payload.email ? `Reply-to: ${payload.email}` : null,
    payload.pageUrl ? `Page: ${payload.pageUrl}` : null,
    payload.locale ? `Locale: ${payload.locale}` : null,
    "",
    "Description:",
    payload.description,
    payload.steps ? `\nSteps to reproduce:\n${payload.steps}` : null,
    payload.userAgent ? `\nUser agent:\n${payload.userAgent}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:24px;background:#f4f5f7;font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;font-size:14px;color:#111;">
  <table width="100%" style="max-width:560px;margin:0 auto;background:#fff;border-radius:14px;border:1px solid #e8eaed;overflow:hidden;">
    <tr><td style="background:#050508;padding:20px 24px;">
      <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#8fa8e8;">Salvya · Product feedback</p>
      <h1 style="margin:8px 0 0;font-size:20px;font-weight:600;color:#fff;">${escapeHtml(referenceId)}</h1>
    </td></tr>
    <tr><td style="padding:24px;">
      <p style="margin:0 0 12px;"><strong>Type:</strong> ${escapeHtml(category)} · <strong>Where:</strong> ${escapeHtml(area)} · <strong>Impact:</strong> ${escapeHtml(impact)}</p>
      ${payload.orderNumber ? `<p style="margin:0 0 8px;"><strong>Order:</strong> ${escapeHtml(payload.orderNumber)}</p>` : ""}
      ${payload.email ? `<p style="margin:0 0 8px;"><strong>Email:</strong> ${escapeHtml(payload.email)}</p>` : ""}
      ${payload.pageUrl ? `<p style="margin:0 0 16px;"><strong>Page:</strong> <a href="${escapeHtml(payload.pageUrl)}">${escapeHtml(payload.pageUrl)}</a></p>` : ""}
      <p style="margin:0 0 6px;font-weight:600;">Description</p>
      <pre style="margin:0 0 16px;padding:12px;background:#f6f7f9;border-radius:8px;white-space:pre-wrap;font-family:inherit;font-size:13px;">${escapeHtml(payload.description)}</pre>
      ${payload.steps ? `<p style="margin:0 0 6px;font-weight:600;">Steps</p><pre style="margin:0;padding:12px;background:#f6f7f9;border-radius:8px;white-space:pre-wrap;font-family:inherit;font-size:13px;">${escapeHtml(payload.steps)}</pre>` : ""}
    </td></tr>
  </table>
</body></html>`;

  if (!env) {
    console.info("[report-problem]", referenceId, text);
    return { ok: true };
  }

  const from = formatResendFrom("Salvya Reports", SALVYA_EMAIL_ALIASES.contact.address);
  const replyTo = payload.email?.includes("@") ? payload.email : SALVYA_EMAIL_ALIASES.support.address;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: replyTo,
      subject,
      html,
      text,
      headers: { "X-Entity-Ref-ID": "problem_report" },
      tags: [{ name: "category", value: "problem_report" }],
    }),
  });

  if (!res.ok) {
    let message = `Resend HTTP ${res.status}`;
    try {
      const parsed = (await res.json()) as { message?: string };
      if (parsed.message) message = parsed.message;
    } catch {
      /* ignore */
    }
    return { ok: false, error: message };
  }

  return { ok: true };
}
