/**
 * First-touch UTM capture for the browser session (sessionStorage).
 * Values attach to checkout / orders on the server later via explicit payload if needed.
 */

export const UTM_SESSION_KEY = "salvya_utm_attribution_v1";

export type SalvyaUtmAttribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  capturedAt?: string;
};

const KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

function readRaw(): SalvyaUtmAttribution {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(UTM_SESSION_KEY);
    if (!raw) return {};
    const o = JSON.parse(raw) as SalvyaUtmAttribution;
    return typeof o === "object" && o ? o : {};
  } catch {
    return {};
  }
}

function writeRaw(next: SalvyaUtmAttribution): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(UTM_SESSION_KEY, JSON.stringify(next));
  } catch {
    /* quota / private mode */
  }
}

/**
 * Call on client navigations: first non-empty value per key wins for the session.
 */
export function captureUtmFromSearchParams(search: string): void {
  if (typeof window === "undefined" || !search) return;
  const q = search.startsWith("?") ? search.slice(1) : search;
  const params = new URLSearchParams(q);
  let touched = false;
  const prev = readRaw();
  const next: SalvyaUtmAttribution = { ...prev };

  for (const key of KEYS) {
    const v = params.get(key)?.trim();
    if (!v) continue;
    if (!next[key]) {
      next[key] = v;
      touched = true;
    }
  }

  if (touched && !next.capturedAt) {
    next.capturedAt = new Date().toISOString();
  }

  if (touched) writeRaw(next);
}

export function getSessionUtm(): SalvyaUtmAttribution {
  return readRaw();
}

/** Flatten for Meta custom parameters (only defined keys). */
export function utmToMetaCustomData(): Record<string, string> {
  const u = readRaw();
  const out: Record<string, string> = {};
  for (const key of KEYS) {
    const v = u[key];
    if (v) out[key] = v;
  }
  return out;
}
