import type { NextRequest } from "next/server";
import { recordCreatorEngagementEvent } from "@/lib/creator/events-service";
import { getCreatorGrowthIntelligence } from "@/lib/creator/growth-intelligence-service";
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
    const intelligence = await getCreatorGrowthIntelligence(service, auth.user.id, { refresh });

    void Promise.all([
      recordCreatorEngagementEvent(service, {
        eventType: "ai_insight_view",
        creatorId: auth.user.id,
        metadata: { panel: "growth_intelligence" },
      }),
      recordCreatorEngagementEvent(service, {
        eventType: "viral_prediction_view",
        creatorId: auth.user.id,
        metadata: { viralScore: intelligence.virality.overallScore },
      }),
      recordCreatorEngagementEvent(service, {
        eventType: "growth_score_view",
        creatorId: auth.user.id,
        metadata: { growthScore: intelligence.growth.growthScore },
      }),
    ]).catch(() => undefined);

    return rbacApiJson({ ok: true, intelligence });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load growth intelligence";
    return rbacApiJson({ ok: false, error: message }, { status: 500 });
  }
}
