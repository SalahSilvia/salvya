import type { NextRequest } from "next/server";
import { listCreatorNotifications } from "@/lib/creator/notification-service";
import { requireCreator } from "@/lib/creator/require-creator";
import { rbacApiJson, rbacApiNotConfigured } from "@/lib/auth/api-errors";
import { createServiceSupabase } from "@/lib/supabase/service";

export async function GET(request: NextRequest) {
  const auth = await requireCreator(request);
  if (!auth.ok) return auth.response;

  const service = createServiceSupabase();
  if (!service) return rbacApiNotConfigured();

  const limitRaw = request.nextUrl.searchParams.get("limit");
  const limit = Math.min(Math.max(Number(limitRaw) || 10, 1), 50);

  try {
    const payload = await listCreatorNotifications(service, auth.user.id, limit);
    return rbacApiJson({ ok: true, ...payload });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load notifications.";
    return rbacApiJson({ ok: false, error: message }, { status: 500 });
  }
}
