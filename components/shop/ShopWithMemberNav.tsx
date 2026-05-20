"use client";

import { HomeVol1 } from "@/components/v1/HomeVol1";
import { MemberSignedShell } from "@/components/member/MemberSignedShell";
import { useSupabaseUser } from "@/components/member/useSupabaseUser";
import { SalvyaPremiumHomeSkeleton } from "@/components/skeleton/SalvyaPremiumHomeSkeleton";
import type { ShopSectionsPayload } from "@/lib/shop/build-shop-sections";
import type { BlogPost } from "@/lib/blog/types";

type Props = {
  shop: ShopSectionsPayload;
  blogPosts?: BlogPost[];
  locale?: string;
};

/** Full storefront (`/shop`); signed-in members get the bottom tab bar for quick navigation. */
export function ShopWithMemberNav({ shop, blogPosts = [], locale = "en" }: Props) {
  const { user, loading } = useSupabaseUser();

  if (loading) {
    return <SalvyaPremiumHomeSkeleton />;
  }

  if (user) {
    return (
      <MemberSignedShell>
        <HomeVol1 shop={shop} blogPosts={blogPosts} useMainNav />
      </MemberSignedShell>
    );
  }

  return <HomeVol1 shop={shop} blogPosts={blogPosts} locale={locale} />;
}
