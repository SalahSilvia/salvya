import { SkBlogCard } from "./SalvyaSkeletonBlocks";
import { SkFieldDark, SkHeaderBarDark, SkKicker, SkLineDark, SkShellDark } from "./SalvyaSkeletonPrimitives";

/** Blog index — hero + search + card grid. */
export function SalvyaBlogIndexSkeleton() {
  return (
    <SkShellDark>
      <SkHeaderBarDark showMenuSlot />
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-[calc(4.5rem+env(safe-area-inset-top))] sm:px-6">
        <SkKicker className="mb-3" />
        <SkLineDark className="h-9 w-[min(18rem,70%)]" />
        <SkLineDark className="mt-3 h-4 w-[min(24rem,90%)] opacity-70" />
        <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkFieldDark key={i} className="h-[72px] rounded-2xl" />
          ))}
        </div>
        <SkFieldDark className="mt-8 h-12 w-full rounded-xl" />
        <SkFieldDark className="mt-10 aspect-[21/9] w-full rounded-[1.35rem]" />
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkBlogCard key={i} />
          ))}
        </div>
      </div>
    </SkShellDark>
  );
}

/** Single article — cover, title block, body lines. */
export function SalvyaBlogArticleSkeleton() {
  return (
    <SkShellDark>
      <SkHeaderBarDark showMenuSlot />
      <div className="mx-auto max-w-3xl px-4 pb-24 pt-[calc(4.5rem+env(safe-area-inset-top))] sm:px-6">
        <SkLineDark className="h-4 w-24" />
        <div className="mt-8 flex flex-wrap gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkKicker key={i} className="w-16" />
          ))}
        </div>
        <SkLineDark className="mt-6 h-10 w-full" />
        <SkLineDark className="mt-3 h-10 w-[88%]" />
        <SkLineDark className="mt-4 h-4 w-40 opacity-60" />
        <SkFieldDark className="mt-10 aspect-[16/9] w-full rounded-2xl" />
        <div className="mt-10 space-y-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkLineDark key={i} className="h-3.5 w-full" style={{ width: i % 4 === 3 ? "72%" : undefined }} />
          ))}
        </div>
      </div>
    </SkShellDark>
  );
}
