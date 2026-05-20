import { estimateOrderTotalCents } from "@/lib/admin/parse-price";
import { currencyFromPriceLabel, convertMinorUnits, type MoneyMinor } from "@/lib/currency/convert";
import type { CurrencyCode } from "@/lib/currency/config";
import { formatMoneyMinor } from "@/lib/currency/display";
import type { CustomerOrder } from "@/lib/orders/types";

export const ADMIN_REPORT_CURRENCY: CurrencyCode = "EUR";

type OrderMoneyInput = Pick<CustomerOrder, "lineItem" | "finalPrice" | "orderCurrency">;

function parseOrderCurrency(raw: string | null | undefined, priceLabel: string): CurrencyCode {
  if (raw) {
    const c = raw.trim().toUpperCase();
    if (c === "EUR" || c === "USD" || c === "MAD") return c;
  }
  return currencyFromPriceLabel(priceLabel);
}

/** Authoritative order total in minor units (prefers DB final_price + order_currency). */
export function orderTotalMinor(order: OrderMoneyInput): MoneyMinor {
  if (typeof order.finalPrice === "number" && Number.isFinite(order.finalPrice)) {
    const currency = parseOrderCurrency(order.orderCurrency, order.lineItem.priceLabel);
    return {
      amountCents: Math.round(order.finalPrice * 100),
      currency,
    };
  }
  return {
    amountCents: estimateOrderTotalCents(order.lineItem),
    currency: parseOrderCurrency(order.orderCurrency, order.lineItem.priceLabel),
  };
}

export function orderTotalMinorInAdminCurrency(order: OrderMoneyInput): MoneyMinor {
  return convertMinorUnits(orderTotalMinor(order), ADMIN_REPORT_CURRENCY);
}

export function formatOrderTotalPaid(order: OrderMoneyInput): string {
  return formatMoneyMinor(orderTotalMinor(order));
}

export function formatAdminOrderTotal(order: OrderMoneyInput): string {
  return formatMoneyMinor(orderTotalMinorInAdminCurrency(order));
}

export function formatAdminEuroFromCents(cents: number): string {
  return formatMoneyMinor({ amountCents: cents, currency: ADMIN_REPORT_CURRENCY });
}

export function adminOrderTotalCents(order: OrderMoneyInput): number {
  return orderTotalMinorInAdminCurrency(order).amountCents;
}

/** DB row shape for admin aggregates (line_item + optional stored totals). */
export function orderTotalMinorFromDbRow(row: {
  line_item: OrderMoneyInput["lineItem"];
  final_price?: number | null;
  order_currency?: string | null;
}): MoneyMinor {
  return orderTotalMinor({
    lineItem: row.line_item,
    finalPrice: row.final_price ?? undefined,
    orderCurrency: row.order_currency ?? undefined,
  });
}

export function adminOrderTotalCentsFromDbRow(
  row: Parameters<typeof orderTotalMinorFromDbRow>[0],
): number {
  return orderTotalMinorInAdminCurrency({
    lineItem: row.line_item,
    finalPrice: row.final_price ?? undefined,
    orderCurrency: row.order_currency ?? undefined,
  }).amountCents;
}
