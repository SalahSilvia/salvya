type Props = {
  count: number;
  className?: string;
  /** `above` — small pill centered over the icon; `corner` — legacy top-right overlap */
  variant?: "above" | "corner";
};

/** Solid red count — no dark ring. */
export function NotificationBadge({ count, className = "", variant = "above" }: Props) {
  if (count <= 0) return null;

  const label = count > 9 ? "9+" : String(count);

  if (variant === "corner") {
    return (
      <span
        className={`absolute -right-0.5 -top-0.5 z-[2] flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff3040] px-0.5 text-[9px] font-bold leading-none text-white ${className}`}
        aria-hidden
      >
        {label}
      </span>
    );
  }

  return (
    <span
      className={`flex h-[14px] min-w-[14px] shrink-0 items-center justify-center rounded-full bg-[#ff3040] px-1 text-[9px] font-bold leading-none text-white tabular-nums ${className}`}
      aria-hidden
    >
      {label}
    </span>
  );
}
