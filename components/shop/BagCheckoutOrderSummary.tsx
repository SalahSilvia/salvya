import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export type BagCheckoutSummaryLine = {
  lineId: string;
  artistSlug: string;
  itemSlug: string;
  productKind: "hoodie" | "tshirt";
  variantId: string;
  displayTitle: string;
  colorLabel: string;
  colorId: string;
  size: string;
  kindLabel: string;
  qty: number;
  priceLabel: string;
  productImageSrc: string;
};

type Props = {
  lines: BagCheckoutSummaryLine[];
  subtotalLabel: string;
  totalLabel?: string | null;
  discountLabel?: string | null;
  footer?: ReactNode;
};

export function BagCheckoutOrderSummary({
  lines,
  subtotalLabel,
  totalLabel,
  discountLabel,
  footer,
}: Props) {
  return (
    <aside className="lg:sticky lg:top-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06),0_16px_48px_-24px_rgba(15,23,42,0.14)]">
        <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-normal text-slate-500">
            Order summary · {lines.length} {lines.length === 1 ? "variant" : "variants"}
          </p>
        </div>
        <div className="p-4 sm:p-5">
          <ul className="max-h-[min(42vh,360px)] space-y-3 overflow-y-auto overscroll-contain pr-0.5">
            {lines.map((line) => (
              <li key={line.lineId} className="flex gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                  {line.productImageSrc ? (
                    <Image
                      src={line.productImageSrc}
                      alt={line.displayTitle}
                      fill
                      className="object-cover object-center"
                      sizes="44px"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[9px] text-slate-400">—</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-slate-900">{line.displayTitle}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {line.colorLabel} · {line.size} · {line.kindLabel}
                  </p>
                  <p className="mt-1 text-[11px] tabular-nums text-slate-600">
                    Qty {line.qty} · {line.priceLabel}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-[13px]">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold tabular-nums text-slate-900">{subtotalLabel}</span>
            </div>
            {discountLabel ? (
              <div className="flex justify-between text-emerald-700">
                <span>Discount</span>
                <span className="font-semibold tabular-nums">{discountLabel}</span>
              </div>
            ) : null}
            <p className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] leading-snug text-slate-600">
              All variants in your bag are included in this checkout.
              <Link href="/preview-bag" prefetch={false} className="ml-1 font-medium text-[#2D6BFF] hover:underline">
                Edit bag
              </Link>
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-white">
            <span className="text-[12px] font-medium uppercase tracking-normal text-white/70">Total</span>
            <span className="text-lg font-semibold tabular-nums">{totalLabel ?? subtotalLabel}</span>
          </div>
          {footer}
        </div>
      </div>
    </aside>
  );
}
