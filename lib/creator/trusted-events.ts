import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildEventFingerprint,
  hashUserAgent,
  hashVisitorIp,
  visitorKeyFromRequest,
} from "@/lib/creator/event-fingerprint";
import type { RecordCreatorEventInput } from "@/lib/creator/events-service";
import { runCreatorFraudChecks } from "@/lib/creator/fraud-detection";
import { recordReferralTouch } from "@/lib/creator/referral-touch";

export type TrustedEventContext = {
  ip?: string;
  userAgent?: string;
  dedupWindowMinutes?: number;
  revenueMinor?: number;
};

export type TrustedEventResult = {
  eventId: string | null;
  duplicate: boolean;
  visitorKey: string;
};

export async function recordTrustedCreatorEvent(
  service: SupabaseClient,
  input: RecordCreatorEventInput,
  ctx: TrustedEventContext = {},
): Promise<TrustedEventResult> {
  const ip = ctx.ip ?? "unknown";
  const ua = ctx.userAgent ?? "";
  const visitorKey = visitorKeyFromRequest(ip, ua);
  const fingerprint = buildEventFingerprint({
    eventType: input.eventType,
    trackingCode: input.trackingCode,
    productId: input.productId,
    userId: input.userId,
    orderId: input.orderId,
    ipHash: hashVisitorIp(ip),
    userAgentHash: hashUserAgent(ua),
  });

  const { data, error } = await service.rpc("record_trusted_creator_event", {
    p_event_type: input.eventType,
    p_creator_id: input.creatorId,
    p_fingerprint_hash: fingerprint,
    p_product_id: input.productId ?? null,
    p_link_id: input.linkId ?? null,
    p_tracking_code: input.trackingCode?.trim().toUpperCase() ?? null,
    p_user_id: input.userId ?? null,
    p_order_id: input.orderId ?? null,
    p_metadata: {
      ...input.metadata,
      fingerprint_hash: fingerprint,
      visitor_key: visitorKey,
      ip_hash: hashVisitorIp(ip),
    },
    p_dedup_window_minutes: ctx.dedupWindowMinutes ?? 10,
    p_revenue_minor: ctx.revenueMinor ?? 0,
  });

  if (error) {
    if (error.code === "42P01" || error.message.includes("record_trusted_creator_event")) {
      return { eventId: null, duplicate: true, visitorKey };
    }
    throw new Error(error.message);
  }

  const row = data as { duplicate?: boolean; event_id?: string } | null;
  const duplicate = Boolean(row?.duplicate);
  const eventId = typeof row?.event_id === "string" ? row.event_id : null;

  if (!duplicate && eventId) {
    if (
      input.eventType === "click" ||
      input.eventType === "view" ||
      input.eventType === "campaign_click"
    ) {
      await recordReferralTouch(service, {
        userId: input.userId ?? null,
        visitorKey,
        creatorId: input.creatorId,
        productId: input.productId ?? null,
        linkId: input.linkId ?? null,
        trackingCode: input.trackingCode ?? "",
      });
    }

    void runCreatorFraudChecks(service, {
      eventId,
      eventType: input.eventType,
      creatorId: input.creatorId,
      linkId: input.linkId ?? null,
      userId: input.userId ?? null,
      trackingCode: input.trackingCode ?? null,
      orderId: input.orderId ?? null,
      ipHash: hashVisitorIp(ip),
      metadata: input.metadata,
    }).catch(() => undefined);
  }

  return { eventId, duplicate, visitorKey };
}

export async function trackCreatorPromoClick(
  service: SupabaseClient,
  link: {
    id: string;
    creator_id: string;
    product_id: string;
    tracking_code: string;
  },
  ctx: { ip: string; userAgent: string; userId?: string | null },
): Promise<TrustedEventResult> {
  return recordTrustedCreatorEvent(
    service,
    {
      eventType: "click",
      creatorId: link.creator_id,
      productId: link.product_id,
      linkId: link.id,
      trackingCode: link.tracking_code,
      userId: ctx.userId ?? null,
    },
    { ip: ctx.ip, userAgent: ctx.userAgent, dedupWindowMinutes: 10 },
  );
}
