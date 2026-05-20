"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MainNavTabIcon } from "@/components/navigation/MainNavIcons";
import { useBag } from "@/components/cart/BagProvider";
import { useSessionRole } from "@/components/member/useSessionRole";
import { mainNavTabsForRole } from "@/lib/navigation/main-nav-config";
import { NotificationsHeaderLink } from "@/components/shop/NotificationsHeaderLink";
import { ProfileHeaderLink } from "@/components/shop/ProfileHeaderLink";
import { PreviewBagHeaderLink } from "@/components/shop/PreviewBagHeaderLink";

const utilBtn =
  "flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.05] text-white/90 transition-colors hover:border-white/[0.16] hover:bg-white/[0.08] hover:text-white";

/** Center tabs + right utilities — shared by storefront desktop nav and creator store header. */
export function DesktopMainNavContent() {
  const pathname = usePathname() ?? "/";
  const role = useSessionRole();
  const { totalQty } = useBag();
  const tabs = mainNavTabsForRole(role, "desktop");
  const isAdmin = role === "admin";
  const isGuest = role === null;

  return (
    <>
      <nav className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 md:flex lg:gap-1">
        {tabs.map((tab) => {
          const active = tab.match(pathname);
          const isBag = tab.id === "bag";
          return (
            <Link
              key={tab.id}
              href={tab.href}
              prefetch={false}
              className={`relative inline-flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-semibold transition-colors lg:px-3.5 lg:text-[14px] ${
                active
                  ? "bg-[#2D6BFF]/16 text-white shadow-[inset_0_0_0_1px_rgba(45,107,255,0.35)]"
                  : "text-white/50 hover:bg-white/[0.05] hover:text-white/88"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <MainNavTabIcon id={tab.id} active={active} isAdmin={isAdmin} />
              <span>{tab.label}</span>
              {isBag && totalQty > 0 ? (
                <span className="ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#2D6BFF] px-1 text-[10px] font-bold text-white tabular-nums">
                  {totalQty > 99 ? "99+" : totalQty}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="hidden shrink-0 items-center gap-2 md:flex">
        {isGuest ? null : <NotificationsHeaderLink className={utilBtn} />}
        <ProfileHeaderLink className={isGuest ? "" : utilBtn} />
        <PreviewBagHeaderLink className={utilBtn} />
      </div>
    </>
  );
}
