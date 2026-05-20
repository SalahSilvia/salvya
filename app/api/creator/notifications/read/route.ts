import type { NextRequest } from "next/server";
import { markCreatorNotificationsRead } from "@/lib/creator/notification-service";
import { requireCreator } from "@/lib/creator/require-creator";
import { rbacApiJson, rbacApiNotConfigured } from "@/lib/auth/api-errors";
import { createServiceSupabase } from "@/lib/supabase/service";

export async function PUT(request: NextRequest) {
  const auth = await requireCreator(request);
  if (!auth.ok) return auth.response;

  const service = createServiceSupabase();
  if (!service) return rbacApiNotConfigured();

  let body: { ids?: string[]; all?: boolean } = {};
  try {
    body = (await request.json()) as { ids?: string[]; all?: boolean };
  } catch {
    body = {};
  }

  try {
    const marked = await markCreatorNotificationsRead(service, auth.user.id, {
      ids: Array.isArray(body.ids) ? body.ids : undefined,
      all: body.all === true,
    });
    return rbacApiJson({ ok: true, marked });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update notifications.";
    return rbacApiJson({ ok: false, error: message }, { status: 500 });
  }
}
