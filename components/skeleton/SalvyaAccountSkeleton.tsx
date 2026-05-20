import { SkCircleDark, SkFieldDark, SkHeaderBarDark, SkLineDark, SkShellDark } from "./SalvyaSkeletonPrimitives";

export function SalvyaAccountSkeleton() {
  return (
    <SkShellDark>
      <SkHeaderBarDark showMenuSlot />
      <div className="mx-auto max-w-md px-4 pb-28 pt-[calc(4.5rem+env(safe-area-inset-top))] sm:px-6">
        <div className="flex flex-col items-center">
          <SkCircleDark className="size-24" />
          <SkLineDark className="mt-4 h-5 w-44" />
          <SkLineDark className="mt-2 h-3 w-36 opacity-65" />
        </div>
        <div className="mt-10 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkFieldDark key={i} className="h-[56px] w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </SkShellDark>
  );
}
