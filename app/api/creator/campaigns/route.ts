import type { NextRequest } from "next/server";
import { createCreatorCampaign, listCreatorCampaigns } from "@/lib/creator/campaign-service";
import { requireCreator } from "@/lib/creator/require-creator";
import { rbacApiJson, rbacApiNotConfigured } from "@/lib/auth/api-errors";
import { createServiceSupabase } from "@/lib/supabase/service";

export async function GET(request: NextRequest) {
  const auth = await requireCreator(request);
  if (!auth.ok) return auth.response;

  const service = createServiceSupabase();
  if (!service) return rbacApiNotConfigured();

  try {
    const campaigns = await listCreatorCampaigns(service, auth.user.id);
    return rbacApiJson({ ok: true, campaigns });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load campaigns";
    return rbacApiJson({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireCreator(request);
  if (!auth.ok) return auth.response;

  const service = createServiceSupabase();
  if (!service) return rbacApiNotConfigured();

  let body: {
    name?: string;
    status?: "active" | "paused" | "ended";
    budgetOptional?: number | null;
    startDate?: string | null;
    endDate?: string | null;
    links?: { creatorProductLinkId: string; trackingCodeVariant?: string }[];
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return rbacApiJson({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.name?.trim()) {
    return rbacApiJson({ ok: false, error: "Campaign name is required" }, { status: 400 });
  }

  try {
    const campaign = await createCreatorCampaign(service, auth.user.id, {
      name: body.name,
      status: body.status,
      budgetOptional: body.budgetOptional,
      startDate: body.startDate,
      endDate: body.endDate,
      links: body.links,
    });
    return rbacApiJson({ ok: true, campaign }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create campaign";
    return rbacApiJson({ ok: false, error: message }, { status: 500 });
  }
}
