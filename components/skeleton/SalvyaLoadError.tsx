import { cx } from "./SalvyaSkeletonPrimitives";

type Tone = "dark" | "light";

export function SalvyaLoadError({
  title = "Couldn’t load this",
  message = "Check your connection and try again.",
  onRetry,
  tone = "dark",
  className,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  tone?: Tone;
  className?: string;
}) {
  const isDark = tone === "dark";
  return (
    <div
      className={cx(
        "flex flex-col items-center rounded-2xl border px-6 py-8 text-center",
        isDark ? "border-rose-500/20 bg-rose-500/[0.06]" : "border-rose-200 bg-rose-50",
        className,
      )}
      role="alert"
    >
      <p className={cx("m-0 text-[15px] font-semibold", isDark ? "text-rose-100" : "text-rose-900")}>{title}</p>
      <p className={cx("m-0 mt-2 max-w-sm text-[13px] leading-relaxed", isDark ? "text-white/55" : "text-rose-800/80")}>
        {message}
      </p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className={cx(
            "mt-5 inline-flex min-h-[44px] items-center justify-center rounded-xl border px-5 text-[14px] font-semibold transition-colors",
            isDark
              ? "border-white/20 bg-white/[0.08] text-white hover:bg-white/[0.12]"
              : "border-rose-300 bg-white text-rose-900 hover:bg-rose-50",
          )}
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}
