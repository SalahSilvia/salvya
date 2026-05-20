"use client";

import type { User } from "@supabase/supabase-js";
import { SalvyaPremiumHomeSkeleton } from "@/components/skeleton";
import { PremiumHomePage } from "@/components/home/premium/PremiumHomePage";
import { MemberSignedShell } from "@/components/member/MemberSignedShell";
import { useSupabaseUser } from "@/components/member/useSupabaseUser";
import type { PremiumTrendingCard } from "@/lib/home/premium-trending";
import type { ArtistCard } from "@/lib/site-data";

type Props = {
  catalogCards: PremiumTrendingCard[];
  heroBackdropSrc: string | null;
  storefrontArtists: ArtistCard[];
};

export function HomeExperience({ catalogCards, heroBackdropSrc, storefrontArtists }: Props) {
  const { user, loading } = useSupabaseUser();

  if (loading) {
    return <SalvyaPremiumHomeSkeleton />;
  }

  if (user) {
    return (
      <MemberSignedShell>
        <PremiumHomePage
          user={user}
          catalogCards={catalogCards}
          heroBackdropSrc={heroBackdropSrc}
          storefrontArtists={storefrontArtists}
        />
      </MemberSignedShell>
    );
  }

  return (
    <PremiumHomePage
      user={null}
      catalogCards={catalogCards}
      heroBackdropSrc={heroBackdropSrc}
      storefrontArtists={storefrontArtists}
    />
  );
}
