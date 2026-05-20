"use client";

import { useRouter } from "next/navigation";
import { MenuHubShell } from "@/components/layout/menu/hub/MenuHubShell";
import {
  MenuAboutCard,
  MenuCreatorProgrammeCard,
  MenuDiscoverGrid,
  MenuGuestHero,
  MenuPoliciesHub,
} from "@/components/layout/menu/hub/MenuHubSections";
import { MenuRegionalSettings } from "@/components/geo/MenuRegionalSettings";
import {
  CUSTOMER_ABOUT_STORY_HREF,
  MENU_DISCOVER_GUEST,
} from "@/lib/menu/menu-hub-links";

export function GuestMenuPage() {
  const router = useRouter();

  return (
    <MenuHubShell logoHref="/shop" onClose={() => router.back()} closeLabel="Back">
      <MenuGuestHero />
      <MenuDiscoverGrid links={MENU_DISCOVER_GUEST} />
      <MenuRegionalSettings className="mt-8" />
      <MenuPoliciesHub />
      <MenuAboutCard href={CUSTOMER_ABOUT_STORY_HREF} />
      <MenuCreatorProgrammeCard mode="guest" />
    </MenuHubShell>
  );
}
