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
import { CUSTOMER_ABOUT_STORY_HREF } from "@/lib/menu/menu-hub-links";
import { useLocalizedDiscoverGuest } from "@/lib/i18n/use-localized-menu-links";

export function GuestMenuPage() {
  const router = useRouter();
  const discoverLinks = useLocalizedDiscoverGuest();

  return (
    <MenuHubShell logoHref="/shop" onClose={() => router.back()} closeLabel="Back">
      <MenuGuestHero />
      <MenuDiscoverGrid links={discoverLinks} />
      <MenuRegionalSettings className="mt-8" />
      <MenuPoliciesHub />
      <MenuAboutCard href={CUSTOMER_ABOUT_STORY_HREF} />
      <MenuCreatorProgrammeCard mode="guest" />
    </MenuHubShell>
  );
}
