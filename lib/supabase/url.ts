/**
 * Supabase `createClient` expects the **project root** URL, e.g.
 * `https://abcdefgh.supabase.co` — **not** the PostgREST base (`.../rest/v1`).
 * If `NEXT_PUBLIC_SUPABASE_URL` wrongly includes `/rest/v1`, Auth requests become
 * `.../rest/v1/auth/v1/signup` and return 404 ("Invalid path specified in request URL").
 */
export function normalizeSupabaseUrl(raw: string | undefined): string {
  if (!raw) return "";
  let u = raw.trim().replace(/\/+$/, "");
  const lower = u.toLowerCase();
  if (lower.endsWith("/rest/v1")) {
    u = u.slice(0, -"/rest/v1".length);
  } else if (lower.endsWith("/rest")) {
    u = u.slice(0, -"/rest".length);
  }
  return u.replace(/\/+$/, "");
}
