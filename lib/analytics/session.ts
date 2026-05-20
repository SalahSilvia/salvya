import { getSessionUtm } from "@/lib/analytics/utm";

const SESSION_ID_KEY = "salvya_analytics_session_id_v1";

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "");
  }
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 14)}`;
}

/**
 * Stable anonymous session id (persisted in localStorage).
 */
export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = window.localStorage.getItem(SESSION_ID_KEY)?.trim();
    if (existing && existing.length >= 16) return existing;
    const next = randomId();
    window.localStorage.setItem(SESSION_ID_KEY, next);
    return next;
  } catch {
    return randomId();
  }
}

export function getSessionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(SESSION_ID_KEY)?.trim() ?? null;
  } catch {
    return null;
  }
}

/** Client-side noop placeholder — server `last_seen` is updated via `/api/analytics/heartbeat` + collect. */
export function touchSession(): void {
  void getOrCreateSessionId();
}

export type ClientAttributionSnapshot = {
  utm_source?: string | null;
  utm_campaign?: string | null;
  utm_medium?: string | null;
  referrer?: string | null;
};

export function readAttributionSnapshot(): ClientAttributionSnapshot {
  const u = getSessionUtm();
  let referrer: string | null = null;
  if (typeof document !== "undefined" && document.referrer) {
    try {
      referrer = document.referrer.slice(0, 2000);
    } catch {
      referrer = null;
    }
  }
  return {
    utm_source: u.utm_source ?? null,
    utm_campaign: u.utm_campaign ?? null,
    utm_medium: u.utm_medium ?? null,
    referrer,
  };
}
