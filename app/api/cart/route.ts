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
import { sanitizeCartLines } from "@/lib/cart/validate";
import { createServerSupabase, getSsrEnv } from "@/lib/supabase/server-ssr";

export async function GET(request: NextRequest) {
  const env = getSsrEnv();
  if (!env) {
    return syncApiUnconfiguredGet({ lines: [] });
  }

  const res = syncApiOk({ lines: [], updatedAt: null });
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
      .from("customer_carts")
      .select("lines, updated_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      return syncApiSupabaseError(error.message);
    }

    return syncApiOk({
      lines: sanitizeCartLines(data?.lines),
      updatedAt: data?.updated_at ?? null,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Cart unavailable";
    return syncApiInternalError(message);
  }
}

export async function PUT(request: NextRequest) {
  const env = getSsrEnv();
  if (!env) {
    return syncApiNotConfigured("Cart sync not configured");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return syncApiInvalidJson();
  }

  const lines = sanitizeCartLines((body as { lines?: unknown })?.lines);
  const res = syncApiOk({ lines: [], updatedAt: null });

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
      .from("customer_carts")
      .upsert(
        {
          user_id: user.id,
          lines,
          updated_at: updatedAt,
        },
        { onConflict: "user_id" },
      )
      .select("lines, updated_at")
      .single();

    if (error) {
      return syncApiSupabaseError(error.message);
    }

    return syncApiOk({
      lines: sanitizeCartLines(data.lines),
      updatedAt: data.updated_at,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Cart save failed";
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

    const { error } = await supabase.from("customer_carts").delete().eq("user_id", user.id);
    if (error) {
      return syncApiSupabaseError(error.message);
    }

    return syncApiOk({ cleared: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Cart clear failed";
    return syncApiInternalError(message);
  }
}
