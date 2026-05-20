type Props = {
  displayCurrency: string;
  className?: string;
};

/** Checkout pages: clarify PayPal charge is EUR while shelf may show local market price. */
export function CheckoutChargeNotice({ displayCurrency, className }: Props) {
  if (displayCurrency === "EUR") return null;
  return (
    <p className={className ?? "text-[12px] leading-relaxed text-white/45"}>
      Prices shown in {displayCurrency}. You will be charged in <span className="font-medium text-white/70">EUR</span> at
      checkout — amount verified on our servers.
    </p>
  );
}
