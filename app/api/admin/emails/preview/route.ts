import type { NextRequest } from "next/server";
import { sanitizeCustomerEmailsBundle } from "@/lib/email/customer-emails-settings";
import { sampleMergeContext } from "@/lib/email/merge";
import { renderCustomerEmailHtml } from "@/lib/email/render-html";
import type { EmailTemplateId } from "@/lib/email/types";
import { EMAIL_TEMPLATE_IDS } from "@/lib/email/defaults";
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

  const o = body as { emails?: unknown; templateId?: string };
  const bundle = sanitizeCustomerEmailsBundle(o.emails);
  const templateId = o.templateId as EmailTemplateId;
  if (!templateId || !EMAIL_TEMPLATE_IDS.includes(templateId)) {
    return rbacApiJson({ ok: false, error: "Invalid templateId" }, { status: 400 });
  }

  const template = bundle.templates[templateId];
  const ctx = sampleMergeContext(bundle);
  const rendered = renderCustomerEmailHtml(template, bundle, ctx);

  return rbacApiJson({ ok: true, ...rendered, templateId });
}
