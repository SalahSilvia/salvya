"use client";

export function AdminCreatorNavBadge({ count, className = "" }: { count: number; className?: string }) {
  if (count <= 0) return null;
  const label = count > 99 ? "99+" : String(count);
  return (
    <span
      className={`relative inline-flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-1 text-[10px] font-bold leading-none text-white shadow-[0_0_0_2px_#fff] ${className}`}
      aria-label={`${label} pending creator applications`}
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-fuchsia-400/40" aria-hidden />
      <span className="relative">{label}</span>
    </span>
  );
}
