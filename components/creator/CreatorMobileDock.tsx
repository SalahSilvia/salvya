"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreatorStudioNavIcon } from "@/components/creator/CreatorStudioNavIcons";
import { CREATOR_STUDIO_MOBILE_NAV, matchCreatorStudioNav } from "@/lib/creator/studio-nav";

const tabBase =
  "relative flex min-h-[50px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-[0.85rem] px-0.5 py-1.5 text-[10px] font-semibold tracking-tight transition-[color,transform] duration-200 active:scale-[0.97]";

/** Floating bottom tab bar for Creator Workspace on phone / tablet portrait. */
export function CreatorMobileDock() {
  const pathname = usePathname();
  const path = pathname?.replace(/^\/(en|fr|es|it|nl|ar)/, "") ?? "";

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-2.5 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-2 lg:hidden"
      aria-label="Creator workspace"
    >
      <div className="pointer-events-auto mx-auto max-w-lg rounded-[1.5rem] border border-violet-400/20 bg-[#08050e]/88 p-1.5 shadow-[0_16px_56px_-12px_rgba(0,0,0,0.85),0_0_48px_-14px_rgba(168,85,247,0.35),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl backdrop-saturate-[1.4] ring-1 ring-fuchsia-400/10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-300/35 to-transparent"
        />
        <div className="flex items-stretch gap-0.5">
          {CREATOR_STUDIO_MOBILE_NAV.map((item) => {
            const active = matchCreatorStudioNav(path, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className={`${tabBase} ${active ? "text-fuchsia-100" : "text-white/42"}`}
                aria-current={active ? "page" : undefined}
              >
                {active ? (
                  <span
                    className="absolute inset-0 rounded-[0.85rem] bg-gradient-to-b from-violet-500/28 via-fuchsia-500/16 to-fuchsia-500/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_28px_-6px_rgba(217,70,239,0.55)]"
                    aria-hidden
                  />
                ) : null}
                <span className="relative z-[1] flex flex-col items-center gap-1">
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-xl ${
                      active ? "text-fuchsia-100" : "text-white/55"
                    }`}
                  >
                    <CreatorStudioNavIcon id={item.id} active={active} />
                  </span>
                  <span className="max-w-[4.5rem] truncate">{item.shortLabel}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
