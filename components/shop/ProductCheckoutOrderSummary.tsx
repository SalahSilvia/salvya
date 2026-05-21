"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useCheckoutLabels } from "@/lib/i18n/use-checkout-labels";

export type ProductCheckoutOrderSummaryProps = {
  displayTitle: string;
  recapColorLabel: string;
  recapSize: string;
  kindLabel: string;
  recapQty: number;
  priceLabel: string;
  productImageSrc: string;
  deliveryHint?: string;
  discountLabel?: string | null;
  totalLabel?: string | null;
  footer?: ReactNode;
};

export function ProductCheckoutOrderSummary({
  displayTitle,
  recapColorLabel,
  recapSize,
  kindLabel,
  recapQty,
  priceLabel,
  productImageSrc,
  deliveryHint,
  discountLabel,
  totalLabel,
  footer,
}: ProductCheckoutOrderSummaryProps) {
  const { t } = useCheckoutLabels();

  return (
    <aside className="lg:sticky lg:top-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06),0_16px_48px_-24px_rgba(15,23,42,0.14)]">
        <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-normal text-slate-500">{t("orderSummary")}</p>
        </div>
        <div className="p-4 sm:p-5">
          <div className="flex gap-3">
            <div className="relative h-[4.5rem] w-[3.25rem] shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 sm:h-[5.25rem] sm:w-16">
              {productImageSrc ? (
                <Image
                  src={productImageSrc}
                  alt={displayTitle}
                  fill
                  className="object-cover object-center"
                  sizes="64px"
                  unoptimized
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center px-1 text-center text-[10px] leading-tight text-slate-400">
                  {t("noImage")}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-slate-900 sm:text-[14px]">{displayTitle}</p>
              <p className="mt-1 text-[11px] text-slate-500 sm:text-[12px]">
                {recapColorLabel} · {recapSize} · {kindLabel}
              </p>
              <p className="mt-1.5 text-[11px] text-slate-500">
                <Link
                  href="/size-guide"
                  prefetch={false}
                  className="font-medium text-[#2D6BFF] underline decoration-[#2D6BFF]/25 underline-offset-2 hover:text-[#2557d6] hover:decoration-[#2D6BFF]/45"
                >
                  {t("buyPanel.sizeGuide")}
                </Link>
              </p>
              <p className="mt-0.5 text-[10px] text-slate-400">{t("sizeGuideConfirm")}</p>
            </div>
          </div>
          <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-[13px]">
            <div className="flex justify-between text-slate-600">
              <span>{t("quantity")}</span>
              <span className="font-medium tabular-nums text-slate-900">{recapQty}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>{t("subtotal")}</span>
              <span className="font-semibold tabular-nums text-slate-900">{priceLabel}</span>
            </div>
            {discountLabel ? (
              <div className="flex justify-between text-emerald-700">
                <span>{t("discount")}</span>
                <span className="font-semibold tabular-nums">{discountLabel}</span>
              </div>
            ) : null}
            {deliveryHint ? (
              <p className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] leading-snug text-slate-600">
                {deliveryHint}
              </p>
            ) : null}
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-white">
            <span className="text-[12px] font-medium uppercase tracking-normal text-white/70">{t("total")}</span>
            <span className="text-lg font-semibold tabular-nums">{totalLabel ?? priceLabel}</span>
          </div>
          {footer}
        </div>
      </div>
    </aside>
  );
}
