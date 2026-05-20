import { normalizeSupabaseUrl } from "@/lib/supabase/url";

export type ImageRemotePattern = {
  protocol: "https";
  hostname: string;
  pathname: string;
};

/** Hostnames allowed for `next/image` when optimizing Supabase Storage product photos. */
export function buildSupabaseImageRemotePatterns(): ImageRemotePattern[] {
  const base = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  if (!base) return [];
  try {
    const host = new URL(base).hostname;
    return [{ protocol: "https", hostname: host, pathname: "/storage/v1/object/public/**" }];
  } catch {
    return [];
  }
}
