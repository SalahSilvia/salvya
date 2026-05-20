import { SkKickerLight, SkLineLight, SkShellLight } from "./SalvyaSkeletonPrimitives";

/** Long-form policy pages — calm, editorial column. */
export function SalvyaLegalDocumentSkeleton() {
  return (
    <SkShellLight>
      <div className="mx-auto max-w-2xl px-5 py-[max(2rem,env(safe-area-inset-top))] pb-24">
        <SkKickerLight className="mb-4" />
        <SkLineLight className="mb-3 h-8 w-[72%]" />
        <SkLineLight className="mb-10 h-3 w-40 opacity-70" />
        <div className="space-y-3">
          {Array.from({ length: 16 }).map((_, i) => (
            <SkLineLight
              key={i}
              className={
                i % 7 === 6
                  ? "mt-4 h-8 w-[55%]"
                  : i % 5 === 4
                    ? "h-3 w-[82%]"
                    : "h-3 w-full"
              }
            />
          ))}
        </div>
      </div>
    </SkShellLight>
  );
}
