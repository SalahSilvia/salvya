import type { User } from "@supabase/supabase-js";
import { artists } from "@/lib/site-data";
import { ShopBlogSection } from "@/components/shop/ShopBlogSection";
import { ShopItemSections } from "@/components/shop/ShopItemSections";
import { ShopSpotlightSection } from "@/components/shop/ShopSpotlightSection";
import type { ShopSectionsPayload } from "@/lib/shop/build-shop-sections";
import type { BlogPost } from "@/lib/blog/types";
import { MemberWelcomeHero } from "@/components/member/MemberWelcomeHero";
import { ArtistCarouselVol1 } from "./ArtistCarouselVol1";
import { StoreHeader } from "./StoreHeader";
import { StoreHero } from "./StoreHero";
import { StoreShopBandsVol1 } from "./StoreShopBandsVol1";

type Props = {
  shop: ShopSectionsPayload;
  blogPosts?: BlogPost[];
  locale?: string;
  /** When set (signed-in customer on `/`), replaces the marketing hero with `MemberWelcomeHero`. */
  memberUser?: User | null;
  /**
   * Signed-in users: hide header hamburger — navigation lives in the bottom main navigator (`MemberBottomNav` + `/menu`).
   */
  useMainNav?: boolean;
};

/** Salvya Vol 1 — header, hero, artists, shop (trend → collections) */
export function HomeVol1({ shop, blogPosts = [], locale = "en", memberUser, useMainNav }: Props) {
  const showHeaderMenu = !memberUser && !useMainNav;

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-[#050508] text-white selection:bg-[#2D6BFF]/35">
      <StoreHeader showNavMenu={showHeaderMenu} />
      <main>
        {memberUser ? <MemberWelcomeHero user={memberUser} /> : <StoreHero />}
        <ArtistCarouselVol1 artists={artists} />
        <ShopItemSections {...shop} />
        <StoreShopBandsVol1 tshirtCarousel={shop.tshirtCarousel} hoodieCarousel={shop.hoodieCarousel} />
        <ShopSpotlightSection item={shop.spotlight} />
        <ShopBlogSection posts={blogPosts} locale={locale} />
      </main>
    </div>
  );
}
