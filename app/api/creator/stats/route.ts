import type { NextRequest } from "next/server";
import { getCreatorDashboardStats } from "@/lib/creator/stats-service";
import { requireCreator } from "@/lib/creator/require-creator";
import { rbacApiJson, rbacApiNotConfigured } from "@/lib/auth/api-errors";
import { createServiceSupabase } from "@/lib/supabase/service";

export async function GET(request: NextRequest) {
  const auth = await requireCreator(request);
  if (!auth.ok) return auth.response;

  const service = createServiceSupabase();
  if (!service) return rbacApiNotConfigured();

  try {
    const stats = await getCreatorDashboardStats(service, auth.user.id);
    return rbacApiJson({ ok: true, stats });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load stats";
    if (process.env.NODE_ENV === "development") {
      console.error("[api/creator/stats]", e);
    }
    return rbacApiJson({ ok: false, error: message }, { status: 500 });
  }
}
