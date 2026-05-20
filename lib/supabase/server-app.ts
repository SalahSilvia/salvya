import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { normalizeSupabaseUrl } from "@/lib/supabase/url";

/** Supabase client for Server Components / Server Actions (cookie session). */
export async function createAppServerSupabase() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured");
  }

  const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Supabase URL or anon key is not configured");
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          /* setAll from a Server Component — safe to ignore */
        }
      },
    },
  });
}

export function isAppServerSupabaseConfigured(): boolean {
  return isSupabaseConfigured();
}
