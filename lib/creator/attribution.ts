import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeTrackingCode } from "@/lib/creator/referral-cookie";

export type CreatorAttributionSnapshot = {
  creatorId: string;
  creatorTrackingCode: string;
  creatorProductLinkId: string;
  productId: string;
  referralSource: "creator_link" | "creator_cookie" | "creator_last_touch";
  selfReferral: boolean;
};

export type ResolvedCreatorLink = {
  id: string;
  creator_id: string;
  product_id: string;
  creator_code: string;
  tracking_code: string;
};

export async function resolveCreatorLinkByTrackingCode(
  service: SupabaseClient,
  trackingCodeRaw: string | null | undefined,
): Promise<ResolvedCreatorLink | null> {
  const code = normalizeTrackingCode(trackingCodeRaw ?? "");
  if (!code) return null;

  const { data, error } = await service
    .from("creator_product_links")
    .select("id, creator_id, product_id, creator_code, tracking_code")
    .eq("tracking_code", code)
    .maybeSingle();

  if (error) {
    if (error.code === "42P01" || error.message.includes("does not exist")) return null;
    throw new Error(error.message);
  }

  if (!data) return null;
  return data as ResolvedCreatorLink;
}

export function buildAttributionSnapshot(
  link: ResolvedCreatorLink,
  buyerUserId: string | null,
): CreatorAttributionSnapshot {
  const selfReferral = Boolean(buyerUserId && buyerUserId === link.creator_id);
  return {
    creatorId: link.creator_id,
    creatorTrackingCode: link.tracking_code,
    creatorProductLinkId: link.id,
    productId: link.product_id,
    referralSource: "creator_link",
    selfReferral,
  };
}
