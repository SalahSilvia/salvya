"use client";

import type { HelpTabId } from "@/lib/help-center/types";
import { HELP_TAB_META } from "@/lib/help-center";
import { helpTouchScrollClass } from "@/components/help/HelpCenterUi";

type Props = {
  tab: HelpTabId;
  onTabChange: (id: HelpTabId) => void;
};

/** Sticky category tabs — hidden scrollbar, finger swipe on mobile. */
export function HelpCategoryTabs({ tab, onTabChange }: Props) {
  return (
    <div className="relative border-t border-neutral-100/90 bg-white/90">
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-8 bg-gradient-to-l from-white to-transparent sm:w-12"
        aria-hidden
      />
      <div
        className={`mx-auto max-w-6xl px-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] ${helpTouchScrollClass} snap-x snap-mandatory scroll-pl-4 scroll-pr-8`}
      >
        <div className="flex w-max min-w-full gap-1.5 py-2.5" role="tablist" aria-label="Help center categories">
          {HELP_TAB_META.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onTabChange(t.id)}
                className={`shrink-0 snap-start rounded-full border px-3.5 py-2 text-[12px] font-semibold transition-colors sm:py-1.5 ${
                  active
                    ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                    : "border-neutral-200/90 bg-white text-neutral-600 hover:border-blue-200 hover:text-neutral-900"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
      <p className="sr-only">Swipe horizontally to see more categories</p>
    </div>
  );
}
