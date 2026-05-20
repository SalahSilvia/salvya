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
import { sanitizeLikedItems } from "@/lib/likes/validate";
import { createServerSupabase, getSsrEnv } from "@/lib/supabase/server-ssr";

export async function GET(request: NextRequest) {
  const env = getSsrEnv();
  if (!env) {
    return syncApiUnconfiguredGet({ items: [] });
  }

  const res = syncApiOk({ items: [], updatedAt: null });
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
      .from("customer_likes")
      .select("items, updated_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      return syncApiSupabaseError(error.message);
    }

    return syncApiOk({
      items: sanitizeLikedItems(data?.items),
      updatedAt: data?.updated_at ?? null,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Likes unavailable";
    return syncApiInternalError(message);
  }
}

export async function PUT(request: NextRequest) {
  const env = getSsrEnv();
  if (!env) {
    return syncApiNotConfigured("Likes sync not configured");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return syncApiInvalidJson();
  }

  const items = sanitizeLikedItems((body as { items?: unknown })?.items);
  const res = syncApiOk({ items: [], updatedAt: null });

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
      .from("customer_likes")
      .upsert(
        {
          user_id: user.id,
          items,
          updated_at: updatedAt,
        },
        { onConflict: "user_id" },
      )
      .select("items, updated_at")
      .single();

    if (error) {
      return syncApiSupabaseError(error.message);
    }

    return syncApiOk({
      items: sanitizeLikedItems(data.items),
      updatedAt: data.updated_at,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Likes save failed";
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

    const { error } = await supabase.from("customer_likes").delete().eq("user_id", user.id);
    if (error) {
      return syncApiSupabaseError(error.message);
    }

    return syncApiOk({ cleared: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Likes clear failed";
    return syncApiInternalError(message);
  }
}
