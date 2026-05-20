import { orderLineItemFromCartLine } from "@/lib/cart/cart-line-to-order-line";
import type { CartLine } from "@/lib/cart/types";
import { fetchPublishedProductBySlug } from "@/lib/catalog/fetch-published-products";
import { kindLabelFromProduct } from "@/lib/catalog/storefront-product";
import type { OrderLineItem } from "@/lib/orders/types";
import {
  resolveServerCheckoutQuote,
  type CheckoutQuoteOptions,
  type ServerCheckoutQuote,
} from "@/lib/orders/resolve-server-checkout";
import type { CurrencyCode } from "@/lib/currency/config";
import { formatMoneyMinor } from "@/lib/currency/display";
import type { ResolvedMarketPrice } from "@/lib/market/types";

export type BagQuotedLine = {
  lineId: string;
  orderLine: OrderLineItem;
  quote: ServerCheckoutQuote;
  productImageSrc: string;
  unitPriceLabel: string;
};

export type BagCheckoutQuote = {
  lines: BagQuotedLine[];
  subtotal: ResolvedMarketPrice;
  subtotalLabel: string;
  summaryTitle: string;
  anySoldOut: boolean;
};

function sumLineTotals(totals: ResolvedMarketPrice[]): ResolvedMarketPrice {
  const first = totals[0]!;
  const unitCents = totals.reduce((sum, line) => sum + line.unitCents, 0);
  const currency = first.currency as CurrencyCode;
  return {
    marketCode: first.marketCode,
    currency: first.currency,
    unitAmount: unitCents / 100,
    unitCents,
    displayPrice: formatMoneyMinor({ amountCents: unitCents, currency }, {}),
  };
}

export async function resolveBagCheckout(
  cartLines: CartLine[],
  userId?: string | null,
  quoteOptions?: CheckoutQuoteOptions,
): Promise<
  | { ok: true; bag: BagCheckoutQuote }
  | { ok: false; error: string; code: string; status: number; lineId?: string }
> {
  if (!cartLines.length) {
    return { ok: false, error: "Your bag is empty", code: "bag_empty", status: 400 };
  }

  const quoted: BagQuotedLine[] = [];

  for (const cartLine of cartLines) {
    const orderLine = orderLineItemFromCartLine(cartLine);
    const result = await resolveServerCheckoutQuote(orderLine, userId, quoteOptions);
    if (!result.ok) {
      return {
        ok: false,
        error: result.error,
        code: result.code,
        status: result.status,
        lineId: cartLine.lineId,
      };
    }

    const product = await fetchPublishedProductBySlug(cartLine.artistSlug, cartLine.itemSlug);
    const variant = product?.variants.find((v) => v.id === result.quote.variantId);
    const productImageSrc = variant?.imageOverride ?? product?.images[0] ?? "";

    quoted.push({
      lineId: cartLine.lineId,
      orderLine: {
        ...orderLine,
        variantId: result.quote.variantId,
        priceLabel: result.quote.priceLabel,
        qty: result.quote.qty,
        kindLabel: product ? kindLabelFromProduct(product) : orderLine.kindLabel,
        productImageSrc,
      },
      quote: result.quote,
      productImageSrc,
      unitPriceLabel: result.quote.unitPrice.displayPrice,
    });
  }

  const subtotal = sumLineTotals(quoted.map((q) => q.quote.lineTotal));
  const pieceCount = quoted.reduce((n, q) => n + q.quote.qty, 0);
  const summaryTitle =
    quoted.length === 1
      ? quoted[0]!.orderLine.displayTitle
      : `${quoted.length} variants · ${pieceCount} pieces`;

  return {
    ok: true,
    bag: {
      lines: quoted,
      subtotal,
      subtotalLabel: subtotal.displayPrice,
      summaryTitle,
      anySoldOut: false,
    },
  };
}

export function bagPrimaryLineItem(bag: BagCheckoutQuote): OrderLineItem {
  const first = bag.lines[0]!.orderLine;
  if (bag.lines.length === 1) return first;

  return {
    ...first,
    displayTitle: bag.summaryTitle,
    qty: bag.lines.reduce((n, l) => n + l.orderLine.qty, 0),
    priceLabel: bag.subtotalLabel,
    bagLines: bag.lines.map((l) => l.orderLine),
  };
}
