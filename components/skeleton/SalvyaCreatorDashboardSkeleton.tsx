import { SkFieldDark, SkKicker, SkLineDark } from "@/components/skeleton/SalvyaSkeletonPrimitives";
import { SalvyaLoadingMark } from "@/components/loading/SalvyaLoadingMark";

/** In-page dashboard loading — fits inside CreatorStudioShell (no full-page shell). */
export function SalvyaCreatorDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 lg:hidden">
        <SalvyaLoadingMark variant="creator" size="sm" />
        <SkLineDark className="h-4 w-32" />
      </div>

      <SkFieldDark className="h-64 rounded-[1.65rem] border-violet-500/15 bg-gradient-to-br from-violet-600/10 via-[#0a0612] to-transparent p-6 sm:h-72">
        <SkKicker className="w-24 bg-fuchsia-400/12" />
        <SkLineDark className="mt-5 h-8 w-2/3 max-w-sm" />
        <SkLineDark className="mt-3 h-4 w-full max-w-md" />
      </SkFieldDark>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <SkFieldDark key={i} className="h-36 rounded-2xl p-4">
            <SkKicker className="w-16" />
            <SkLineDark className="mt-4 h-7 w-20" />
          </SkFieldDark>
        ))}
      </div>

      <SkFieldDark className="h-44 rounded-2xl p-5">
        <SkKicker className="w-28" />
        <div className="mt-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <SkLineDark key={i} className="h-9 w-full" />
          ))}
        </div>
      </SkFieldDark>
    </div>
  );
}
