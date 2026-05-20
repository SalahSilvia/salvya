/**
 * Safe in-app return path for `?next=` (open-redirect guard). Returns `null` if invalid.
 */
export function safeNextPath(raw: string | null | undefined): string | null {
  if (raw == null || typeof raw !== "string") return null;
  const t = raw.trim();
  if (!t.startsWith("/") || t.startsWith("//") || t.includes("\\") || t.includes("://")) return null;
  return t;
}

/**
 * Builds `/login?next=…` with an open-redirect guard. Only same-origin relative paths are allowed.
 */
export function loginHref(next?: string | null, email?: string | null): string {
  const p = safeNextPath(next ?? null);
  const em = typeof email === "string" ? email.trim() : "";
  const params = new URLSearchParams();
  if (p) params.set("next", p);
  if (em && em.includes("@")) params.set("email", em);
  const q = params.toString();
  return q ? `/login?${q}` : "/login";
}

/** Same guard as {@link loginHref} for the customer registration route. */
export function registerHref(next?: string | null): string {
  const p = safeNextPath(next ?? null);
  if (!p) return "/register";
  return `/register?next=${encodeURIComponent(p)}`;
}
