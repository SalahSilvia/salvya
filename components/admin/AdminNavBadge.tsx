"use client";

export function AdminNavBadge({ count, className = "" }: { count: number; className?: string }) {
  if (count <= 0) return null;
  const label = count > 99 ? "99+" : String(count);
  return (
    <span
      className={`inline-flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#e11d48] px-1 text-[10px] font-bold leading-none text-white shadow-[0_0_0_2px_#fff] ${className}`}
      aria-label={`${label} unread`}
    >
      {label}
    </span>
  );
}
