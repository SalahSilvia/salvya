import { SkFieldLight, SkKickerLight, SkLineLight, SkShellLight } from "./SalvyaSkeletonPrimitives";

export function SalvyaHelpSkeleton() {
  return (
    <SkShellLight className="bg-[#fafbfd]">
      <div className="border-b border-neutral-200/80 bg-white/85 px-4 py-4 sm:px-6">
        <SkLineLight className="h-4 w-32" />
      </div>
      <div className="mx-auto max-w-6xl px-[max(1rem,env(safe-area-inset-left))] pb-28 pt-10 sm:px-6">
        <SkKickerLight className="mb-3 w-24" />
        <SkLineLight className="mb-2 h-9 w-64 sm:w-80" />
        <SkLineLight className="mb-8 h-4 w-full max-w-xl opacity-70" />
        <SkFieldLight className="mb-6 h-[56px] w-full max-w-2xl rounded-2xl" />
        <div className="mb-8 flex gap-2 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkFieldLight key={i} className="h-9 min-w-[72px] shrink-0 rounded-full" />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkFieldLight key={i} className="min-h-[120px] rounded-2xl p-4">
              <SkKickerLight className="mb-3 w-20" />
              <SkLineLight className="h-3 w-full opacity-80" />
              <SkLineLight className="mt-2 h-3 w-[85%] opacity-60" />
            </SkFieldLight>
          ))}
        </div>
      </div>
    </SkShellLight>
  );
}
