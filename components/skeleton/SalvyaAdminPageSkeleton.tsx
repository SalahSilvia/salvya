import { SkChartPanel, SkTableRows } from "./SalvyaSkeletonBlocks";
import { SkKickerLight, SkLineLight, SkShellLight } from "./SalvyaSkeletonPrimitives";

type Variant = "overview" | "table" | "form";

export function SalvyaAdminPageSkeleton({ variant = "overview" }: { variant?: Variant }) {
  return (
    <SkShellLight className="bg-[#f6f6f7] text-[#202223]">
      <div className="flex min-h-dvh">
        <aside className="hidden w-[15.5rem] shrink-0 border-r border-[#e3e5e7] bg-white lg:block">
          <div className="border-b border-[#e3e5e7] px-4 py-5">
            <div className="h-6 w-24 rounded-lg bg-[#e3e5e7]/70 salvya-sk-sheen-light salvya-sk-breathe-light" />
          </div>
          <div className="space-y-1 p-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-9 rounded-lg bg-[#e3e5e7]/40 salvya-sk-sheen-light salvya-sk-breathe-light" />
            ))}
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <div className="flex h-14 items-center gap-3 border-b border-[#e3e5e7] bg-white px-4 sm:px-6">
            <div className="h-8 w-8 rounded-lg bg-[#e3e5e7]/60 lg:hidden salvya-sk-sheen-light salvya-sk-breathe-light" />
            <SkLineLight className="h-4 w-40" />
            <div className="ml-auto h-9 w-28 rounded-lg bg-[#e3e5e7]/50 salvya-sk-sheen-light salvya-sk-breathe-light" />
          </div>
          <main className="px-4 py-5 sm:px-6">
            <div className="mx-auto max-w-[1600px] space-y-5">
              <SkKickerLight className="w-28" />
              <SkLineLight className="h-7 w-48" />
              {variant === "overview" ? <SkChartPanel /> : null}
              {variant === "table" ? <SkTableRows rows={8} cols={5} /> : null}
              {variant === "form" ? (
                <div className="max-w-2xl space-y-4 rounded-xl border border-[#e3e5e7] bg-white p-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-2.5 w-24 rounded-full bg-[#e3e5e7]/70 salvya-sk-sheen-light salvya-sk-breathe-light" />
                      <div className="h-11 w-full rounded-lg bg-[#e3e5e7]/45 salvya-sk-sheen-light salvya-sk-breathe-light" />
                    </div>
                  ))}
                </div>
              ) : null}
              {variant === "overview" ? <SkTableRows rows={5} cols={4} className="mt-2" /> : null}
            </div>
          </main>
        </div>
      </div>
    </SkShellLight>
  );
}
