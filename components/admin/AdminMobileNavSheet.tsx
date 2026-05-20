"use client";

import Link from "next/link";
import { SalvyaLogoImage } from "@/components/brand/SalvyaLogoImage";
import { AdminAccountMenu } from "@/components/admin/AdminAccountMenu";
import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function AdminMobileNavSheet({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <>
      <button type="button" className="fixed inset-0 z-[55] bg-black/25 lg:hidden" aria-label="Close menu" onClick={onClose} />
      <aside
        className="fixed inset-y-0 left-0 z-[60] flex w-[min(18rem,88vw)] flex-col border-r border-[#e3e5e7] bg-white pt-[env(safe-area-inset-top)] shadow-xl lg:hidden"
        role="dialog"
        aria-label="Admin navigation"
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#e3e5e7] px-4">
          <Link href="/admin/overview" onClick={onClose} className="flex min-w-0 items-center gap-2">
            <SalvyaLogoImage
              variant="dark"
              alt="Salvya"
              fallback="word"
              className="h-6 w-auto max-w-[6.5rem] object-contain object-left"
              fallbackClassName="text-[14px] font-semibold text-[#202223]"
            />
            <span className="text-[11px] font-medium text-[#6d7175]">Admin</span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-[13px] font-medium text-[#6d7175] hover:bg-[#f6f6f7]"
          >
            Close
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
          <AdminSidebarNav onNavigate={onClose} />
        </div>

        <div className="shrink-0 border-t border-[#e3e5e7] px-3 py-3">
          <AdminAccountMenu variant="sidebar" />
        </div>
      </aside>
    </>
  );
}
