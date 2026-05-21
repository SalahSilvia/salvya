"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { MenuHubShell } from "@/components/layout/menu/hub/MenuHubShell";
import {
  MenuAboutCard,
  MenuCreatorProgrammeCard,
  MenuDiscoverGrid,
  MenuMemberHero,
  MenuPoliciesHub,
  MenuShoppingCard,
  MenuSignOutButton,
} from "@/components/layout/menu/hub/MenuHubSections";
import { useSupabaseUser } from "@/components/member/useSupabaseUser";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { welcomeHeadline } from "@/lib/member/welcome-copy";
import {
  CUSTOMER_ABOUT_STORY_HREF,
  CUSTOMER_PROFILE_HREF,
  CUSTOMER_SETTINGS_HREF,
} from "@/lib/menu/menu-hub-links";
import {
  useLocalizedDiscoverMember,
  useLocalizedShoppingLinks,
} from "@/lib/i18n/use-localized-menu-links";

/** Creator-first menu — studio links instead of apply CTAs. */
export function CreatorMenuPage() {
  const router = useRouter();
  const { user } = useSupabaseUser();

  const discoverLinks = useLocalizedDiscoverMember();
  const shoppingLinks = useLocalizedShoppingLinks();
  const headline = useMemo(() => (user ? welcomeHeadline(user) : { line: "Welcome", name: "" }), [user]);

  const signOut = useCallback(async () => {
    const sb = getSupabaseBrowserClient();
    await sb?.auth.signOut();
    router.push("/shop");
    router.refresh();
  }, [router]);

  return (
    <MenuHubShell logoHref="/" onClose={() => router.push("/")}>
      <MenuMemberHero
        headline={headline}
        email={user?.email}
        profileHref={CUSTOMER_PROFILE_HREF}
        settingsHref={CUSTOMER_SETTINGS_HREF}
      />
      <MenuCreatorProgrammeCard mode="approved" delay={0.04} />
      <MenuDiscoverGrid links={discoverLinks} delay={0.1} />
      <MenuShoppingCard links={shoppingLinks} delay={0.14} />
      <MenuPoliciesHub />
      <MenuAboutCard href={CUSTOMER_ABOUT_STORY_HREF} />
      <MenuSignOutButton onSignOut={() => void signOut()} />
    </MenuHubShell>
  );
}
