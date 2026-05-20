import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { normalizeSupabaseUrl } from "@/lib/supabase/url";

/**
 * Stateless server client (no user cookies). Use for public reads or with the service role in Route Handlers later.
 */
export function getSupabasePublicServerClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  if (!url) return null;
  return createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
