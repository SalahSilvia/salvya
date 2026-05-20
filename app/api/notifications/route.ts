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
import { defaultNotificationPrefs } from "@/lib/notifications/defaults";
import { sanitizeNotificationPrefs, sanitizeNotifications } from "@/lib/notifications/validate";
import { createServerSupabase, getSsrEnv } from "@/lib/supabase/server-ssr";

export async function GET(request: NextRequest) {
  const env = getSsrEnv();
  if (!env) {
    return syncApiUnconfiguredGet({
      items: [],
      prefs: defaultNotificationPrefs(),
    });
  }

  const res = syncApiOk({
    items: [],
    prefs: defaultNotificationPrefs(),
    updatedAt: null,
  });

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
      .from("customer_notifications")
      .select("items, prefs, updated_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      return syncApiSupabaseError(error.message);
    }

    return syncApiOk({
      items: sanitizeNotifications(data?.items),
      prefs: sanitizeNotificationPrefs(data?.prefs ?? defaultNotificationPrefs()),
      updatedAt: data?.updated_at ?? null,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Notifications unavailable";
    return syncApiInternalError(message);
  }
}

export async function PUT(request: NextRequest) {
  const env = getSsrEnv();
  if (!env) {
    return syncApiNotConfigured("Notifications sync not configured");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return syncApiInvalidJson();
  }

  const b = body as { items?: unknown; prefs?: unknown };
  const items = sanitizeNotifications(b.items);
  const prefs = sanitizeNotificationPrefs(b.prefs ?? defaultNotificationPrefs());
  const res = syncApiOk({
    items: [],
    prefs: defaultNotificationPrefs(),
    updatedAt: null,
  });

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
      .from("customer_notifications")
      .upsert(
        {
          user_id: user.id,
          items,
          prefs,
          updated_at: updatedAt,
        },
        { onConflict: "user_id" },
      )
      .select("items, prefs, updated_at")
      .single();

    if (error) {
      return syncApiSupabaseError(error.message);
    }

    return syncApiOk({
      items: sanitizeNotifications(data.items),
      prefs: sanitizeNotificationPrefs(data.prefs),
      updatedAt: data.updated_at,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Notifications save failed";
    return syncApiInternalError(message);
  }
}
