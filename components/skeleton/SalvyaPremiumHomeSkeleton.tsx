import {
  SkCircleDark,
  SkFieldDark,
  SkHeaderBarDark,
  SkKicker,
  SkLineDark,
  SkShellDark,
} from "@/components/skeleton/SalvyaSkeletonPrimitives";

/** Homepage-specific skeleton — hero + stories rail + featured band. */
export function SalvyaPremiumHomeSkeleton() {
  return (
    <SkShellDark>
      <SkHeaderBarDark showMenuSlot />
      <div className="pb-28 pt-[calc(4.75rem+env(safe-area-inset-top))]">
        <div className="relative min-h-[32vh] px-5 pb-8">
          <SkKicker className="mb-3" />
          <SkLineDark className="h-8 w-[88%] max-w-[280px]" />
          <SkLineDark className="mt-3 h-3 w-[70%] max-w-[220px] opacity-70" />
          <div className="mt-8 flex gap-2">
            <SkFieldDark className="h-10 w-36 rounded-full" />
            <SkFieldDark className="h-10 w-32 rounded-full opacity-80" />
          </div>
          <SkFieldDark className="absolute right-0 bottom-0 left-0 -z-[1] mx-auto mt-8 min-h-[28vh] w-[120%] max-w-none rounded-none opacity-40" />
        </div>
        <div className="border-t border-white/[0.05] px-5 py-8">
          <SkKicker className="mb-2 w-20" />
          <SkLineDark className="h-6 w-32" />
          <div className="mt-6 flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex w-[88px] shrink-0 flex-col items-center gap-2">
                <SkCircleDark className="size-[76px] border-2 border-white/10" />
                <SkLineDark className="h-2 w-14 opacity-70" />
              </div>
            ))}
          </div>
        </div>
        <div className="px-4 py-6">
          <SkFieldDark className="mx-auto min-h-[220px] max-w-md rounded-[1.75rem]" />
        </div>
        <div className="py-2">
          <SkFieldDark className="h-10 w-full rounded-none border-x-0 opacity-90" />
        </div>
        <div className="px-5 py-6">
          <div className="flex gap-3 overflow-hidden">
            <SkFieldDark className="h-64 min-w-[200px] flex-1 rounded-3xl" />
            <SkFieldDark className="h-64 min-w-[200px] flex-1 rounded-3xl opacity-90" />
          </div>
        </div>
      </div>
    </SkShellDark>
  );
}
