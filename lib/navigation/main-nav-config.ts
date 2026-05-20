import type { SalvyaRole } from "@/lib/auth/roles";

export type MainNavTabId = "home" | "shop" | "bag" | "search" | "menu";

export type MainNavTab = {
  id: MainNavTabId;
  href: string;
  label: string;
  shortLabel: string;
  match: (pathname: string) => boolean;
  /** Which chrome builds include this tab. */
  surfaces: ("mobile" | "desktop")[];
};

function buildTabs(isAdmin: boolean, isGuest: boolean): MainNavTab[] {
  const tabs: MainNavTab[] = [
    {
      id: "home",
      href: isAdmin ? "/admin/overview" : "/",
      label: isAdmin ? "Dashboard" : "Home",
      shortLabel: isAdmin ? "Admin" : "Home",
      match: (p) => (isAdmin ? p === "/admin" || p.startsWith("/admin/") : p === "/"),
      surfaces: ["mobile", "desktop"],
    },
    {
      id: "shop",
      href: "/shop",
      label: "Shop",
      shortLabel: "Shop",
      match: (p) => p === "/shop" || p.startsWith("/artist/"),
      surfaces: ["mobile", "desktop"],
    },
    {
      id: "bag",
      href: "/preview-bag",
      label: "Bag",
      shortLabel: "Bag",
      match: (p) => p.startsWith("/preview-bag"),
      surfaces: ["mobile", "desktop"],
    },
    {
      id: "search",
      href: "/search",
      label: "Search",
      shortLabel: "Search",
      match: (p) => p.startsWith("/search"),
      surfaces: ["mobile", "desktop"],
    },
    {
      id: "menu",
      href: "/menu",
      label: "Menu",
      shortLabel: "Menu",
      match: (p) => p === "/menu" || p.startsWith("/menu/"),
      surfaces: ["mobile", "desktop"],
    },
  ];

  if (isGuest) {
    return tabs.filter((t) => t.id !== "home");
  }
  return tabs;
}

export function mainNavTabsForRole(role: SalvyaRole | null, surface: "mobile" | "desktop"): MainNavTab[] {
  const isAdmin = role === "admin";
  const isGuest = role === null;
  return buildTabs(isAdmin, isGuest).filter((t) => t.surfaces.includes(surface));
}

/** @deprecated Use mainNavTabsForRole(role, "mobile") */
export function mobileMainNavTabs(role: SalvyaRole | null) {
  return mainNavTabsForRole(role, "mobile");
}

export function shouldHideMainNav(pathname: string): boolean {
  const path = pathname.split("?")[0] || pathname;
  if (path === "/terms" || path.startsWith("/terms/")) return true;
  if (path === "/cookies" || path.startsWith("/cookies/")) return true;
  if (path === "/admin" || path.startsWith("/admin/")) return true;
  if (path.includes("/checkout")) return true;
  if (path.startsWith("/account/refunds/")) return true;
  return false;
}

/** @deprecated Use shouldHideMainNav */
export const shouldHideMobileMainNav = shouldHideMainNav;
