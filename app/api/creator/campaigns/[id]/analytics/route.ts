import type { NextRequest } from "next/server";
import { getCampaignAnalytics } from "@/lib/creator/campaign-service";
import { requireCreator } from "@/lib/creator/require-creator";
import { rbacApiJson, rbacApiNotConfigured } from "@/lib/auth/api-errors";
import { createServiceSupabase } from "@/lib/supabase/service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await requireCreator(request);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const service = createServiceSupabase();
  if (!service) return rbacApiNotConfigured();

  try {
    const analytics = await getCampaignAnalytics(service, auth.user.id, id);
    if (!analytics) {
      return rbacApiJson({ ok: false, error: "Campaign not found" }, { status: 404 });
    }
    return rbacApiJson({ ok: true, analytics });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load campaign analytics";
    return rbacApiJson({ ok: false, error: message }, { status: 500 });
  }
}
