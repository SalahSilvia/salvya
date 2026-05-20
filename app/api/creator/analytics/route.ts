import type { NextRequest } from "next/server";
import { getCreatorAnalyticsPayload } from "@/lib/creator/stats-service";
import { requireCreator } from "@/lib/creator/require-creator";
import { rbacApiJson, rbacApiNotConfigured } from "@/lib/auth/api-errors";
import { createServiceSupabase } from "@/lib/supabase/service";

export async function GET(request: NextRequest) {
  const auth = await requireCreator(request);
  if (!auth.ok) return auth.response;

  const service = createServiceSupabase();
  if (!service) return rbacApiNotConfigured();

  try {
    const campaignId = request.nextUrl.searchParams.get("campaignId");
    const analytics = await getCreatorAnalyticsPayload(service, auth.user.id, {
      campaignId: campaignId || null,
    });
    return rbacApiJson({ ok: true, analytics });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load analytics";
    return rbacApiJson({ ok: false, error: message }, { status: 500 });
  }
}
