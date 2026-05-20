import type { CustomerOrder } from "@/lib/orders/types";

export type FetchMyOrdersResult =
  | { ok: true; orders: CustomerOrder[]; synced: boolean }
  | { ok: false; error: string; status?: number };

export async function fetchMyOrders(): Promise<FetchMyOrdersResult> {
  try {
    const res = await fetch("/api/orders", { credentials: "same-origin", cache: "no-store" });
    const data = (await res.json()) as { orders?: CustomerOrder[]; synced?: boolean; error?: string };
    if (res.status === 401) {
      return { ok: true, orders: [], synced: false };
    }
    if (!res.ok) {
      return { ok: false, error: data.error ?? "Could not load orders", status: res.status };
    }
    return { ok: true, orders: data.orders ?? [], synced: Boolean(data.synced) };
  } catch {
    return { ok: false, error: "Network error" };
  }
}

export type TrackOrderResult =
  | { ok: true; order: CustomerOrder }
  | { ok: false; error: string; notFound?: boolean };

export async function trackOrderByEmail(orderRaw: string, email: string): Promise<TrackOrderResult> {
  const { normalizeOrderNumberInput } = await import("@/lib/orders/order-number");
  try {
    const res = await fetch("/api/orders/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderNumber: normalizeOrderNumberInput(orderRaw),
        email: email.trim().toLowerCase(),
      }),
      credentials: "same-origin",
    });
    const data = (await res.json()) as { found?: boolean; order?: CustomerOrder; error?: string };
    if (res.status === 404 || !data.found) {
      return { ok: false, error: "No order found for that number and email.", notFound: true };
    }
    if (!res.ok) {
      return { ok: false, error: data.error ?? "Could not look up order" };
    }
    if (!data.order) {
      return { ok: false, error: "Invalid order response" };
    }
    return { ok: true, order: data.order };
  } catch {
    return { ok: false, error: "Network error — try again" };
  }
}
