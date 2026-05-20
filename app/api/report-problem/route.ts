import type { NextRequest } from "next/server";
import { rbacApiJson } from "@/lib/auth/api-errors";
import { reportReferenceId, validateReportPayload } from "@/lib/report-problem/report-problem-data";
import { sendReportProblemEmail } from "@/lib/report-problem/send-report-problem";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return rbacApiJson({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = validateReportPayload(body);
  if (!parsed.ok) {
    return rbacApiJson({ ok: false, error: parsed.error }, { status: 400 });
  }

  const referenceId = reportReferenceId();
  const sent = await sendReportProblemEmail(referenceId, parsed.data);
  if (!sent.ok) {
    return rbacApiJson({ ok: false, error: sent.error }, { status: 502 });
  }

  return rbacApiJson({ ok: true, referenceId });
}
