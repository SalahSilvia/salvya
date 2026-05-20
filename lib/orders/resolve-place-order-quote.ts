import { bagPrimaryLineItem, resolveBagCheckout, type BagCheckoutQuote } from "@/lib/cart/resolve-bag-checkout";
import { orderLineItemFromCartLine } from "@/lib/cart/cart-line-to-order-line";
import type { CartLine } from "@/lib/cart/types";
import type { OrderLineItem } from "@/lib/orders/types";
import {
  logClientPriceIgnored,
  resolveServerCheckoutQuote,
  type CheckoutQuoteOptions,
  type ServerCheckoutQuote,
} from "@/lib/orders/resolve-server-checkout";

export type PlaceOrderQuoteResult =
  | {
      ok: true;
      quote: ServerCheckoutQuote;
      lineItem: OrderLineItem;
      bag?: BagCheckoutQuote;
    }
  | { ok: false; error: string; code: string; status: number };

function orderLinesToCartLines(lines: OrderLineItem[]): CartLine[] {
  const now = new Date().toISOString();
  return lines.map((line, index) => ({
    v: 2 as const,
    lineId: `bag:${index}:${line.variantId}`,
    artistSlug: line.artistSlug,
    artistName: line.artistSlug,
    itemSlug: line.itemSlug,
    productKind: line.productKind,
    displayTitle: line.displayTitle,
    priceLabel: line.priceLabel,
    colorId: line.colorId,
    colorLabel: line.colorLabel,
    size: line.size,
    variantId: line.variantId,
    qty: line.qty,
    giftNote: "",
    checkoutHref: "",
    addedAt: now,
    updatedAt: now,
  }));
}

function combinedQuoteFromBag(bag: BagCheckoutQuote): ServerCheckoutQuote {
  const first = bag.lines[0]!.quote;
  const totalQty = bag.lines.reduce((n, row) => n + row.quote.qty, 0);
  return {
    ...first,
    qty: totalQty,
    lineTotal: bag.subtotal,
    priceLabel: bag.subtotalLabel,
    productSnapshot: {
      ...first.productSnapshot,
      title: bag.summaryTitle,
      lineTotal: bag.subtotal.unitAmount,
      qty: totalQty,
    },
  };
}

export async function resolvePlaceOrderQuote(
  lineItem: OrderLineItem,
  userId?: string | null,
  quoteOptions?: CheckoutQuoteOptions,
): Promise<PlaceOrderQuoteResult> {
  const bagSource = lineItem.bagLines?.length ? lineItem.bagLines : null;

  if (bagSource) {
    const bagResult = await resolveBagCheckout(orderLinesToCartLines(bagSource), userId, quoteOptions);
    if (!bagResult.ok) {
      return { ok: false, error: bagResult.error, code: bagResult.code, status: bagResult.status };
    }
    const bag = bagResult.bag;
    const authoritative = bagPrimaryLineItem(bag);
    const quote = combinedQuoteFromBag(bag);
    logClientPriceIgnored(lineItem, quote);
    return { ok: true, quote, lineItem: authoritative, bag };
  }

  const single = await resolveServerCheckoutQuote(lineItem, userId, quoteOptions);
  if (!single.ok) {
    return { ok: false, error: single.error, code: single.code, status: single.status };
  }
  logClientPriceIgnored(lineItem, single.quote);
  return {
    ok: true,
    quote: single.quote,
    lineItem: {
      ...lineItem,
      priceLabel: single.quote.priceLabel,
      qty: single.quote.qty,
    },
  };
}
