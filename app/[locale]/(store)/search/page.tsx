import { SearchExperience } from "@/components/search/SearchExperience";
import { buildDiscoveryProductHits } from "@/lib/discovery/build-discovery-catalog";
import { loadPersonalizationProfile } from "@/lib/discovery/personalization";
import { getStorefrontArtists } from "@/lib/artists/get-artists";
import { getServerSalvyaUser } from "@/lib/auth/get-user-role";
import { createServiceSupabase } from "@/lib/supabase/service";

export default async function SearchPage() {
  const session = await getServerSalvyaUser();
  const service = createServiceSupabase();

  const [productHits, storefrontArtists, personalization] = await Promise.all([
    buildDiscoveryProductHits(),
    getStorefrontArtists(),
    loadPersonalizationProfile(service, session?.id ?? null),
  ]);

  return (
    <SearchExperience
      productHits={productHits}
      storefrontArtists={storefrontArtists}
      personalization={personalization}
    />
  );
}
