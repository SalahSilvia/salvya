import type { SupabaseClient } from "@supabase/supabase-js";
import { listCreatorCampaigns } from "@/lib/creator/campaign-service";
import { listCreatorPayoutRecords } from "@/lib/creator/payout-service";
import { writeCreatorAuditLog } from "@/lib/creator/audit-log-service";

const MAX_EXPORTS_PER_DAY = 3;

export type CreatorDataExport = {
  exportedAt: string;
  profile: Record<string, unknown> | null;
  events: Record<string, unknown>[];
  earnings: Record<string, unknown>[];
  payouts: Record<string, unknown>[];
  campaigns: Record<string, unknown>[];
  payoutRequests: Record<string, unknown>[];
};

async function countExportsToday(service: SupabaseClient, creatorId: string): Promise<number> {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);

  const { count, error } = await service
    .from("creator_data_exports")
    .select("id", { count: "exact", head: true })
    .eq("creator_id", creatorId)
    .gte("created_at", start.toISOString());

  if (error) {
    if (error.code === "42P01") return 0;
    throw new Error(error.message);
  }
  return count ?? 0;
}

export async function exportCreatorData(
  service: SupabaseClient,
  creatorId: string,
  format: "json" | "csv" = "json",
): Promise<{ ok: true; data: CreatorDataExport } | { ok: false; error: string }> {
  const used = await countExportsToday(service, creatorId);
  if (used >= MAX_EXPORTS_PER_DAY) {
    return { ok: false, error: "Export limit reached (3 per day)" };
  }

  const [profileRes, eventsRes, earningsRes, payouts, campaigns] = await Promise.all([
    service.from("creator_profiles").select("*").eq("user_id", creatorId).maybeSingle(),
    service
      .from("creator_events")
      .select("id, event_type, product_id, link_id, tracking_code, order_id, metadata, created_at")
      .eq("creator_id", creatorId)
      .order("created_at", { ascending: false })
      .limit(5000),
    service
      .from("creator_earnings")
      .select("*")
      .eq("creator_id", creatorId)
      .order("created_at", { ascending: false })
      .limit(5000),
    listCreatorPayoutRecords(service, creatorId, 500),
    listCreatorCampaigns(service, creatorId),
  ]);

  const payoutRequestsRes = await service
    .from("creator_payout_requests")
    .select("*")
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false })
    .limit(500);

  await service.from("creator_data_exports").insert({
    creator_id: creatorId,
    format,
  });

  const payload: CreatorDataExport = {
    exportedAt: new Date().toISOString(),
    profile: (profileRes.data as Record<string, unknown>) ?? null,
    events: (eventsRes.data ?? []) as Record<string, unknown>[],
    earnings: (earningsRes.data ?? []) as Record<string, unknown>[],
    payouts: payouts as unknown as Record<string, unknown>[],
    campaigns: campaigns as unknown as Record<string, unknown>[],
    payoutRequests: (payoutRequestsRes.data ?? []) as Record<string, unknown>[],
  };

  await writeCreatorAuditLog(service, {
    creatorId,
    actionType: "data_export",
    entityType: "wallet",
    metadata: { format, eventCount: payload.events.length },
  });

  return { ok: true, data: payload };
}

export function creatorExportToCsv(data: CreatorDataExport): string {
  const lines: string[] = ["section,key,value"];
  lines.push(`meta,exportedAt,${data.exportedAt}`);
  lines.push(`earnings,count,${data.earnings.length}`);
  lines.push(`events,count,${data.events.length}`);
  lines.push(`payouts,count,${data.payouts.length}`);
  return lines.join("\n");
}
