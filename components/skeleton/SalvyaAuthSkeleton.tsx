import {
  SkFieldLight,
  SkKickerLight,
  SkLineLight,
  SkShellLight,
} from "./SalvyaSkeletonPrimitives";

type Props = { variant?: "sign-in" | "sign-up" | "password" };

/** Light editorial — Apple / COS adjacent, warm paper + soft ink shapes. */
export function SalvyaAuthSkeleton({ variant = "sign-in" }: Props) {
  const fields = variant === "sign-up" ? 6 : variant === "password" ? 2 : 2;
  return (
    <SkShellLight>
      <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-16 pt-[max(2rem,env(safe-area-inset-top))]">
        <div className="mb-10 flex items-center justify-between">
          <SkFieldLight className="h-9 w-9 rounded-xl" />
          <SkFieldLight className="h-7 w-[100px] rounded-md" />
        </div>
        <SkKickerLight className="mb-4" />
        <SkLineLight className="mb-2 h-8 w-[78%]" />
        <SkLineLight className="mb-8 h-3.5 w-[55%] opacity-80" />
        <div className="space-y-4">
          {Array.from({ length: fields }).map((_, i) => (
            <div key={i} className="space-y-2">
              <SkLineLight className="h-2.5 w-20 opacity-70" />
              <SkFieldLight className="h-[52px] w-full rounded-xl" />
            </div>
          ))}
        </div>
        <SkFieldLight className="mt-8 h-[52px] w-full rounded-xl" />
        <div className="mt-8 flex justify-center gap-2">
          <SkLineLight className="h-3 w-32" />
          <SkLineLight className="h-3 w-24 opacity-70" />
        </div>
      </div>
    </SkShellLight>
  );
}
