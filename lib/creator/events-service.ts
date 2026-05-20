import type { SupabaseClient } from "@supabase/supabase-js";
import { recordTrustedCreatorEvent, type TrustedEventContext } from "@/lib/creator/trusted-events";

export type CreatorEventType = "click" | "order" | "view";

export type CreatorEngagementEventType =
  | "campaign_click"
  | "campaign_order"
  | "product_boost_view"
  | "wallet_view"
  | "insight_view"
  | "ai_insight_view"
  | "viral_prediction_view"
  | "growth_score_view"
  | "boost_suggestion_click";

export type CreatorAnyEventType = CreatorEventType | CreatorEngagementEventType;

export type RecordCreatorEventInput = {
  eventType: CreatorAnyEventType;
  creatorId: string;
  productId?: string | null;
  linkId?: string | null;
  trackingCode?: string | null;
  userId?: string | null;
  orderId?: string | null;
  metadata?: Record<string, unknown>;
};

/** Trusted event ingest (dedup + metrics + fraud checks). */
export async function recordCreatorEvent(
  service: SupabaseClient,
  input: RecordCreatorEventInput,
  ctx: TrustedEventContext = {},
): Promise<string | null> {
  const result = await recordTrustedCreatorEvent(service, input, ctx);
  return result.eventId;
}

/** Optional overlay events — never used for core click/order attribution paths. */
export async function recordCreatorEngagementEvent(
  service: SupabaseClient,
  input: Omit<RecordCreatorEventInput, "eventType"> & { eventType: CreatorEngagementEventType },
  ctx: TrustedEventContext = {},
): Promise<string | null> {
  const result = await recordTrustedCreatorEvent(
    service,
    input as RecordCreatorEventInput,
    { ...ctx, dedupWindowMinutes: ctx.dedupWindowMinutes ?? 2 },
  );
  return result.eventId;
}
