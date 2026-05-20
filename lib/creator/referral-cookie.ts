/** Last-touch creator promo tracking code (30 days). */
export const CREATOR_REF_COOKIE = "salvya_creator_ref";
export const CREATOR_REF_MAX_AGE_SEC = 60 * 60 * 24 * 30;

export type CreatorReferralCookie = {
  code: string;
  capturedAt: number;
};

export function normalizeTrackingCode(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== "string") return null;
  const code = raw.trim().toUpperCase();
  return code.length >= 4 && code.length <= 64 ? code : null;
}

export function parseCreatorReferralCookie(value: string | undefined): CreatorReferralCookie | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as CreatorReferralCookie;
    const code = normalizeTrackingCode(parsed?.code);
    if (!code) return null;
    return { code, capturedAt: typeof parsed.capturedAt === "number" ? parsed.capturedAt : Date.now() };
  } catch {
    const code = normalizeTrackingCode(value);
    return code ? { code, capturedAt: Date.now() } : null;
  }
}

export function serializeCreatorReferralCookie(payload: CreatorReferralCookie): string {
  return JSON.stringify(payload);
}

export function readCreatorReferralFromDocument(): CreatorReferralCookie | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${CREATOR_REF_COOKIE}=`));
  if (!match) return null;
  const raw = decodeURIComponent(match.slice(CREATOR_REF_COOKIE.length + 1));
  return parseCreatorReferralCookie(raw);
}

export function writeCreatorReferralCookie(code: string): void {
  if (typeof document === "undefined") return;
  const normalized = normalizeTrackingCode(code);
  if (!normalized) return;
  const payload = serializeCreatorReferralCookie({ code: normalized, capturedAt: Date.now() });
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CREATOR_REF_COOKIE}=${encodeURIComponent(payload)}; Path=/; Max-Age=${CREATOR_REF_MAX_AGE_SEC}; SameSite=Lax${secure}`;
}
