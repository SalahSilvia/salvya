"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useBag } from "@/components/cart/BagProvider";
import { MainNavTabIcon } from "@/components/navigation/MainNavIcons";
import { useSessionRole } from "@/components/member/useSessionRole";
import { mainNavTabsForRole } from "@/lib/navigation/main-nav-config";

const tabBase =
  "relative flex min-h-[48px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 py-1 text-[10px] font-semibold tracking-tight transition-[color,transform] duration-200 active:scale-[0.97]";

/** Phone / tablet portrait — bottom tab bar. */
export function MobileMainNav() {
  const pathname = usePathname() ?? "/";
  const t = useTranslations("nav");
  const role = useSessionRole();
  const { totalQty } = useBag();
  const tabs = mainNavTabsForRole(role, "mobile").map((tab) => ({
    ...tab,
    label: t(tab.id),
    shortLabel: t(tab.id),
  }));
  const isAdmin = role === "admin";

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[120] px-2 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-2 md:hidden"
      aria-label="Main navigation (mobile)"
    >
      <div className="pointer-events-auto mx-auto max-w-lg rounded-[1.45rem] border border-white/[0.12] bg-[#08080f]/82 p-1.5 shadow-[0_12px_48px_-10px_rgba(0,0,0,0.75),0_0_40px_-12px_rgba(45,107,255,0.14)] backdrop-blur-2xl backdrop-saturate-[1.35] ring-1 ring-white/[0.05]">
        <div className="flex items-stretch gap-0.5">
          {tabs.map((tab) => {
            const active = tab.match(pathname);
            const isBag = tab.id === "bag";
            const isAdminHome = tab.id === "home" && isAdmin;
            const activeSurface = isAdminHome
              ? "from-[#2D6BFF]/22 to-[#2D6BFF]/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_28px_-4px_rgba(45,107,255,0.5)]"
              : active
                ? "from-white/[0.14] to-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_24px_-4px_rgba(45,107,255,0.35)]"
                : "";

            return (
              <Link
                key={tab.id}
                href={tab.href}
                prefetch={false}
                className={`${tabBase} ${active ? "text-white" : "text-white/45"}`}
                aria-current={active ? "page" : undefined}
                aria-label={isBag && totalQty > 0 ? `${tab.label}, ${totalQty} items` : tab.label}
              >
                {active && activeSurface ? (
                  <span className={`absolute inset-0 rounded-[0.75rem] bg-gradient-to-b ${activeSurface}`} aria-hidden />
                ) : null}
                <span className="relative z-[1] flex flex-col items-center gap-0.5">
                  <span className="relative inline-flex">
                    <MainNavTabIcon id={tab.id} active={active} isAdmin={isAdmin} />
                    {isBag && totalQty > 0 ? (
                      <span className="absolute -right-2.5 -top-2 flex h-[1.1rem] min-w-[1.1rem] items-center justify-center rounded-full bg-[#2D6BFF] px-0.5 text-[9px] font-bold text-white ring-2 ring-[#08080f] tabular-nums">
                        {totalQty > 99 ? "99+" : totalQty}
                      </span>
                    ) : null}
                  </span>
                  <span className="max-w-[4.25rem] truncate">{tab.shortLabel}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
