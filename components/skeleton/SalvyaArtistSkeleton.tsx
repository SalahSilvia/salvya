import { SkCircleDark, SkFieldDark, SkHeaderBarDark, SkKicker, SkLineDark, SkShellDark } from "./SalvyaSkeletonPrimitives";

/** Artist storefront — cover, identity, product masonry hint. */
export function SalvyaArtistSkeleton() {
  return (
    <SkShellDark>
      <SkHeaderBarDark showMenuSlot />
      <main className="pb-24 pt-[calc(3.25rem+env(safe-area-inset-top))]">
        <SkFieldDark className="mx-auto aspect-[16/10] w-full max-w-md rounded-b-[1.75rem] border-x-0 border-t-0" />
        <div className="relative z-[1] mx-auto -mt-10 flex max-w-md flex-col items-center px-4">
          <SkCircleDark className="size-24 border-2 border-[#050508] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.75)]" />
          <SkLineDark className="mt-4 h-5 w-48" />
          <SkLineDark className="mt-2 h-3 w-32 opacity-65" />
        </div>
        <div className="mx-auto mt-10 grid max-w-md grid-cols-2 gap-3 px-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkFieldDark key={i} className="aspect-[3/4] rounded-2xl" />
          ))}
        </div>
        <div className="mx-auto mt-10 max-w-md px-4">
          <SkKicker className="mb-4" />
          <div className="flex gap-3 overflow-hidden">
            <SkFieldDark className="h-36 min-w-[44%] flex-1 rounded-2xl" />
            <SkFieldDark className="h-36 min-w-[44%] flex-1 rounded-2xl opacity-90" />
          </div>
        </div>
      </main>
    </SkShellDark>
  );
}
