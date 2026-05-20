import type { OrderLineItem } from "@/lib/orders/types";

export async function reserveCheckoutStock(
  checkoutSessionId: string,
  lineItem: OrderLineItem,
): Promise<{ ok: true } | { ok: false; error: string; code?: string }> {
  try {
    const res = await fetch("/api/checkout/reserve-stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checkoutSessionId, lineItem }),
      credentials: "same-origin",
    });
    const data = (await res.json()) as { ok?: boolean; error?: string; code?: string };
    if (!res.ok || !data.ok) {
      return { ok: false, error: data.error ?? "Could not reserve stock", code: data.code };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Network error reserving stock" };
  }
}

/** Reserve all bag lines before payment; fails if any line is unavailable. */
export async function reserveCheckoutStockBag(
  checkoutSessionId: string,
  lines: OrderLineItem[],
): Promise<{ ok: true } | { ok: false; error: string; code?: string }> {
  if (!lines.length) {
    return { ok: false, error: "No items to reserve", code: "empty_bag" };
  }
  try {
    const res = await fetch("/api/checkout/reserve-stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checkoutSessionId, bagLines: lines }),
      credentials: "same-origin",
    });
    const data = (await res.json()) as { ok?: boolean; error?: string; code?: string };
    if (!res.ok || !data.ok) {
      return { ok: false, error: data.error ?? "Could not reserve stock", code: data.code };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Network error reserving stock" };
  }
}
