"use client";

import Link from "next/link";
import { SalvyaLogoImage } from "@/components/brand/SalvyaLogoImage";
import { AdminAccountMenu } from "@/components/admin/AdminAccountMenu";
import { useAdminPreferences } from "@/components/admin/AdminPreferencesProvider";
import { AdminProBadge } from "@/components/admin/AdminProBadge";
import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";

export function AdminProSidebar() {
  const { compactNav, isGodAdmin } = useAdminPreferences();

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 hidden w-[var(--admin-sidebar-w,15.5rem)] flex-col border-r border-[#e3e5e7] bg-white pt-[env(safe-area-inset-top)] lg:flex"
      aria-label="Admin navigation"
    >
      <div className={`flex h-14 shrink-0 items-center border-b border-[#e3e5e7] ${compactNav ? "justify-center px-2" : "gap-2.5 px-4"}`}>
        <Link href="/admin/overview" className={`flex min-w-0 items-center ${compactNav ? "" : "gap-2.5"}`} title="Admin overview">
          <SalvyaLogoImage
            variant="dark"
            alt="Salvya"
            fallback="word"
            className={`shrink-0 object-contain object-left ${compactNav ? "h-6 w-6" : "h-7 w-auto max-w-[7.5rem]"}`}
            fallbackClassName="text-[15px] font-semibold tracking-tight text-[#202223]"
          />
          {compactNav ? null : (
            <span className="min-w-0 border-l border-[#e3e5e7] pl-2.5">
              <span className="block text-[11px] font-medium text-[#6d7175]">Admin</span>
            </span>
          )}
        </Link>
      </div>

      {isGodAdmin ? (
        <div className={`shrink-0 border-b border-violet-100 bg-gradient-to-r from-violet-50/80 to-[#eef4ff]/50 ${compactNav ? "px-1.5 py-2" : "px-3 py-2.5"}`}>
          <Link
            href="/admin/god"
            title="God Admin"
            className={`flex items-center justify-center rounded-lg border border-violet-200 bg-white text-violet-900 shadow-sm transition-colors hover:bg-violet-50 ${
              compactNav ? "p-2.5 text-base" : "gap-2 px-3 py-2 text-[12px] font-semibold"
            }`}
          >
            <span aria-hidden>✦</span>
            {compactNav ? null : <span>God Admin</span>}
          </Link>
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        <AdminSidebarNav compact={compactNav} />
      </div>

      <div className={`shrink-0 border-t border-[#e3e5e7] ${compactNav ? "px-1.5 py-2" : "px-3 py-3"}`}>
        <AdminAccountMenu variant="sidebar" />
      </div>

      {compactNav ? null : (
        <div className="shrink-0 border-t border-[#e3e5e7] p-4">
          <AdminProBadge />
        </div>
      )}
    </aside>
  );
}
