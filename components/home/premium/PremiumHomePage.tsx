"use client";

import type { User } from "@supabase/supabase-js";
import { useMemo, type ReactNode } from "react";
import { useBag } from "@/components/cart/BagProvider";
import { useArtistFollows } from "@/components/artist/ArtistFollowsProvider";
import { useLikes } from "@/components/likes/LikesProvider";
import { buildHomeFeed } from "@/lib/home/home-feed";
import type { HomeCommerceSectionId } from "@/lib/home/feed-engine";
import type { PremiumTrendingCard } from "@/lib/home/premium-trending";
import { sortArtistsByFollows } from "@/lib/home/follows-personalize";
import { sortArtistsByTaste } from "@/lib/member/likes-personalize";
import type { ArtistCard } from "@/lib/site-data";
import { ArtistStoriesRail } from "./ArtistStoriesRail";
import { ElGrandeTotoHomeSection } from "./ElGrandeTotoHomeSection";
import { FeaturedDropsCarousel } from "./FeaturedDropsCarousel";
import { ForYouSection } from "./ForYouSection";
import { PremiumHeroSection } from "./PremiumHeroSection";
import { PremiumHomeTopBar } from "./PremiumHomeTopBar";
import { TrendingNowSection } from "./TrendingNowSection";

type Props = {
  user: User | null;
  catalogCards: PremiumTrendingCard[];
  heroBackdropSrc: string | null;
  storefrontArtists: ArtistCard[];
};

export function PremiumHomePage({
  user,
  catalogCards,
  heroBackdropSrc,
  storefrontArtists,
}: Props) {
  const { items: likedItems } = useLikes();
  const { follows } = useArtistFollows();
  const { totalQty: bagQty } = useBag();

  const feed = useMemo(
    () =>
      buildHomeFeed({
        catalog: catalogCards,
        follows,
        likes: likedItems,
        bagQty,
        isSignedIn: Boolean(user),
      }),
    [catalogCards, follows, likedItems, bagQty, user],
  );

  const elGrandeTotoCards = useMemo(
    () => catalogCards.filter((c) => c.artistSlug === "elgrandetoto"),
    [catalogCards],
  );

  const storyArtists = useMemo(() => {
    let list = sortArtistsByFollows(storefrontArtists, follows);
    list = sortArtistsByTaste(list, likedItems);
    return list;
  }, [storefrontArtists, follows, likedItems]);

  const backdrop = feed.heroBackdrop ?? heroBackdropSrc;

  const commerceNodes: Record<HomeCommerceSectionId, ReactNode> = {
    limitedDrops: <FeaturedDropsCarousel key="limited" drops={feed.limitedDrops} />,
    trending: <TrendingNowSection key="trending" cards={feed.trending} />,
  };

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-[#050508] text-white selection:bg-[#2D6BFF]/35">
      <PremiumHomeTopBar />
      <main className="pb-28">
        <PremiumHeroSection
          user={user}
          backdropSrc={backdrop}
          subtitle={feed.heroSubtitle}
          primaryHref={feed.heroPrimaryHref}
          primaryLabel={feed.heroPrimaryLabel}
        />
        {feed.forYou.length > 0 ? <ForYouSection cards={feed.forYou} follows={follows} /> : null}
        <ArtistStoriesRail artists={storyArtists} follows={follows} maxVisible={8} viewAllHref="/shop" />
        {elGrandeTotoCards.length > 0 ? <ElGrandeTotoHomeSection cards={elGrandeTotoCards} /> : null}
        {feed.commerceSections.map((id) => commerceNodes[id])}
      </main>
    </div>
  );
}
