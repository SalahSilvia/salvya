import { checkRateLimit, type RateLimitResult } from "@/lib/security/api-rate-limit";

export type CheckoutRateLimitContext = {
  ip: string;
  email?: string;
  deviceFingerprint?: string;
};

function checkOne(key: string, limit: number, windowMs: number): RateLimitResult {
  return checkRateLimit(key, { limit, windowMs });
}

/**
 * Layered limits: IP + email + optional device fingerprint.
 * Returns first failing bucket.
 */
export function checkCheckoutRateLimit(
  scope: "orders" | "paypal",
  ctx: CheckoutRateLimitContext,
): RateLimitResult {
  const limits =
    scope === "orders"
      ? { ip: 24, email: 12, fp: 16, windowMs: 60_000 }
      : { ip: 40, email: 20, fp: 28, windowMs: 60_000 };

  const ipKey = `${scope}:ip:${ctx.ip}`;
  const ip = checkOne(ipKey, limits.ip, limits.windowMs);
  if (!ip.ok) return ip;

  const email = ctx.email?.trim().toLowerCase();
  if (email && email.includes("@")) {
    const emailKey = `${scope}:email:${email}`;
    const er = checkOne(emailKey, limits.email, limits.windowMs);
    if (!er.ok) return er;
  }

  const fp = ctx.deviceFingerprint?.trim().slice(0, 128);
  if (fp) {
    const fpKey = `${scope}:fp:${fp}`;
    const fr = checkOne(fpKey, limits.fp, limits.windowMs);
    if (!fr.ok) return fr;
  }

  return { ok: true };
}

export function deviceFingerprintFromRequest(request: Request): string | undefined {
  const fp = request.headers.get("x-salvya-device-fp")?.trim();
  return fp && fp.length >= 8 ? fp : undefined;
}
