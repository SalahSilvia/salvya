import type { RefundPolicyOrder } from "@/lib/orders/refund-policy";

export function isMoroccoMarketOrCountry(marketCode?: string | null, buyerCountry?: string | null): boolean {
  if (marketCode?.trim().toUpperCase() === "MA") return true;
  const c = (buyerCountry ?? "").trim().toUpperCase();
  return c === "MA" || c === "MAR" || c === "MOROCCO";
}

export function isMoroccoOrder(order: Pick<RefundPolicyOrder, "marketCode" | "buyerCountry">): boolean {
  return isMoroccoMarketOrCountry(order.marketCode, order.buyerCountry);
}

export function isMoroccoCodOrder(
  order: Pick<RefundPolicyOrder, "paymentMethod" | "marketCode" | "buyerCountry">,
): boolean {
  return order.paymentMethod === "cod" && isMoroccoOrder(order);
}
