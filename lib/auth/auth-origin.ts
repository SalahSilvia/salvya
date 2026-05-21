import { getSiteUrl } from "@/lib/seo/site";

const PRODUCTION_CANONICAL = "https://www.salvyastore.com";

function normalizeOrigin(raw: string): string {
  const withProto = raw.startsWith("http") ? raw : `https://${raw}`;
  return withProto.replace(/\/$/, "");
}

/**
 * Canonical origin for Supabase Auth redirects (OAuth, email confirm, password reset).
 * Prefer `NEXT_PUBLIC_SITE_URL` in production so links never point at localhost.
 */
export function getAuthRedirectOrigin(): string {
  if (typeof window !== "undefined") {
    const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    if (configured) return normalizeOrigin(configured);
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return window.location.origin;
    }
    return window.location.origin;
  }

  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return normalizeOrigin(fromEnv);
  if (process.env.NODE_ENV === "production") return PRODUCTION_CANONICAL;
  return getSiteUrl();
}
