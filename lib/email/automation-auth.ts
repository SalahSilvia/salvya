import type { NextRequest } from "next/server";
import { allowInsecureDevBypass } from "@/lib/security/runtime-env";

/** Server-only triggers for lifecycle email automation. */
export function isEmailAutomationAuthorized(request: NextRequest): boolean {
  const secret = (
    process.env.SALVYA_EMAIL_AUTOMATION_SECRET ??
    process.env.SALVYA_CRON_SECRET ??
    process.env.CRON_SECRET ??
    ""
  ).trim();

  if (!secret) {
    return allowInsecureDevBypass();
  }

  const header = request.headers.get("authorization") ?? "";
  return header === `Bearer ${secret}` || request.headers.get("x-cron-secret") === secret;
}
