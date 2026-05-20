import type { NextRequest } from "next/server";
import { getCreatorGrowthIntelligence } from "@/lib/creator/growth-intelligence-service";
import { requireCreator } from "@/lib/creator/require-creator";
import { rbacApiJson, rbacApiNotConfigured } from "@/lib/auth/api-errors";
import { createServiceSupabase } from "@/lib/supabase/service";

export async function GET(request: NextRequest) {
  const auth = await requireCreator(request);
  if (!auth.ok) return auth.response;

  const service = createServiceSupabase();
  if (!service) return rbacApiNotConfigured();

  try {
    const intelligence = await getCreatorGrowthIntelligence(service, auth.user.id);
    return rbacApiJson({ ok: true, feed: intelligence.personalizedFeed });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load feed";
    return rbacApiJson({ ok: false, error: message }, { status: 500 });
  }
}
