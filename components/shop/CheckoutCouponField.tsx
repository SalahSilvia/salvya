"use client";

import { useState } from "react";
import {
  applyCouponToSubtotal,
  formatDiscountLine,
  normalizeCouponCode,
  subtotalCentsFromCheckout,
  type CouponResult,
} from "@/lib/checkout/coupons";
import { getAnalyticsTracker } from "@/lib/analytics/tracker";

type Props = {
  priceLabel: string;
  recapQty: number;
  pathname: string;
  productId: string | null;
  artistSlug: string | null;
  applied: CouponResult | null;
  onApplied: (result: CouponResult | null) => void;
};

export function CheckoutCouponField({
  priceLabel,
  recapQty,
  pathname,
  productId,
  artistSlug,
  applied,
  onApplied,
}: Props) {
  const [input, setInput] = useState(applied?.ok ? applied.code : "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const apply = () => {
    setBusy(true);
    setError(null);
    const subtotal = subtotalCentsFromCheckout(priceLabel, recapQty);
    const result = applyCouponToSubtotal(input, subtotal, priceLabel);
    if (result.ok) {
      onApplied(result);
      getAnalyticsTracker().trackApplyCoupon(pathname, productId, artistSlug, {
        coupon_code: result.code,
        discount_cents: result.discountCents,
      });
    } else {
      onApplied(null);
      setError(result.error);
    }
    setBusy(false);
  };

  const remove = () => {
    setInput("");
    setError(null);
    onApplied(null);
  };

  return (
    <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-normal text-slate-500">Promo code</p>
      {applied?.ok ? (
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-[13px] font-semibold text-emerald-700">
            {applied.code} · {applied.label} ({formatDiscountLine(applied.discountCents, priceLabel)})
          </span>
          <button type="button" onClick={remove} className="text-[12px] font-medium text-slate-500 hover:text-slate-800">
            Remove
          </button>
        </div>
      ) : (
        <>
          <div className="mt-2 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(normalizeCouponCode(e.target.value))}
              placeholder="e.g. SALVYA10"
              className="min-h-[40px] flex-1 rounded-lg border border-slate-200 bg-white px-3 text-[13px] uppercase text-slate-900 placeholder:normal-case placeholder:text-slate-400 focus:border-[#2D6BFF] focus:outline-none focus:ring-2 focus:ring-[#2D6BFF]/20"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  apply();
                }
              }}
            />
            <button
              type="button"
              disabled={busy || !input.trim()}
              onClick={apply}
              className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-45"
            >
              Apply
            </button>
          </div>
          {error ? <p className="mt-2 text-[12px] text-rose-600">{error}</p> : null}
          <p className="mt-2 text-[11px] text-slate-500">Try SALVYA10 or WELCOME5</p>
        </>
      )}
    </div>
  );
}
