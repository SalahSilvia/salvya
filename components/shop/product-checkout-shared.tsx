"use client";

export function CheckoutStepGraphic({ activeStep }: { activeStep: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: "Information", short: "Info" },
    { n: 2, label: "Payment", short: "Pay" },
    { n: 3, label: "Confirmation", short: "Done" },
  ] as const;

  return (
    <div className="flex w-full max-w-md flex-col gap-2 sm:max-w-none">
      <div className="hidden h-1.5 w-full overflow-hidden rounded-full bg-slate-200/90 sm:block">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#2D6BFF] via-[#5b8cff] to-[#1d4ed8] transition-[width] duration-500 ease-out"
          style={{ width: activeStep === 1 ? "33%" : activeStep === 2 ? "66%" : "100%" }}
        />
      </div>
      <div className="flex items-start justify-between gap-1 sm:gap-2" aria-hidden>
        {steps.map((step, i) => {
          const done = activeStep > step.n;
          const active = activeStep === step.n;
          return (
            <div key={step.n} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <div className="flex w-full items-center gap-0.5">
                {i > 0 ? (
                  <div
                    className={`h-px flex-1 rounded-full ${done || active ? "bg-[#2D6BFF]/35" : "bg-slate-200"}`}
                  />
                ) : (
                  <div className="h-px flex-1 opacity-0" />
                )}
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold shadow-sm ring-2 ring-offset-2 ring-offset-white transition-colors sm:h-9 sm:w-9 sm:text-[12px] ${
                    done
                      ? "bg-emerald-500 text-white ring-emerald-500/20"
                      : active
                        ? "bg-[#2D6BFF] text-white ring-[#2D6BFF]/25"
                        : "border border-slate-200 bg-slate-50 text-slate-400 ring-transparent"
                  }`}
                >
                  {done ? "✓" : step.n}
                </span>
                {i < steps.length - 1 ? (
                  <div
                    className={`h-px flex-1 rounded-full ${activeStep > step.n ? "bg-[#2D6BFF]/35" : "bg-slate-200"}`}
                  />
                ) : (
                  <div className="h-px flex-1 opacity-0" />
                )}
              </div>
              <span
                className={`hidden text-center text-[10px] font-semibold leading-tight sm:block ${
                  active ? "text-[#2D6BFF]" : done ? "text-emerald-700" : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
              <span
                className={`block text-center text-[9px] font-semibold leading-tight sm:hidden ${
                  active ? "text-[#2D6BFF]" : done ? "text-emerald-700" : "text-slate-400"
                }`}
              >
                {step.short}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Logo from `public/checkout/paypal.png` */
export function PayPalMarkImg({ className = "" }: { className?: string }) {
  return (
    <img
      src="/checkout/paypal.png"
      alt="PayPal"
      className={`h-7 w-auto max-w-[6.5rem] object-contain object-left ${className}`}
      loading="lazy"
      decoding="async"
    />
  );
}

export function CardBrandRow({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src="/checkout/visa.webp"
        alt="Visa"
        className="h-6 w-auto max-w-[2.75rem] object-contain"
        loading="lazy"
        decoding="async"
      />
      <img
        src="/checkout/mastercard.png"
        alt="Mastercard"
        className="h-6 w-auto max-w-[2.75rem] object-contain"
        loading="lazy"
        decoding="async"
      />
      <span className="text-[10px] font-medium text-slate-500">via PayPal</span>
    </div>
  );
}

export function TrustStrip() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-slate-100 bg-gradient-to-b from-slate-50/90 to-white px-4 py-3.5 text-[11px] text-slate-600 sm:gap-x-8">
      <span className="inline-flex items-center gap-1.5">
        <svg className="h-4 w-4 text-emerald-600" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 3l7 4v5c0 5-3.5 9-7 11-3.5-2-7-6-7-11V7l7-4z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        HTTPS · private browser session
      </span>
      <span className="inline-flex items-center gap-1.5">
        <svg className="h-4 w-4 text-[#2D6BFF]" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        Salvya checkout
      </span>
      <span className="inline-flex items-center gap-1.5">
        <svg className="h-4 w-4 text-slate-500" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M5 18H3v-8h2M9 22H7v-9h2m4 6h-2v-6h2m4 4h-2v-4h2m4 2h-2v-2h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Tracked delivery
      </span>
    </div>
  );
}
