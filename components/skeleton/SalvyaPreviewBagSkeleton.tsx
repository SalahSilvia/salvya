import { SkFieldDark, SkHeaderBarDark, SkKicker, SkLineDark, SkShellDark } from "./SalvyaSkeletonPrimitives";

export function SalvyaPreviewBagSkeleton() {
  return (
    <SkShellDark>
      <SkHeaderBarDark showMenuSlot />
      <div className="mx-auto max-w-md px-4 pb-28 pt-[calc(4.5rem+env(safe-area-inset-top))] sm:px-6">
        <SkLineDark className="mb-2 h-7 w-32" />
        <SkLineDark className="mb-8 h-3 w-48 opacity-70" />
        <ul className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="flex gap-3">
              <SkFieldDark className="size-[88px] shrink-0 rounded-2xl" />
              <div className="min-w-0 flex-1 space-y-2 pt-1">
                <SkLineDark className="h-3.5 w-[85%]" />
                <SkLineDark className="h-3 w-[50%] opacity-70" />
                <SkKicker className="mt-2 w-16" />
              </div>
            </li>
          ))}
        </ul>
        <SkFieldDark className="mt-10 min-h-[140px] rounded-[1.25rem] p-4">
          <SkKicker className="mb-4 w-24" />
          <SkLineDark className="h-3 w-full" />
          <SkLineDark className="mt-2 h-3 w-[70%]" />
        </SkFieldDark>
      </div>
    </SkShellDark>
  );
}
