import type { NextRequest } from "next/server";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import { rbacApiJson } from "@/lib/auth/api-errors";
import type { EmailSendLogRow, EmailTemplateId } from "@/lib/email/types";

export async function GET(request: NextRequest) {
  const admin = await requireAdminService(request);
  if (!admin.ok) return admin.response;

  const limit = Math.min(100, Math.max(10, parseInt(new URL(request.url).searchParams.get("limit") ?? "40", 10) || 40));

  const { data, error } = await admin.service
    .from("email_send_log")
    .select("id, template_id, to_email, subject, status, error, meta, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (error.code === "42P01" || error.message.includes("does not exist")) {
      return rbacApiJson({ ok: true, log: [] });
    }
    return rbacApiJson({ ok: false, error: error.message }, { status: 500 });
  }

  const log: EmailSendLogRow[] = (data ?? []).map((r) => ({
    id: r.id,
    templateId: r.template_id as EmailTemplateId,
    toEmail: r.to_email,
    subject: r.subject,
    status: r.status as EmailSendLogRow["status"],
    error: r.error,
    meta: r.meta as Record<string, unknown> | null,
    createdAt: r.created_at,
  }));

  return rbacApiJson({ ok: true, log });
}
