import type { ProductCheckoutPageProps } from "@/components/shop/ProductCheckoutPage";
import type { BagCheckoutQuoteState } from "@/components/shop/bag-checkout/useBagCheckoutQuote";
import type { OrderLineItem } from "@/lib/orders/types";
import { artists } from "@/lib/site-data";

export function productCheckoutPropsFromBag(
  quote: BagCheckoutQuoteState,
  primaryLineItem: OrderLineItem,
): ProductCheckoutPageProps {
  const first = quote.lines[0]!;
  const artist = artists.find((a) => a.slug === first.artistSlug);
  return {
    artistName: artist?.name ?? first.artistSlug,
    displayTitle: quote.summaryTitle,
    priceLabel: quote.subtotalLabel,
    productKind: first.productKind,
    kindLabel: first.kindLabel,
    returnHref: "/preview-bag",
    recapQty: quote.lines.reduce((n, l) => n + l.qty, 0),
    recapSize: first.size,
    recapColorLabel: first.colorLabel,
    productImageSrc: first.productImageSrc,
    previewQueryString: "",
    variantId: first.variantId,
    bag: {
      summaryLines: quote.lines,
      subtotalLabel: quote.subtotalLabel,
      subtotalCents: quote.subtotalCents,
      primaryLineItem,
    },
  };
}
