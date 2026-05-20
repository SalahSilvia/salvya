import { SalvyaLockIcon } from "@/components/ui/SalvyaIcons";

/** Compact security reassurance on the payment step. */
export function CheckoutPaymentTrustStrip() {
  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200/90 bg-gradient-to-r from-slate-50 to-white px-3.5 py-2.5 text-[11px] leading-snug text-slate-600"
      role="note"
    >
      <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-800 ring-1 ring-emerald-200/80">
        <SalvyaLockIcon className="h-3.5 w-3.5" />
        Secure
      </span>
      <span>
        Payments are verified on Salvya&apos;s servers with PayPal — we never store card numbers. Your order is only confirmed
        after verification succeeds.
      </span>
    </div>
  );
}
