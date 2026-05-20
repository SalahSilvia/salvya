import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { normalizeSupabaseUrl } from "@/lib/supabase/url";

let browserClient: SupabaseClient | null = null;
let browserClientForUrl: string | null = null;

/**
 * Browser Supabase client: PKCE verifier + session live in cookies (`@supabase/ssr`),
 * so email-confirm / OAuth redirects can call `exchangeCodeForSession` on the server
 * with the same cookies sent on the request.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!url) return null;
  if (browserClient && browserClientForUrl !== url) {
    browserClient = null;
    browserClientForUrl = null;
  }
  if (!browserClient) {
    browserClient = createBrowserClient(url, anonKey, {
      isSingleton: false,
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
    browserClientForUrl = url;
  }
  return browserClient;
}
