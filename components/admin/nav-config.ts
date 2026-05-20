export type AdminNavIcon =
  | "grid"
  | "cart"
  | "truck"
  | "pen"
  | "shirt"
  | "users"
  | "star"
  | "mic"
  | "chart"
  | "gear"
  | "mail"
  | "plus"
  | "store"
  | "menu"
  | "wallet"
  | "shield";

export type AdminNavItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon: AdminNavIcon;
};

export const ADMIN_NAV_GROUPS: { id: string; label: string; items: AdminNavItem[] }[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    items: [
      { href: "/admin/overview", label: "Overview", shortLabel: "Home", icon: "grid" },
      { href: "/admin/analytics", label: "Analytics", shortLabel: "Stats", icon: "chart" },
    ],
  },
  {
    id: "commerce",
    label: "Commerce",
    items: [
      { href: "/admin/orders", label: "Orders", shortLabel: "Orders", icon: "cart" },
      { href: "/admin/products", label: "Products", shortLabel: "Products", icon: "shirt" },
      { href: "/admin/artists", label: "Artists", shortLabel: "Artists", icon: "mic" },
      { href: "/admin/customers", label: "Customers", shortLabel: "Customers", icon: "users" },
      { href: "/admin/shipping", label: "Shipping", shortLabel: "Ship", icon: "truck" },
      {
        href: "/admin/creator-applications",
        label: "Creator applications",
        shortLabel: "Creators",
        icon: "star",
      },
      {
        href: "/admin/creator-promo-insights",
        label: "Creator promo links",
        shortLabel: "Promo",
        icon: "chart",
      },
    ],
  },
  {
    id: "content",
    label: "Content",
    items: [{ href: "/admin/blog", label: "Blog", shortLabel: "Blog", icon: "pen" }],
  },
  {
    id: "operations",
    label: "Operations",
    items: [
      { href: "/admin/payments/reconciliation", label: "Payments", shortLabel: "Pay", icon: "wallet" },
      { href: "/admin/fx", label: "FX rates", shortLabel: "FX", icon: "chart" },
      { href: "/admin/security", label: "Security", shortLabel: "Sec", icon: "shield" },
      { href: "/admin/creator-risk", label: "Creator risk", shortLabel: "Risk", icon: "shield" },
    ],
  },
  {
    id: "system",
    label: "System",
    items: [
      { href: "/admin/emails", label: "Email center", shortLabel: "Email", icon: "mail" },
      { href: "/admin/settings", label: "Settings", shortLabel: "Settings", icon: "gear" },
    ],
  },
];

export const ADMIN_NAV: AdminNavItem[] = ADMIN_NAV_GROUPS.flatMap((g) => g.items);

/** Create flows + storefront — shown in sidebar footer and command palette. */
export const ADMIN_QUICK_ACTIONS: { href: string; label: string; icon: AdminNavIcon; keywords?: string }[] = [
  { href: "/admin/products/new", label: "New product", icon: "plus", keywords: "create sku catalog" },
  { href: "/admin/artists/new", label: "New artist", icon: "mic", keywords: "creator shop profile" },
  { href: "/shop", label: "View storefront", icon: "store", keywords: "preview shop customer" },
];

/** Full list for ⌘K palette (includes operational shortcuts). */
export const ADMIN_COMMAND_ACTIONS: { href: string; label: string; icon: AdminNavIcon; keywords?: string }[] = [
  ...ADMIN_QUICK_ACTIONS,
  { href: "/admin/orders", label: "Open orders", icon: "cart", keywords: "fulfillment queue" },
  { href: "/admin/shipping", label: "Shipping queue", icon: "truck", keywords: "tracking pack ship deliver" },
  {
    href: "/admin/creator-applications",
    label: "Creator applications",
    icon: "star",
    keywords: "creator apply approve pending",
  },
  { href: "/admin/analytics", label: "Analytics", icon: "chart", keywords: "funnel traffic stats" },
  { href: "/admin/emails", label: "Email center", icon: "mail", keywords: "templates transactional" },
];

/** Primary destinations on the mobile bottom dock (last slot = more menu). */
export const ADMIN_MOBILE_DOCK: AdminNavItem[] = [
  { href: "/admin/overview", label: "Overview", shortLabel: "Home", icon: "grid" },
  { href: "/admin/orders", label: "Orders", shortLabel: "Orders", icon: "cart" },
  { href: "/admin/products", label: "Products", shortLabel: "Products", icon: "shirt" },
  { href: "/admin/analytics", label: "Analytics", shortLabel: "Stats", icon: "chart" },
];

const dockHrefs = new Set(ADMIN_MOBILE_DOCK.map((d) => d.href));

/** Grouped items for the mobile “More” sheet (excludes dock destinations). */
export function adminMobileMoreGroups(): typeof ADMIN_NAV_GROUPS {
  return ADMIN_NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !dockHrefs.has(item.href)),
  })).filter((g) => g.items.length > 0);
}

export function isAdminNavActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === "/admin/overview" && (pathname === "/admin" || pathname === "/admin/")) return true;
  if (href !== "/admin/overview" && pathname.startsWith(`${href}/`)) return true;
  return false;
}

export function adminPageTitle(pathname: string): string {
  const hit = ADMIN_NAV.find((n) => isAdminNavActive(pathname, n.href));
  if (hit) return hit.label;
  if (pathname.startsWith("/admin/products/new")) return "New product";
  if (pathname.includes("/admin/products/")) return "Edit product";
  if (pathname.startsWith("/admin/artists/new")) return "New artist";
  if (pathname.match(/\/admin\/artists\/[^/]+/)) return "Edit artist";
  if (pathname.startsWith("/admin/artists")) return "Artists";
  if (pathname.startsWith("/admin/shipping")) return "Shipping";
  if (pathname.startsWith("/admin/blog")) return "Blog";
  if (pathname.startsWith("/admin/emails")) return "Email center";
  if (pathname.startsWith("/admin/payments")) return "Payments";
  if (pathname.startsWith("/admin/creator-applications")) return "Creator applications";
  if (pathname.startsWith("/admin/creator-promo-insights")) return "Creator promo links";
  if (pathname.startsWith("/admin/creator-risk")) return "Creator risk";
  if (pathname.startsWith("/admin/god")) return "God Admin";
  return "Admin";
}

export type AdminBreadcrumb = { label: string; href?: string };

export function adminBreadcrumbs(pathname: string): AdminBreadcrumb[] {
  const crumbs: AdminBreadcrumb[] = [{ label: "Admin", href: "/admin/overview" }];
  if (pathname === "/admin" || pathname === "/admin/" || pathname === "/admin/overview") {
    return [{ label: "Overview" }];
  }
  const section = ADMIN_NAV.find((n) => isAdminNavActive(pathname, n.href));
  if (section) {
    crumbs.push({ label: section.label, href: section.href });
  }
  if (pathname.startsWith("/admin/products/new")) {
    crumbs.push({ label: "New product" });
  } else if (pathname.match(/\/admin\/products\/[^/]+/)) {
    crumbs.push({ label: "Edit product" });
  } else if (pathname.startsWith("/admin/artists/new")) {
    crumbs.push({ label: "Artists", href: "/admin/artists" });
    crumbs.push({ label: "New artist" });
  } else if (pathname.match(/\/admin\/artists\/[^/]+/)) {
    crumbs.push({ label: "Artists", href: "/admin/artists" });
    crumbs.push({ label: "Edit artist" });
  } else if (pathname.startsWith("/admin/blog/new")) {
    crumbs.push({ label: "Blog", href: "/admin/blog" });
    crumbs.push({ label: "New post" });
  } else if (pathname.match(/\/admin\/blog\/[^/]+/)) {
    crumbs.push({ label: "Blog", href: "/admin/blog" });
    crumbs.push({ label: "Edit post" });
  }
  return crumbs.length > 1 ? crumbs.slice(1) : crumbs;
}
