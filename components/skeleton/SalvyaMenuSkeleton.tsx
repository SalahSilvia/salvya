import { SkCircleDark, SkFieldDark, SkHeaderBarDark, SkLineDark, SkShellDark } from "./SalvyaSkeletonPrimitives";

export function SalvyaMenuSkeleton() {
  return (
    <SkShellDark>
      <SkHeaderBarDark showMenuSlot={false} />
      <div className="flex flex-col px-4 pb-28 pt-[calc(4rem+env(safe-area-inset-top))] sm:px-6">
        <div className="mx-auto flex w-full max-w-md flex-col items-center">
          <SkCircleDark className="size-20 shadow-[0_16px_48px_-16px_rgba(0,0,0,0.6)]" />
          <SkLineDark className="mt-4 h-4 w-40" />
          <SkLineDark className="mt-2 h-3 w-28 opacity-70" />
        </div>
        <div className="mx-auto mt-10 w-full max-w-md space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkFieldDark key={i} className="h-[52px] w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </SkShellDark>
  );
}
