import {
  SkFieldDark,
  SkKicker,
  SkLineDark,
  SkShellDark,
} from "@/components/skeleton/SalvyaSkeletonPrimitives";
import { SalvyaLoadingMark } from "@/components/loading/SalvyaLoadingMark";

/** Creator Workspace route skeleton — violet/fuchsia dark shell with animated mark. */
export function SalvyaCreatorWorkspaceSkeleton() {
  return (
    <SkShellDark className="bg-[#07040c]">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_70%_50%_at_0%_0%,rgba(168,85,247,0.18),transparent_50%),radial-gradient(ellipse_50%_40%_at_100%_100%,rgba(236,72,153,0.1),transparent_45%)]"
      />

      <div className="mx-auto max-w-6xl px-4 pb-24 pt-[calc(5.5rem+env(safe-area-inset-top))] sm:px-6 lg:pb-10 lg:pt-8">
        <div className="mb-8 flex items-center gap-4 lg:hidden">
          <SalvyaLoadingMark variant="creator" size="sm" />
          <div className="space-y-2">
            <SkKicker className="w-20 bg-fuchsia-400/15 ring-fuchsia-400/10" />
            <SkLineDark className="h-4 w-36" />
          </div>
        </div>

        <SkFieldDark className="mb-6 h-56 rounded-[1.65rem] border-violet-500/15 bg-gradient-to-br from-violet-600/12 via-[#0a0612] to-[#07040c] p-6 sm:h-64">
          <SkKicker className="w-28 bg-fuchsia-400/12 ring-fuchsia-400/10" />
          <SkLineDark className="mt-5 h-8 w-2/3 max-w-md" />
          <SkLineDark className="mt-3 h-4 w-full max-w-lg" />
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <SkFieldDark key={i} className="h-16 rounded-xl border-white/[0.06] bg-black/25" />
            ))}
          </div>
        </SkFieldDark>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <SkFieldDark key={i} className="h-36 rounded-2xl border-white/[0.06] p-4">
              <SkKicker className="w-16" />
              <SkLineDark className="mt-4 h-7 w-24" />
              <SkLineDark className="mt-2 h-3 w-32" />
            </SkFieldDark>
          ))}
        </div>

        <SkFieldDark className="mt-6 h-48 rounded-2xl border-white/[0.06] p-5">
          <SkKicker className="w-24" />
          <div className="mt-5 space-y-3">
            {[1, 2, 3].map((i) => (
              <SkLineDark key={i} className={`h-10 ${i === 2 ? "w-11/12" : "w-full"}`} />
            ))}
          </div>
        </SkFieldDark>
      </div>
    </SkShellDark>
  );
}
