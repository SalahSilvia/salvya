import type { NextRequest } from "next/server";

export function getClientIp(request: NextRequest): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first.slice(0, 128);
  }
  const rip = request.headers.get("x-real-ip")?.trim();
  if (rip) return rip.slice(0, 128);
  return "unknown";
}

const bucket = new Map<string, { n: number; resetAt: number }>();

/** Simple sliding-window rate limiter (per-process). */
export function allowAnalyticsRequest(key: string, maxPerWindow: number, windowMs: number): boolean {
  const now = Date.now();
  const cur = bucket.get(key);
  if (!cur || now > cur.resetAt) {
    bucket.set(key, { n: 1, resetAt: now + windowMs });
    return true;
  }
  if (cur.n >= maxPerWindow) return false;
  cur.n += 1;
  return true;
}
