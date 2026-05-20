import type { NextRequest } from "next/server";
import { loadCustomerEmails, saveCustomerEmails, sanitizeCustomerEmailsBundle } from "@/lib/email/customer-emails-settings";
import { getResendDeliveryStatus } from "@/lib/email/resend-config";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import { rbacApiJson } from "@/lib/auth/api-errors";

export async function GET(request: NextRequest) {
  const admin = await requireAdminService(request);
  if (!admin.ok) return admin.response;

  try {
    const emails = await loadCustomerEmails(admin.service);
    return rbacApiJson({ ok: true, emails, resend: getResendDeliveryStatus() });
  } catch (e) {
    return rbacApiJson({ ok: false, error: e instanceof Error ? e.message : "Load failed" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
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

  const emails = sanitizeCustomerEmailsBundle((body as { emails?: unknown }).emails ?? body);

  try {
    await saveCustomerEmails(admin.service, emails);
    return rbacApiJson({ ok: true, emails });
  } catch (e) {
    return rbacApiJson({ ok: false, error: e instanceof Error ? e.message : "Save failed" }, { status: 500 });
  }
}
