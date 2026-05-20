/** Creator Studio navigation — shared by shell, mobile dock, and command palette. */

export type CreatorStudioNavItem = {
  id: string;
  href: string;
  label: string;
  shortLabel: string;
  /** Palette / search keywords */
  keywords?: string;
};

export const CREATOR_STUDIO_NAV: CreatorStudioNavItem[] = [
  { id: "dashboard", href: "/creator/dashboard", label: "Dashboard", shortLabel: "Dashboard", keywords: "overview stats revenue" },
  { id: "products", href: "/creator/products", label: "Products", shortLabel: "Products", keywords: "promote catalog discover" },
  { id: "links", href: "/creator/links", label: "Links", shortLabel: "Links", keywords: "campaigns tracking codes share" },
  { id: "wallet", href: "/creator/wallet", label: "Wallet", shortLabel: "Wallet", keywords: "earnings payout balance withdraw" },
  { id: "analytics", href: "/creator/analytics", label: "Analytics", shortLabel: "Stats", keywords: "ctr conversion traffic performance" },
  { id: "leaderboard", href: "/creator/leaderboard", label: "Leaderboard", shortLabel: "Ranks", keywords: "growth viral ranking badges" },
  { id: "more", href: "/creator/more", label: "More", shortLabel: "More", keywords: "settings profile support menu" },
  {
    id: "notifications",
    href: "/creator/notifications",
    label: "Notifications",
    shortLabel: "Alerts",
    keywords: "alerts bell orders payout",
  },
];

/** Primary mobile bottom bar (max 5 slots). Analytics reachable via More + ⌘K. */
export const CREATOR_STUDIO_MOBILE_NAV = CREATOR_STUDIO_NAV.filter((n) =>
  ["dashboard", "products", "links", "wallet", "more"].includes(n.id),
);

export function isCreatorStudioPath(pathname: string): boolean {
  const path = pathname.replace(/^\/(en|fr|es|it|nl|ar)/, "") || pathname;
  return (
    path === "/creator/dashboard" ||
    path.startsWith("/creator/products") ||
    path.startsWith("/creator/links") ||
    path === "/creator/wallet" ||
    path === "/creator/analytics" ||
    path === "/creator/leaderboard" ||
    path === "/creator/more" ||
    path === "/creator/notifications"
  );
}

export function matchCreatorStudioNav(path: string, href: string): boolean {
  if (path === href) return true;
  if (href === "/creator/dashboard") return false;
  return path.startsWith(href);
}
