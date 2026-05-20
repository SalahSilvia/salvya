"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
import { AdminNavIconGlyph } from "@/components/admin/AdminNavIcon";
import { AdminNavLink } from "@/components/admin/AdminNavLink";
import { adminBtnSecondary } from "@/components/admin/admin-theme";
import { adminMobileMoreGroups } from "@/components/admin/nav-config";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function AdminMobileMoreSheet({ open, onClose }: Props) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const groups = adminMobileMoreGroups();

  const signOut = useCallback(async () => {
    const sb = getSupabaseBrowserClient();
    await sb?.auth.signOut();
    onClose();
    router.replace("/login");
    router.refresh();
  }, [onClose, router]);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[55] bg-black/25 backdrop-blur-[2px] lg:hidden"
        aria-label="Close menu"
        onClick={onClose}
      />
      <div
        className="fixed inset-x-0 bottom-0 z-[60] max-h-[min(72vh,32rem)] overflow-y-auto rounded-t-2xl border border-[#e3e5e7] bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_40px_rgba(0,0,0,0.12)] lg:hidden"
        role="dialog"
        aria-label="More admin destinations"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#c9cccf]" aria-hidden />
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8c9196]">More destinations</p>
        {groups.map((group) => (
          <div key={group.id} className="mb-4">
            <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8c9196]">{group.label}</p>
            <nav className="space-y-0.5" aria-label={group.label}>
              {group.items.map((item) => (
                <AdminNavLink key={item.href} item={item} pathname={pathname} variant="sheet" onNavigate={onClose} />
              ))}
            </nav>
          </div>
        ))}
        <div className="sticky bottom-0 space-y-2 border-t border-[#e3e5e7] bg-white pt-3">
          <Link href="/shop" prefetch={false} onClick={onClose} className={`flex w-full ${adminBtnSecondary}`}>
            <AdminNavIconGlyph name="store" className="mr-2 h-4 w-4" />
            View shop
          </Link>
          <button
            type="button"
            onClick={() => void signOut()}
            className="w-full rounded-lg px-3 py-2.5 text-[13px] font-medium text-[#6d7175] transition-colors hover:bg-[#f6f6f7]"
          >
            Sign out
          </button>
        </div>
      </div>
    </>
  );
}
