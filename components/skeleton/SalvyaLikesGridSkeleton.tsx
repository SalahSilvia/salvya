import { SkFieldDark, SkHeaderBarDark, SkShellDark } from "./SalvyaSkeletonPrimitives";

export function SalvyaLikesGridSkeleton() {
  return (
    <SkShellDark>
      <SkHeaderBarDark showMenuSlot={false} />
      <div className="px-4 pb-28 pt-[calc(4.5rem+env(safe-area-inset-top))] sm:px-6">
        <div className="mx-auto mb-6 max-w-md">
          <SkFieldDark className="h-7 w-40 rounded-md" />
        </div>
        <div className="mx-auto grid max-w-md grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <SkFieldDark key={i} className="aspect-[3/4] rounded-2xl" />
          ))}
        </div>
      </div>
    </SkShellDark>
  );
}
