import { SkFieldDark, SkHeaderBarDark, SkKicker, SkLineDark, SkShellDark } from "./SalvyaSkeletonPrimitives";

export function SalvyaCheckoutSkeleton() {
  return (
    <SkShellDark>
      <SkHeaderBarDark showMenuSlot />
      <div className="mx-auto grid max-w-lg gap-6 px-4 pb-28 pt-[calc(4rem+env(safe-area-inset-top))] sm:px-6 lg:max-w-4xl lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <SkKicker className="mb-3" />
          <SkLineDark className="mb-6 h-6 w-48" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkFieldDark key={i} className="h-[56px] rounded-2xl" />
            ))}
          </div>
        </div>
        <div className="lg:pt-8">
          <SkFieldDark className="min-h-[220px] rounded-[1.35rem] p-4">
            <SkKicker className="mb-4 w-20" />
            <SkLineDark className="mb-2 h-3 w-full" />
            <SkLineDark className="mb-2 h-3 w-[90%]" />
            <SkLineDark className="mb-6 h-3 w-[70%]" />
            <div className="h-12 w-full rounded-xl bg-white/[0.06] ring-1 ring-white/[0.05]" />
          </SkFieldDark>
        </div>
      </div>
    </SkShellDark>
  );
}
