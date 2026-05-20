import { SkFieldDark, SkLineDark } from "./SalvyaSkeletonPrimitives";

export function SalvyaMemberOrdersSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <ul className="mt-4 space-y-2.5" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i}>
          <SkFieldDark className="flex min-h-[52px] items-center gap-3 rounded-2xl px-3 py-2.5">
            <div className="size-10 shrink-0 rounded-xl bg-white/[0.06]" />
            <div className="min-w-0 flex-1 space-y-2">
              <SkLineDark className="h-3 w-[55%]" />
              <SkLineDark className="h-2.5 w-[40%] opacity-60" />
            </div>
          </SkFieldDark>
        </li>
      ))}
    </ul>
  );
}
