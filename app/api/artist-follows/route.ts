import { type NextRequest } from "next/server";
import {
  syncApiInternalError,
  syncApiInvalidJson,
  syncApiJson,
  syncApiNotConfigured,
  syncApiOk,
  syncApiSupabaseError,
  syncApiUnauthorized,
  syncApiUnconfiguredGet,
} from "@/lib/api/sync-api";
import { sanitizeArtistFollows } from "@/lib/follows/validate";
import { createServerSupabase, getSsrEnv } from "@/lib/supabase/server-ssr";

export async function GET(request: NextRequest) {
  const env = getSsrEnv();
  if (!env) {
    return syncApiUnconfiguredGet({ follows: [] });
  }

  const res = syncApiOk({ follows: [], updatedAt: null });
  try {
    const supabase = createServerSupabase(request, res);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return syncApiUnauthorized();
    }

    const { data, error } = await supabase
      .from("customer_artist_follows")
      .select("follows, updated_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      return syncApiSupabaseError(error.message);
    }

    return syncApiOk({
      follows: sanitizeArtistFollows(data?.follows),
      updatedAt: data?.updated_at ?? null,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Follows unavailable";
    return syncApiInternalError(message);
  }
}

export async function PUT(request: NextRequest) {
  const env = getSsrEnv();
  if (!env) {
    return syncApiNotConfigured("Follows sync not configured");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return syncApiInvalidJson();
  }

  const follows = sanitizeArtistFollows((body as { follows?: unknown })?.follows);
  const res = syncApiOk({ follows: [], updatedAt: null });

  try {
    const supabase = createServerSupabase(request, res);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return syncApiUnauthorized();
    }

    const updatedAt = new Date().toISOString();
    const { data, error } = await supabase
      .from("customer_artist_follows")
      .upsert(
        {
          user_id: user.id,
          follows,
          updated_at: updatedAt,
        },
        { onConflict: "user_id" },
      )
      .select("follows, updated_at")
      .single();

    if (error) {
      return syncApiSupabaseError(error.message);
    }

    return syncApiOk({
      follows: sanitizeArtistFollows(data.follows),
      updatedAt: data.updated_at,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Follows save failed";
    return syncApiInternalError(message);
  }
}

export async function DELETE(request: NextRequest) {
  const env = getSsrEnv();
  if (!env) {
    return syncApiJson({ ok: true, cleared: true, synced: false });
  }

  const res = syncApiOk({ cleared: true });

  try {
    const supabase = createServerSupabase(request, res);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return syncApiUnauthorized();
    }

    const { error } = await supabase.from("customer_artist_follows").delete().eq("user_id", user.id);
    if (error) {
      return syncApiSupabaseError(error.message);
    }

    return syncApiOk({ cleared: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Follows clear failed";
    return syncApiInternalError(message);
  }
}
