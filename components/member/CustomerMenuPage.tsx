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
import { useSalvyaSession } from "@/components/member/useSalvyaSession";
import { useSessionRole } from "@/components/member/useSessionRole";
import type { CreatorMenuMode } from "@/components/layout/menu/hub/MenuHubSections";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { welcomeHeadline } from "@/lib/member/welcome-copy";
import {
  CUSTOMER_ABOUT_STORY_HREF,
  CUSTOMER_PROFILE_HREF,
  CUSTOMER_SETTINGS_HREF,
  CUSTOMER_SHOPPING_LINKS,
  MENU_DISCOVER_MEMBER,
} from "@/lib/menu/menu-hub-links";

export function CustomerMenuPage() {
  const router = useRouter();
  const { user } = useSupabaseUser();
  const role = useSessionRole();
  const { session } = useSalvyaSession();
  const isCreator = role === "influencer" || role === "admin" || role === "god_admin";

  const creatorMenuMode: CreatorMenuMode = useMemo(() => {
    if (isCreator) return "approved";
    if (session?.creatorStatus === "pending") return "pending";
    return "customer";
  }, [isCreator, session?.creatorStatus]);

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
      <MenuDiscoverGrid links={MENU_DISCOVER_MEMBER} delay={0.08} />
      <MenuShoppingCard links={CUSTOMER_SHOPPING_LINKS} />
      <MenuPoliciesHub />
      <MenuAboutCard href={CUSTOMER_ABOUT_STORY_HREF} />
      <MenuCreatorProgrammeCard mode={creatorMenuMode} />
      <MenuSignOutButton onSignOut={() => void signOut()} />
    </MenuHubShell>
  );
}
