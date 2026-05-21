"use client";

type Props = {
  label: string;
};

export function AuthDivider({ label }: Props) {
  return (
    <div className="relative my-6 flex items-center gap-3" role="separator" aria-label={label}>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-200 to-neutral-200/40" />
      <span className="shrink-0 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
        {label}
      </span>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-neutral-200 to-neutral-200/40" />
    </div>
  );
}
