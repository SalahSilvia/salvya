"use client";

import { usePathname } from "next/navigation";
import { AdminNavIconGlyph } from "@/components/admin/AdminNavIcon";
import { AdminNavLink } from "@/components/admin/AdminNavLink";
import { ADMIN_MOBILE_DOCK, adminMobileMoreGroups, isAdminNavActive } from "@/components/admin/nav-config";

type Props = {
  onOpenMenu: () => void;
};

export function AdminMobileDock({ onOpenMenu }: Props) {
  const pathname = usePathname() ?? "";
  const moreItems = adminMobileMoreGroups().flatMap((group) => group.items);
  const menuActive = moreItems.some((item) => isAdminNavActive(pathname, item.href));

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[#e3e5e7] bg-white px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] lg:hidden"
      aria-label="Admin quick navigation"
    >
      <div className="mx-auto flex max-w-lg items-stretch gap-0.5">
        {ADMIN_MOBILE_DOCK.map((item) => (
          <AdminNavLink key={item.href} item={item} pathname={pathname} variant="dock" />
        ))}
        <button
          type="button"
          onClick={onOpenMenu}
          className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-semibold transition-colors ${
            menuActive ? "text-[#2D6BFF]" : "text-[#6d7175]"
          }`}
        >
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${
              menuActive ? "bg-[#eef4ff] text-[#2D6BFF]" : "text-[#8c9196]"
            }`}
          >
            <AdminNavIconGlyph name="menu" className="h-5 w-5" />
          </span>
          <span>More</span>
        </button>
      </div>
    </nav>
  );
}
