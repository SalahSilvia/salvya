import type { PremiumTrendingCard } from "@/lib/home/premium-trending";

type Props = { badge?: PremiumTrendingCard["badge"] };

export function ProductCardBadge({ badge }: Props) {
  if (!badge) return null;
  const label = badge === "new" ? "New" : "Limited";
  const styles =
    badge === "new"
      ? "border-emerald-400/35 bg-emerald-500/20 text-emerald-100"
      : "border-[#ff4d6d]/35 bg-[#ff4d6d]/18 text-[#ffc8d4]";

  return (
    <span
      className={`pointer-events-none absolute left-2.5 top-2.5 z-[2] rounded-full border px-2 py-[2px] text-[9px] font-bold uppercase tracking-[0.14em] backdrop-blur-md ${styles}`}
    >
      {label}
    </span>
  );
}
