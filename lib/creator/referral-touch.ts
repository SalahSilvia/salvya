import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeTrackingCode } from "@/lib/creator/referral-cookie";

export async function recordReferralTouch(
  service: SupabaseClient,
  input: {
    userId: string | null;
    visitorKey: string;
    creatorId: string;
    productId: string | null;
    linkId: string | null;
    trackingCode: string;
  },
): Promise<void> {
  const code = normalizeTrackingCode(input.trackingCode);
  if (!code) return;

  const { error } = await service.from("creator_referral_touches").insert({
    user_id: input.userId,
    visitor_key: input.visitorKey,
    creator_id: input.creatorId,
    product_id: input.productId,
    link_id: input.linkId,
    tracking_code: code,
    touched_at: new Date().toISOString(),
  });

  if (error && error.code !== "42P01" && !error.message.includes("creator_referral_touches")) {
    throw new Error(error.message);
  }
}

export async function loadLastReferralTouch(
  service: SupabaseClient,
  opts: { userId?: string | null; visitorKey?: string | null },
): Promise<{ trackingCode: string; creatorId: string } | null> {
  const queries = [];

  if (opts.userId) {
    queries.push(
      service
        .from("creator_referral_touches")
        .select("tracking_code, creator_id")
        .eq("user_id", opts.userId)
        .order("touched_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    );
  }

  if (opts.visitorKey) {
    queries.push(
      service
        .from("creator_referral_touches")
        .select("tracking_code, creator_id")
        .eq("visitor_key", opts.visitorKey)
        .order("touched_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    );
  }

  for (const q of queries) {
    const { data, error } = await q;
    if (error) {
      if (error.code === "42P01" || error.message.includes("creator_referral_touches")) return null;
      throw new Error(error.message);
    }
    if (data?.tracking_code) {
      return {
        trackingCode: data.tracking_code as string,
        creatorId: data.creator_id as string,
      };
    }
  }

  return null;
}
