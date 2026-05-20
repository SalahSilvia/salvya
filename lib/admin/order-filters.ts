export type OrderDateRange = "all" | "7d" | "30d" | "90d";
export type OrderPaymentMethodFilter = "all" | "cod" | "paypal";

export function parseOrderDateRange(raw: string | null): OrderDateRange {
  const v = (raw ?? "all").toLowerCase();
  if (v === "7d" || v === "30d" || v === "90d") return v;
  return "all";
}

export function parsePaymentMethodFilter(raw: string | null): OrderPaymentMethodFilter {
  const v = (raw ?? "all").toLowerCase();
  if (v === "cod" || v === "paypal") return v;
  return "all";
}

export function sinceIsoForRange(range: OrderDateRange): string | null {
  if (range === "all") return null;
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

export const ORDER_DATE_RANGE_OPTIONS: { id: OrderDateRange; label: string }[] = [
  { id: "all", label: "All time" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "90d", label: "Last 90 days" },
];

export const ORDER_PAYMENT_METHOD_OPTIONS: { id: OrderPaymentMethodFilter; label: string }[] = [
  { id: "all", label: "All payments" },
  { id: "paypal", label: "PayPal" },
  { id: "cod", label: "Cash on delivery" },
];
