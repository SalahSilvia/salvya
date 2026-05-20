import type { SupabaseClient } from "@supabase/supabase-js";
import type { PersonalizationProfile } from "@/lib/discovery/types";
import { likedArtistSlugSet, likedProductIdSet } from "@/lib/member/likes-personalize";
import type { LikedItemRecord } from "@/lib/member/likes-storage";

export async function loadPersonalizationProfile(
  service: SupabaseClient | null,
  userId: string | null,
  likedItems: LikedItemRecord[] = [],
): Promise<PersonalizationProfile | null> {
  if (!userId && !likedItems.length) return null;

  const profile: PersonalizationProfile = {
    likedProductIds: likedProductIdSet(likedItems),
    likedArtistSlugs: likedArtistSlugSet(likedItems),
    viewedProductIds: new Set(),
    viewedArtistSlugs: new Set(),
    purchasedArtistSlugs: new Set(),
    purchasedCategories: new Set(),
  };

  if (!service || !userId) return profile;

  const [viewsRes, ordersRes] = await Promise.all([
    service
      .from("user_recent_views")
      .select("product_id, salvya_products(artist_slug, category)")
      .eq("user_id", userId)
      .order("viewed_at", { ascending: false })
      .limit(20),
    service
      .from("customer_orders")
      .select("line_item, product_snapshot")
      .eq("user_id", userId)
      .in("payment_status", ["paid", "cod_pending"])
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  for (const row of viewsRes.data ?? []) {
    const pid = row.product_id as string;
    if (pid) profile.viewedProductIds.add(pid);
    const prod = row.salvya_products as { artist_slug?: string; category?: string } | null;
    if (prod?.artist_slug) profile.viewedArtistSlugs.add(prod.artist_slug);
  }

  for (const row of ordersRes.data ?? []) {
    const li = row.line_item as { artistSlug?: string } | null;
    const snap = row.product_snapshot as { artistSlug?: string; productKind?: string } | null;
    const artist = li?.artistSlug ?? snap?.artistSlug;
    if (artist) profile.purchasedArtistSlugs.add(artist);
    const kind = snap?.productKind;
    if (kind === "hoodie") profile.purchasedCategories.add("hoodie");
    if (kind === "tshirt") profile.purchasedCategories.add("tee");
  }

  return profile;
}
