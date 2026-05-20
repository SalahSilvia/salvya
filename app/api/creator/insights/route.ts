import type { NextRequest } from "next/server";
import { computeCreatorInsight, getLatestCreatorInsight } from "@/lib/creator/insights-engine";
import { recordCreatorEngagementEvent } from "@/lib/creator/events-service";
import { requireCreator } from "@/lib/creator/require-creator";
import { rbacApiJson, rbacApiNotConfigured } from "@/lib/auth/api-errors";
import { createServiceSupabase } from "@/lib/supabase/service";

export async function GET(request: NextRequest) {
  const auth = await requireCreator(request);
  if (!auth.ok) return auth.response;

  const service = createServiceSupabase();
  if (!service) return rbacApiNotConfigured();

  const refresh = request.nextUrl.searchParams.get("refresh") === "1";

  try {
    let insight = await getLatestCreatorInsight(service, auth.user.id);
    if (!insight || refresh) {
      insight = await computeCreatorInsight(service, auth.user.id);
    }

    void recordCreatorEngagementEvent(service, {
      eventType: "insight_view",
      creatorId: auth.user.id,
    }).catch(() => undefined);

    return rbacApiJson({ ok: true, insight });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load insights";
    return rbacApiJson({ ok: false, error: message }, { status: 500 });
  }
}
