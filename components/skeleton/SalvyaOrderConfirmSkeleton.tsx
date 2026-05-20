import { SkFieldDark, SkKicker, SkLineDark, SkShellDark } from "./SalvyaSkeletonPrimitives";

/** Dark cinematic checkout confirm — matches ProductCheckoutConfirmPage. */
export function SalvyaOrderConfirmSkeleton() {
  return (
    <SkShellDark>
      <header className="relative z-20 border-b border-white/[0.07] bg-black/30 px-4 py-4 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <div className="h-4 w-16 rounded-full bg-white/[0.08] salvya-sk-sheen-dark salvya-sk-breathe-dark" />
          <div className="h-4 w-24 rounded-full bg-white/[0.06] salvya-sk-sheen-dark salvya-sk-breathe-dark" />
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-lg flex-col items-center px-4 pb-28 pt-10 sm:px-6">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] salvya-sk-sheen-dark salvya-sk-breathe-dark" />
        <SkKicker className="mt-8 w-32" />
        <SkLineDark className="mt-4 h-7 w-56" />
        <SkLineDark className="mt-3 h-4 w-full max-w-sm opacity-65" />
        <SkFieldDark className="mt-10 w-full min-h-[280px] rounded-[1.8rem] p-5">
          <div className="flex gap-4">
            <div className="size-20 shrink-0 rounded-2xl bg-white/[0.06] ring-1 ring-white/[0.05]" />
            <div className="min-w-0 flex-1 space-y-2.5 pt-1">
              <SkLineDark className="h-4 w-[85%]" />
              <SkLineDark className="h-3 w-[60%] opacity-70" />
              <SkLineDark className="h-3 w-[40%] opacity-55" />
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-2 border-t border-white/[0.08] pt-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-white/[0.04] ring-1 ring-white/[0.06]" />
            ))}
          </div>
        </SkFieldDark>
        <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row">
          <div className="h-[52px] flex-1 rounded-xl bg-white/[0.08] salvya-sk-sheen-dark salvya-sk-breathe-dark" />
          <div className="h-[52px] flex-1 rounded-xl bg-white/[0.04] ring-1 ring-white/[0.08] salvya-sk-sheen-dark salvya-sk-breathe-dark" />
        </div>
      </div>
    </SkShellDark>
  );
}
