import Link from "next/link";

type Props = {
  backHref: string;
  backLabel: string;
  pill: string;
  /** `day` — light header for {@link AuthDaylight}; default matches {@link AuthScenery}. */
  variant?: "night" | "day";
};

export function AuthTopBar({ backHref, backLabel, pill, variant = "night" }: Props) {
  const day = variant === "day";

  return (
    <header
      className={
        day
          ? "fixed top-0 right-0 left-0 z-50 border-b border-neutral-200/90 bg-white/90 pt-[env(safe-area-inset-top)] shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_8px_32px_-20px_rgba(15,23,42,0.08)] backdrop-blur-xl"
          : "fixed top-0 right-0 left-0 z-50 border-b border-white/[0.06] bg-[#0a0a12]/55 pt-[env(safe-area-inset-top)] shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)] backdrop-blur-2xl backdrop-saturate-150"
      }
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
        <Link
          href={backHref}
          className={
            day
              ? "group inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border border-neutral-200/90 bg-white px-4 py-2 text-[13px] font-semibold text-neutral-700 shadow-sm transition-[border-color,background-color,transform] hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-950 active:scale-[0.98]"
              : "group inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-[13px] font-medium text-white/80 transition-[border-color,background-color,transform] hover:border-white/[0.14] hover:bg-white/[0.08] hover:text-white active:scale-[0.98]"
          }
        >
          <span
            className={
              day
                ? "text-[15px] leading-none text-neutral-400 transition-transform group-hover:-translate-x-0.5"
                : "text-[15px] leading-none text-white/50 transition-transform group-hover:-translate-x-0.5"
            }
            aria-hidden
          >
            ←
          </span>
          {backLabel}
        </Link>
        <span
          className={
            day
              ? "rounded-full border border-blue-100 bg-gradient-to-r from-blue-50 to-sky-50 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-800 ring-1 ring-blue-100/80"
              : "rounded-full border border-white/[0.1] bg-gradient-to-r from-white/[0.08] to-white/[0.02] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
          }
        >
          {pill}
        </span>
      </div>
    </header>
  );
}
