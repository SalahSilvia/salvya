"use client";

import Link from "next/link";
import type { CartLine } from "@/lib/cart/types";
import { formatCartLineVariant } from "@/lib/cart/product-bag";

type Props = {
  lines: CartLine[];
  totalBagQty: number;
  onAddAnother: () => void;
  onRemoveLine: (lineId: string) => void;
};

export function ProductBagSelections({ lines, totalBagQty, onAddAnother, onRemoveLine }: Props) {
  if (!lines.length) return null;

  return (
    <div className="rounded-2xl border border-[#2D6BFF]/25 bg-gradient-to-br from-[#2D6BFF]/12 via-[#2D6BFF]/5 to-transparent p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9eb4ff]">
            In your bag · {lines.length} {lines.length === 1 ? "variant" : "variants"}
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-white/50">
            Each size and color is its own line. Add more variants, then use one checkout from your bag.
          </p>
        </div>
        <Link
          href="/preview-bag"
          prefetch={false}
          className="shrink-0 rounded-lg border border-white/[0.12] bg-white/[0.06] px-2.5 py-1.5 text-[11px] font-semibold text-white/85 transition-colors hover:bg-white/[0.1]"
        >
          View bag ({totalBagQty})
        </Link>
      </div>

      <ul className="mt-3 space-y-2">
        {lines.map((line) => (
          <li
            key={line.lineId}
            className="flex items-center justify-between gap-2 rounded-xl border border-white/[0.08] bg-black/25 px-3 py-2"
          >
            <span className="text-[13px] font-medium text-white/88">{formatCartLineVariant(line)}</span>
            <button
              type="button"
              onClick={() => onRemoveLine(line.lineId)}
              className="shrink-0 text-[11px] font-semibold text-white/40 underline-offset-2 hover:text-rose-300/90 hover:underline"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onAddAnother}
        className="mt-3 flex w-full min-h-[42px] items-center justify-center rounded-xl border border-dashed border-[#2D6BFF]/35 bg-[#2D6BFF]/8 text-[13px] font-semibold text-[#c5d4ff] transition-colors hover:border-[#2D6BFF]/50 hover:bg-[#2D6BFF]/14"
      >
        + Add another size or color
      </button>
    </div>
  );
}
