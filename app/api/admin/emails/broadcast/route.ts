import type { NextRequest } from "next/server";
import { sendMarketingBroadcast } from "@/lib/email/automations";
import { sampleMergeContext } from "@/lib/email/merge";
import { loadCustomerEmails } from "@/lib/email/customer-emails-settings";
import type { EmailTemplateId } from "@/lib/email/types";
import { EMAIL_TEMPLATE_IDS } from "@/lib/email/defaults";
import { getTemplateCategory } from "@/lib/email/template-catalog";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import { rbacApiJson } from "@/lib/auth/api-errors";

export async function POST(request: NextRequest) {
  const admin = await requireAdminService(request);
  if (!admin.ok) return admin.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return rbacApiJson({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return rbacApiJson({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const o = body as {
    templateId?: string;
    recipients?: unknown;
    merge?: Record<string, string>;
  };

  const templateId = o.templateId as EmailTemplateId;
  if (!templateId || !EMAIL_TEMPLATE_IDS.includes(templateId)) {
    return rbacApiJson({ ok: false, error: "Invalid templateId" }, { status: 400 });
  }

  if (getTemplateCategory(templateId) !== "marketing") {
    return rbacApiJson(
      { ok: false, error: "Broadcast is only for marketing templates. Use test send for order/lifecycle." },
      { status: 400 },
    );
  }

  const rawList = Array.isArray(o.recipients) ? o.recipients : [];
  const recipients = rawList
    .filter((x): x is string => typeof x === "string")
    .map((e) => e.trim())
    .filter((e) => e.includes("@"))
    .slice(0, 50);

  if (recipients.length === 0) {
    return rbacApiJson({ ok: false, error: "Add at least one recipient email" }, { status: 400 });
  }

  const bundle = await loadCustomerEmails(admin.service);
  const base = sampleMergeContext(bundle);
  const merge = o.merge && typeof o.merge === "object" ? o.merge : {};
  const ctx = { ...base, ...merge };

  const result = await sendMarketingBroadcast(admin.service, templateId, recipients, ctx);

  return rbacApiJson({
    ok: true,
    templateId,
    ...result,
    detail: `Sent ${result.sent}, failed ${result.failed}`,
  });
}
