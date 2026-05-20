import type { NextRequest } from "next/server";
import { ensureLocalEnvLoaded } from "@/lib/env/load-local-env";
import { sanitizeCustomerEmailsBundle, saveCustomerEmails } from "@/lib/email/customer-emails-settings";
import { sendCustomerEmail } from "@/lib/email/send";
import { isResendConfigured } from "@/lib/email/resend-config";
import { sampleMergeContext } from "@/lib/email/merge";
import type { EmailTemplateId } from "@/lib/email/types";
import { EMAIL_TEMPLATE_IDS } from "@/lib/email/defaults";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import { rbacApiJson } from "@/lib/auth/api-errors";

ensureLocalEnvLoaded();

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

  const o = body as { emails?: unknown; templateId?: string; toEmail?: string };
  const bundle = sanitizeCustomerEmailsBundle(o.emails);
  const templateId = o.templateId as EmailTemplateId;
  const toEmail = typeof o.toEmail === "string" ? o.toEmail.trim() : "";

  if (!templateId || !EMAIL_TEMPLATE_IDS.includes(templateId)) {
    return rbacApiJson({ ok: false, error: "Invalid templateId" }, { status: 400 });
  }
  if (!toEmail.includes("@")) {
    return rbacApiJson({ ok: false, error: "Enter a valid test email address" }, { status: 400 });
  }

  await saveCustomerEmails(admin.service, bundle);

  const ctx = sampleMergeContext(bundle);
  const result = await sendCustomerEmail(admin.service, templateId, toEmail, ctx);

  if (!result.ok) {
    return rbacApiJson({ ok: false, error: result.error }, { status: 500 });
  }

  if (result.status === "queued" && !isResendConfigured()) {
    return rbacApiJson({
      ok: false,
      error:
        "RESEND_API_KEY is not loaded. Add it to web/salvya.local.env, then stop and restart npm run dev from the web folder.",
    }, { status: 503 });
  }

  return rbacApiJson({
    ok: true,
    status: result.status,
    detail: result.detail ?? "Check inbox",
    resendConfigured: isResendConfigured(),
  });
}
