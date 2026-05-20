import {
  SkFieldDark,
  SkHeaderBarDark,
  SkKicker,
  SkLineDark,
  SkShellDark,
} from "./SalvyaSkeletonPrimitives";

export function SalvyaSearchSkeleton() {
  return (
    <SkShellDark>
      <SkHeaderBarDark showMenuSlot={false} />
      <div className="flex min-h-0 flex-1 flex-col pt-[calc(3.25rem+env(safe-area-inset-top))]">
        <header className="sticky top-[calc(3.25rem+env(safe-area-inset-top))] z-10 border-b border-white/[0.06] bg-[#050508]/85 px-4 py-4 backdrop-blur-xl sm:px-6">
          <SkLineDark className="mb-2 h-7 w-40" />
          <SkLineDark className="mb-4 h-3 w-64 opacity-70" />
          <SkFieldDark className="h-[52px] w-full rounded-full" />
        </header>
        <div className="mx-auto w-full max-w-lg flex-1 space-y-8 px-4 py-6 sm:px-6">
          <section>
            <SkKicker className="mb-3" />
            <ul className="flex flex-col gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <li key={i}>
                  <SkFieldDark className="h-[48px] w-full rounded-xl" />
                </li>
              ))}
            </ul>
          </section>
          <section>
            <SkKicker className="mb-3 w-20" />
            <ul className="flex flex-col gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <li key={i}>
                  <SkFieldDark className="min-h-[52px] w-full rounded-xl px-0 py-0" />
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </SkShellDark>
  );
}
