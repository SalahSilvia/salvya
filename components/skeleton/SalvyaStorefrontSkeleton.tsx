import {
  SkCircleDark,
  SkFieldDark,
  SkHeaderBarDark,
  SkKicker,
  SkLineDark,
  SkShellDark,
  cx,
} from "./SalvyaSkeletonPrimitives";

function SkProductBand({ wideLeft }: { wideLeft?: boolean }) {
  return (
    <section className="px-4 py-8">
      <div className="mx-auto max-w-md">
        <SkKicker className="mb-5" />
        <div className={cx("flex gap-3", wideLeft ? "flex-col sm:flex-row" : "")}>
          <SkFieldDark
            className={cx(
              "min-h-[168px] flex-1 rounded-[1.25rem]",
              wideLeft ? "sm:min-h-[200px] sm:basis-[58%]" : "min-h-[140px]",
            )}
          />
          <div className="flex flex-1 flex-col gap-3">
            <SkFieldDark className="h-[72px] rounded-xl" />
            <SkFieldDark className="h-[72px] rounded-xl opacity-90" />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Home / shop Vol.1 — hero, creator rail, commerce bands. */
export function SalvyaStorefrontSkeleton({ showHeaderMenu = true }: { showHeaderMenu?: boolean }) {
  return (
    <SkShellDark>
      <SkHeaderBarDark showMenuSlot={showHeaderMenu} />
      <main className="pb-16 pt-[calc(3.25rem+env(safe-area-inset-top))]">
        <div className="relative mx-auto max-w-md px-1">
          <SkFieldDark className="min-h-[56vh] w-full max-h-[480px] rounded-b-[2rem] border-x-0 border-t-0 border-white/[0.08] shadow-[0_24px_80px_-32px_rgba(0,0,0,0.75)]">
            <div className="absolute bottom-8 left-6 right-6 space-y-3">
              <SkLineDark className="h-4 w-[72%] max-w-[280px]" />
              <SkLineDark className="h-3 w-[48%] max-w-[200px] opacity-80" />
              <div className="flex gap-2 pt-2">
                <SkFieldDark className="h-10 w-28 rounded-full" />
                <SkFieldDark className="h-10 w-24 rounded-full opacity-75" />
              </div>
            </div>
          </SkFieldDark>
        </div>

        <section className="mt-10 px-6" aria-hidden>
          <div className="mx-auto flex max-w-md justify-center gap-5 py-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <SkCircleDark className="size-[72px] shadow-[0_12px_40px_-12px_rgba(0,0,0,0.55)]" />
                <SkLineDark className="h-2 w-12 opacity-70" />
              </div>
            ))}
          </div>
        </section>

        <SkProductBand wideLeft />
        <SkProductBand />
        <div className="h-6" />
      </main>
    </SkShellDark>
  );
}
