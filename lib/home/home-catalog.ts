import { loadPublishedProductsForDiscovery } from "@/lib/discovery/build-discovery-catalog";
import { loadPersonalizationProfile } from "@/lib/discovery/personalization";
import { rankProductsToHomeCards } from "@/lib/home/rank-home-catalog";
import type { PremiumTrendingCard } from "@/lib/home/premium-trending";
import { getStorefrontArtists } from "@/lib/artists/get-artists";
import { getMarketContext } from "@/lib/market/get-market-context";
import { createServiceSupabase } from "@/lib/supabase/service";
import { getServerSalvyaUser } from "@/lib/auth/get-user-role";

/**
 * Premium home feed cards from published Supabase products only.
 * @deprecated Sync folder-based `getHomeCatalogCards` removed — use this async helper.
 */
export async function getHomeCatalogCardsAsync(maxTotal = 18): Promise<PremiumTrendingCard[]> {
  const session = await getServerSalvyaUser();
  const service = createServiceSupabase();

  const [catalog, artists, market, profile] = await Promise.all([
    loadPublishedProductsForDiscovery(Math.max(maxTotal * 3, 48)),
    getStorefrontArtists(),
    getMarketContext(),
    loadPersonalizationProfile(service, session?.id ?? null),
  ]);

  const artistNames = new Map(artists.map((a) => [a.slug, a.name]));
  return rankProductsToHomeCards(catalog.products, artistNames, market, profile, maxTotal);
}

export function pickHeroBackdrop(cards: PremiumTrendingCard[]): string | null {
  const hoodie = cards.find((c) => c.kind === "hoodie");
  return hoodie?.imageSrc ?? cards[0]?.imageSrc ?? null;
}
