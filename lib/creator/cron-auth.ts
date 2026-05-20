import type { NextRequest } from "next/server";
import { allowInsecureDevBypass } from "@/lib/security/runtime-env";

export function cronSecret(): string {
  return (process.env.SALVYA_CRON_SECRET ?? process.env.CRON_SECRET ?? "").trim();
}

export function isCronAuthorized(request: NextRequest): boolean {
  const secret = cronSecret();
  if (!secret) {
    return allowInsecureDevBypass();
  }
  const header = request.headers.get("authorization") ?? "";
  return header === `Bearer ${secret}` || request.headers.get("x-cron-secret") === secret;
}
