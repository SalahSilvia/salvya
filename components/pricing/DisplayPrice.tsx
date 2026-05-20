import type { StorefrontProduct } from "@/lib/catalog/storefront-product";
import type { MarketContext } from "@/lib/market/market-context";
import { resolveDisplayPrice } from "@/lib/market/resolve-display-price";

type Props = {
  product: StorefrontProduct;
  market: MarketContext;
  qty?: number;
  showKind?: boolean;
  showEurHint?: boolean;
  className?: string;
};

/**
 * Standard display price — market-aware, never used for checkout totals.
 */
export function DisplayPrice({
  product,
  market,
  qty = 1,
  showKind = false,
  showEurHint = false,
  className,
}: Props) {
  const resolved = resolveDisplayPrice(product, market, {
    includeKind: showKind,
    qty,
    locale: market.locale,
  });

  return (
    <span className={className}>
      {showKind && resolved.priceLabel ? resolved.priceLabel : resolved.displayPrice}
      {showEurHint && resolved.currency !== "EUR" ? (
        <span className="ml-1.5 text-[0.85em] font-normal text-white/40">
          (charged in EUR at checkout)
        </span>
      ) : null}
    </span>
  );
}
