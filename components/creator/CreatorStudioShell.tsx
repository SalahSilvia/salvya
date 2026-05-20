"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreatorMobileDock } from "@/components/creator/CreatorMobileDock";
import { CreatorStudioHeader } from "@/components/creator/CreatorStudioHeader";
import { CreatorStudioNavIcon } from "@/components/creator/CreatorStudioNavIcons";
import { CREATOR_STUDIO_NAV, matchCreatorStudioNav } from "@/lib/creator/studio-nav";

type Props = {
  children: React.ReactNode;
  onOpenCommand: () => void;
};

export function CreatorStudioShell({ children, onOpenCommand }: Props) {
  const pathname = usePathname();
  const path = pathname?.replace(/^\/(en|fr|es|it|nl|ar)/, "") ?? "";

  return (
    <div className="min-h-dvh bg-[#07040c] text-white">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_70%_50%_at_0%_0%,rgba(168,85,247,0.2),transparent_50%),radial-gradient(ellipse_50%_40%_at_100%_100%,rgba(236,72,153,0.12),transparent_45%)]"
      />

      <CreatorStudioHeader
        className="sticky top-0 z-30 pt-[env(safe-area-inset-top)]"
        onOpenCommand={onOpenCommand}
      />

      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col lg:flex-row">
        <aside className="hidden border-white/[0.08] lg:block lg:w-52 lg:shrink-0 lg:border-r lg:px-3 lg:py-6">
          <nav className="space-y-0.5">
            {CREATOR_STUDIO_NAV.map((item) => {
              const active = matchCreatorStudioNav(path, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-colors ${
                    active
                      ? "bg-gradient-to-r from-violet-500/22 to-fuchsia-500/12 text-fuchsia-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                      : "text-white/50 hover:bg-white/[0.05] hover:text-white/85"
                  }`}
                >
                  <CreatorStudioNavIcon id={item.id} active={active} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 px-4 pb-[calc(6.25rem+env(safe-area-inset-bottom))] pt-6 sm:px-6 lg:pb-10 lg:pt-8">
          {children}
        </main>
      </div>

      <CreatorMobileDock />
    </div>
  );
}
