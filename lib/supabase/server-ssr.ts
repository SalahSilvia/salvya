import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { normalizeSupabaseUrl } from "@/lib/supabase/url";

/**
 * Server-side Supabase client with cookie read/write bound to a single `NextResponse`
 * (middleware or Route Handler).
 */
export function createServerSupabase(request: NextRequest, response: NextResponse) {
  const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Supabase URL or anon key is not configured");
  }
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });
}

export function getSsrEnv(): { url: string; anonKey: string } | null {
  if (!isSupabaseConfigured()) return null;
  const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}
