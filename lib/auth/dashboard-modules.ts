/**
 * Placeholder registries for upcoming dashboards (no routes wired yet).
 * Admin surface: `/admin` · Creator surface: `/creator/*`
 */

export const ADMIN_DASHBOARD_MODULES = ["orders", "products", "users"] as const;
export type AdminDashboardModule = (typeof ADMIN_DASHBOARD_MODULES)[number];

export const CREATOR_DASHBOARD_MODULES = ["sales", "merch", "analytics"] as const;
export type CreatorDashboardModule = (typeof CREATOR_DASHBOARD_MODULES)[number];
