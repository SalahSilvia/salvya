"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { AdminCommandPalette, useAdminCommandPalette } from "@/components/admin/AdminCommandPalette";
import { AdminMobileDock } from "@/components/admin/AdminMobileDock";
import { AdminMobileMoreSheet } from "@/components/admin/AdminMobileMoreSheet";
import { AdminMobileNavSheet } from "@/components/admin/AdminMobileNavSheet";
import { AdminPreferencesProvider, useAdminPreferences } from "@/components/admin/AdminPreferencesProvider";
import { AdminPendingCreatorApplicationsProvider } from "@/components/admin/AdminPendingCreatorApplicationsProvider";
import { AdminUnreadOrdersProvider } from "@/components/admin/AdminUnreadOrdersProvider";
import { AdminProSidebar } from "@/components/admin/AdminProSidebar";
import { AdminSecurityHeartbeat } from "@/components/admin/AdminSecurityHeartbeat";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { adminPageClass } from "@/components/admin/admin-theme";

function AdminShellInner({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const [moreOpen, setMoreOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const palette = useAdminCommandPalette();
  const { compactNav } = useAdminPreferences();

  const hideBreadcrumbs =
    pathname === "/admin" || pathname === "/admin/" || pathname === "/admin/overview";

  const sidebarW = compactNav ? "4.75rem" : "15.5rem";

  return (
    <div className={adminPageClass} style={{ ["--admin-sidebar-w" as string]: sidebarW }}>
      <AdminSecurityHeartbeat />
      <AdminProSidebar />
      <div className="flex min-h-screen flex-col lg:pl-[var(--admin-sidebar-w)]">
        <AdminTopbar onOpenSearch={() => palette.setOpen(true)} onOpenMenu={() => setNavOpen(true)} />
        <main className="flex-1 px-4 pb-[calc(4.75rem+env(safe-area-inset-bottom))] pt-5 sm:px-6 lg:pb-10">
          <div className="mx-auto max-w-[1600px]">
            {hideBreadcrumbs ? null : <AdminBreadcrumbs />}
            {children}
          </div>
        </main>
      </div>
      <AdminMobileDock onOpenMenu={() => setMoreOpen(true)} />
      <AdminMobileMoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
      <AdminMobileNavSheet open={navOpen} onClose={() => setNavOpen(false)} />
      <AdminCommandPalette open={palette.open} onClose={palette.close} />
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <AdminPreferencesProvider>
      <AdminUnreadOrdersProvider>
        <AdminPendingCreatorApplicationsProvider>
          <AdminShellInner>{children}</AdminShellInner>
        </AdminPendingCreatorApplicationsProvider>
      </AdminUnreadOrdersProvider>
    </AdminPreferencesProvider>
  );
}
