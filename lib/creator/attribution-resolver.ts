import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildAttributionSnapshot,
  resolveCreatorLinkByTrackingCode,
  type CreatorAttributionSnapshot,
} from "@/lib/creator/attribution";
import { normalizeTrackingCode } from "@/lib/creator/referral-cookie";
import { loadLastReferralTouch } from "@/lib/creator/referral-touch";

export type AttributionSource = "tracking_code" | "cookie" | "last_touch" | null;

export type ResolvedOrderAttribution = {
  snapshot: CreatorAttributionSnapshot;
  source: AttributionSource;
};

export async function resolveOrderAttribution(
  service: SupabaseClient,
  opts: {
    trackingCodeFromRequest?: string | null;
    trackingCodeFromCookie?: string | null;
    buyerUserId: string | null;
    visitorKey?: string | null;
  },
): Promise<ResolvedOrderAttribution | null> {
  const candidates: { code: string; source: AttributionSource }[] = [];

  const fromRequest = normalizeTrackingCode(opts.trackingCodeFromRequest ?? "");
  if (fromRequest) candidates.push({ code: fromRequest, source: "tracking_code" });

  const fromCookie = normalizeTrackingCode(opts.trackingCodeFromCookie ?? "");
  if (fromCookie && fromCookie !== fromRequest) {
    candidates.push({ code: fromCookie, source: "cookie" });
  }

  for (const c of candidates) {
    const link = await resolveCreatorLinkByTrackingCode(service, c.code);
    if (link) {
      const snapshot = buildAttributionSnapshot(link, opts.buyerUserId);
      snapshot.referralSource =
        c.source === "cookie" ? "creator_cookie" : c.source === "last_touch" ? "creator_last_touch" : "creator_link";
      return { snapshot, source: c.source };
    }
  }

  const lastTouch = await loadLastReferralTouch(service, {
    userId: opts.buyerUserId,
    visitorKey: opts.visitorKey ?? null,
  });

  if (lastTouch) {
    const link = await resolveCreatorLinkByTrackingCode(service, lastTouch.trackingCode);
    if (link) {
      const snapshot = buildAttributionSnapshot(link, opts.buyerUserId);
      snapshot.referralSource = "creator_last_touch";
      return { snapshot, source: "last_touch" };
    }
  }

  return null;
}
