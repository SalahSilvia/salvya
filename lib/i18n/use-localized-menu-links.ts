"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { localizeMenuGroupTitle, localizeMenuLinks } from "@/lib/i18n/menu-link-i18n";
import type { CustomerMenuLink } from "@/lib/member/customer-menu-links";
import {
  CUSTOMER_SHOPPING_LINKS,
  MENU_DISCOVER_GUEST,
  MENU_DISCOVER_MEMBER,
  MENU_POLICY_GROUPS,
} from "@/lib/menu/menu-hub-links";

function useMenuTranslators() {
  const tMenu = useTranslations("menu");
  const tCommon = useTranslations("common");
  return { tMenu, tCommon };
}

export function useLocalizedDiscoverGuest(): CustomerMenuLink[] {
  const { tMenu, tCommon } = useMenuTranslators();
  return useMemo(
    () => localizeMenuLinks(MENU_DISCOVER_GUEST, tMenu, tCommon),
    [tMenu, tCommon],
  );
}

export function useLocalizedDiscoverMember(): CustomerMenuLink[] {
  const { tMenu, tCommon } = useMenuTranslators();
  return useMemo(
    () => localizeMenuLinks(MENU_DISCOVER_MEMBER, tMenu, tCommon),
    [tMenu, tCommon],
  );
}

export function useLocalizedShoppingLinks(): CustomerMenuLink[] {
  const { tMenu, tCommon } = useMenuTranslators();
  return useMemo(
    () => localizeMenuLinks(CUSTOMER_SHOPPING_LINKS, tMenu, tCommon),
    [tMenu, tCommon],
  );
}

export function useLocalizedPolicyGroups() {
  const { tMenu, tCommon } = useMenuTranslators();
  return useMemo(
    () =>
      MENU_POLICY_GROUPS.map((group) => ({
        ...group,
        title: localizeMenuGroupTitle(group.id, tMenu),
        links: localizeMenuLinks(group.links, tMenu, tCommon),
      })),
    [tMenu, tCommon],
  );
}
