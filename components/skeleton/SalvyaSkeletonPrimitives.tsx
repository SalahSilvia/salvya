import type { ReactNode } from "react";

export function cx(...parts: Array<string | undefined | false | null>) {
  return parts.filter(Boolean).join(" ");
}

type DivProps = React.ComponentPropsWithoutRef<"div">;

/** Cinematic void + soft vignette + film grain. */
export function SkShellDark({ children, className, ...rest }: DivProps) {
  return (
    <div
      className={cx(
        "relative min-h-dvh w-full overflow-hidden bg-[#050508] text-white",
        className,
      )}
      {...rest}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(45,107,255,0.14),transparent_55%),radial-gradient(ellipse_90%_60%_at_100%_100%,rgba(255,200,170,0.05),transparent_50%),radial-gradient(ellipse_70%_50%_at_0%_80%,rgba(255,255,255,0.03),transparent_45%)]"
        aria-hidden
      />
      <div className="grain-overlay pointer-events-none absolute inset-0 opacity-[0.055]" aria-hidden />
      <span className="sr-only">Loading</span>
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

/** Warm editorial paper — auth / light flows. */
export function SkShellLight({ children, className, ...rest }: DivProps) {
  return (
    <div
      className={cx(
        "relative min-h-dvh w-full overflow-hidden bg-[#f6f3ef] text-neutral-900",
        className,
      )}
      {...rest}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_50%_0%,rgba(255,255,255,0.85),transparent_58%),radial-gradient(ellipse_80%_60%_at_100%_100%,rgba(220,200,185,0.12),transparent_50%)]"
        aria-hidden
      />
      <span className="sr-only">Loading</span>
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

/** Small caps / section label placeholder (Grailed-style hierarchy). */
export function SkKicker({ className, ...rest }: DivProps) {
  return (
    <div
      className={cx(
        "h-2.5 w-24 rounded-full bg-white/[0.08] ring-1 ring-white/[0.05]",
        "salvya-sk-sheen-dark salvya-sk-breathe-dark",
        className,
      )}
      {...rest}
    />
  );
}

export function SkKickerLight({ className, ...rest }: DivProps) {
  return (
    <div
      className={cx(
        "h-2.5 w-28 rounded-full bg-stone-900/[0.06] ring-1 ring-stone-900/[0.04]",
        "salvya-sk-sheen-light salvya-sk-breathe-light",
        className,
      )}
      {...rest}
    />
  );
}

/** Editorial block — glass edge, aurora fill, light sweep. */
export function SkFieldDark({ className, children, ...rest }: DivProps & { children?: ReactNode }) {
  return (
    <div
      className={cx(
        "salvya-sk-aurora-field salvya-sk-sheen-dark salvya-sk-breathe-dark relative overflow-hidden rounded-2xl border border-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function SkFieldLight({ className, children, ...rest }: DivProps & { children?: ReactNode }) {
  return (
    <div
      className={cx(
        "salvya-sk-sheen-light salvya-sk-breathe-light relative overflow-hidden rounded-2xl border border-stone-900/[0.06] bg-gradient-to-br from-[#faf8f5] via-[#f3efe9] to-[#ebe6df] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function SkLineDark({ className, ...rest }: DivProps) {
  return (
    <div
      className={cx(
        "h-3 rounded-md bg-white/[0.06] ring-1 ring-white/[0.04] salvya-sk-sheen-dark salvya-sk-breathe-dark",
        className,
      )}
      {...rest}
    />
  );
}

export function SkLineLight({ className, ...rest }: DivProps) {
  return (
    <div
      className={cx(
        "h-3 rounded-md bg-stone-900/[0.07] salvya-sk-sheen-light salvya-sk-breathe-light",
        className,
      )}
      {...rest}
    />
  );
}

export function SkCircleDark({ className, ...rest }: DivProps) {
  return (
    <div
      className={cx(
        "rounded-full border border-white/[0.08] bg-gradient-to-br from-white/[0.1] to-white/[0.02] salvya-sk-sheen-dark salvya-sk-breathe-dark",
        className,
      )}
      {...rest}
    />
  );
}

export function SkHeaderBarDark({ showMenuSlot }: { showMenuSlot?: boolean }) {
  return (
    <header
      className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#050508]/80 px-4 pt-[max(0.25rem,env(safe-area-inset-top))] backdrop-blur-xl"
      aria-hidden
    >
      <div className="mx-auto flex h-[3.25rem] max-w-md items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {showMenuSlot ? <SkFieldDark className="h-11 w-11 shrink-0 rounded-2xl" /> : <div className="w-10" />}
        </div>
        <SkFieldDark className="h-6 w-[108px] rounded-md opacity-90" />
        <div className="flex items-center gap-1.5">
          <SkFieldDark className="h-11 w-11 shrink-0 rounded-2xl" />
          <SkFieldDark className="h-11 w-11 shrink-0 rounded-2xl" />
          <SkFieldDark className="h-11 w-11 shrink-0 rounded-2xl" />
        </div>
      </div>
    </header>
  );
}
