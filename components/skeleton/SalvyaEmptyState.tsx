import type { ReactNode } from "react";
import Link from "next/link";
import { cx } from "./SalvyaSkeletonPrimitives";

type Tone = "dark" | "light";

const tones: Record<Tone, { wrap: string; title: string; body: string; cta: string }> = {
  dark: {
    wrap: "border-white/[0.08] bg-white/[0.03]",
    title: "text-white",
    body: "text-white/50",
    cta: "border-white/20 bg-white/[0.08] text-white hover:bg-white/[0.12]",
  },
  light: {
    wrap: "border-[#e3e5e7] bg-white",
    title: "text-[#202223]",
    body: "text-[#6d7175]",
    cta: "border-[#c9cccf] bg-[#f6f6f7] text-[#202223] hover:bg-[#edeeef]",
  },
};

export function SalvyaEmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  icon,
  tone = "dark",
  className,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  const t = tones[tone];
  const cta =
    actionLabel && actionHref ? (
      <Link
        href={actionHref}
        className={cx(
          "mt-5 inline-flex min-h-[44px] items-center justify-center rounded-xl border px-5 text-[14px] font-semibold transition-colors",
          t.cta,
        )}
      >
        {actionLabel}
      </Link>
    ) : actionLabel && onAction ? (
      <button
        type="button"
        onClick={onAction}
        className={cx(
          "mt-5 inline-flex min-h-[44px] items-center justify-center rounded-xl border px-5 text-[14px] font-semibold transition-colors",
          t.cta,
        )}
      >
        {actionLabel}
      </button>
    ) : null;

  return (
    <div
      className={cx(
        "flex flex-col items-center rounded-2xl border px-6 py-10 text-center",
        t.wrap,
        className,
      )}
      role="status"
    >
      {icon ? <div className="mb-4 flex justify-center">{icon}</div> : null}
      <h3 className={cx("m-0 text-[17px] font-semibold tracking-tight", t.title)}>{title}</h3>
      <p className={cx("m-0 mt-2 max-w-sm text-[14px] leading-relaxed", t.body)}>{description}</p>
      {cta}
    </div>
  );
}
