"use client";

import { SalvyaLoadingMark } from "@/components/loading/SalvyaLoadingMark";
import { SalvyaSparkIcon, SalvyaLockIcon } from "@/components/ui/SalvyaIcons";
import { CheckoutPaymentTrustStrip } from "@/components/shop/CheckoutPaymentTrustStrip";

type Props = {
  kicker: string;
  title: string;
  description: string;
  verifying?: boolean;
};

/** Branded loading card for checkout confirm and bag checkout. */
export function CheckoutLoadingPanel({ kicker, title, description, verifying }: Props) {
  return (
    <div className="salvya-load-enter mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_24px_60px_-28px_rgba(15,23,42,0.18)]">
      <div className="relative h-1 w-full overflow-hidden bg-slate-100" aria-hidden>
        <div className="salvya-load-bar h-full w-1/2 rounded-full bg-gradient-to-r from-[#2D6BFF]/35 via-indigo-400/45 to-[#2D6BFF]/35" />
      </div>
      <div className="space-y-5 px-6 py-12 text-center sm:px-10">
        <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
          <SalvyaLoadingMark variant="admin" size="lg" />
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[#2D6BFF]">
            {verifying ? (
              <SalvyaLockIcon className="h-7 w-7" />
            ) : (
              <SalvyaSparkIcon className="h-7 w-7" />
            )}
          </span>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{kicker}</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">{title}</h2>
          <p className="mx-auto mt-3 max-w-sm text-[13px] leading-relaxed text-slate-600">{description}</p>
        </div>
        <div className="mx-auto max-w-sm space-y-2 pt-1">
          <div className="h-3 rounded-full bg-slate-100 salvya-sk-sheen-light salvya-sk-breathe-light" />
          <div className="mx-auto h-3 w-4/5 rounded-full bg-slate-100 salvya-sk-sheen-light salvya-sk-breathe-light" />
        </div>
      </div>
      <div className="border-t border-slate-100 px-4 py-3 sm:px-5">
        <CheckoutPaymentTrustStrip />
      </div>
    </div>
  );
}

/** Full-screen checkout loading (bag entry). */
export function CheckoutPageLoading({ message }: { message: string }) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-[#f4f6fb] text-slate-900">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -right-28 top-0 h-[26rem] w-[26rem] rounded-full bg-[#2D6BFF]/[0.08] blur-3xl" />
      </div>
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <CheckoutLoadingPanel
          kicker="Checkout"
          title={message}
          description="Preparing your session — this only takes a moment."
        />
      </div>
    </div>
  );
}
