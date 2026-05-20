"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { BagCheckoutSummaryLine } from "@/components/shop/BagCheckoutOrderSummary";
import { readBagCheckoutLines } from "@/lib/cart/bag-checkout-lines-session";
import type { OrderLineItem } from "@/lib/orders/types";

export const BAG_CHECKOUT_PATH = "/preview-bag/checkout";

export type BagCheckoutQuoteState = {
  summaryTitle: string;
  subtotalLabel: string;
  subtotalCents: number;
  currency: string;
  marketCode: string;
  lines: BagCheckoutSummaryLine[];
};

function toOrderLine(row: BagCheckoutSummaryLine): OrderLineItem {
  return {
    artistSlug: row.artistSlug,
    itemSlug: row.itemSlug,
    productKind: row.productKind,
    variantId: row.variantId,
    displayTitle: row.displayTitle,
    priceLabel: row.priceLabel,
    kindLabel: row.kindLabel,
    qty: row.qty,
    size: row.size,
    colorId: row.colorId,
    colorLabel: row.colorLabel,
    productImageSrc: row.productImageSrc,
  };
}

export function useBagCheckoutQuote() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<BagCheckoutQuoteState | null>(null);

  useEffect(() => {
    let cancelled = false;
    const cart = readBagCheckoutLines();
    if (!cart.length) {
      router.replace("/preview-bag");
      return;
    }

    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/cart/checkout-quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lines: cart }),
        });
        const data = (await res.json()) as BagCheckoutQuoteState & { error?: string };
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error ?? "Could not load your bag checkout");
          setQuote(null);
          return;
        }
        setQuote(data);
      } catch {
        if (!cancelled) setError("Network error — try again");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const bagOrderLines = useMemo(() => (quote ? quote.lines.map(toOrderLine) : []), [quote]);

  const primaryLineItem = useMemo((): OrderLineItem | null => {
    if (!quote || !bagOrderLines.length) return null;
    const first = bagOrderLines[0]!;
    if (bagOrderLines.length === 1) return first;
    const totalQty = bagOrderLines.reduce((n, l) => n + l.qty, 0);
    return {
      ...first,
      displayTitle: quote.summaryTitle,
      qty: totalQty,
      priceLabel: quote.subtotalLabel,
      bagLines: bagOrderLines,
    };
  }, [bagOrderLines, quote]);

  return { loading, error, quote, bagOrderLines, primaryLineItem };
}
