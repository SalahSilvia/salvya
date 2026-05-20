import type { CustomerOrder, PlaceOrderInput } from "@/lib/orders/types";
import { paymentErrorMessage } from "@/lib/orders/payment-user-message";

export type PlaceOrderResult =
  | { ok: true; order: CustomerOrder; created: boolean }
  | { ok: false; error: string; code?: string; status?: number };

const PLACE_ORDER_TIMEOUT_MS = 45_000;

export async function placeCustomerOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PLACE_ORDER_TIMEOUT_MS);
  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      credentials: "same-origin",
      signal: controller.signal,
    });
    const data = (await res.json()) as {
      order?: CustomerOrder;
      created?: boolean;
      error?: string;
      code?: string;
    };
    if (!res.ok) {
      const raw = data.error ?? "Could not place order";
      return {
        ok: false,
        error: paymentErrorMessage(raw, data.code),
        code: data.code,
        status: res.status,
      };
    }
    if (!data.order) {
      return { ok: false, error: "Invalid order response", status: res.status };
    }
    return { ok: true, order: data.order, created: Boolean(data.created) };
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      return {
        ok: false,
        error: paymentErrorMessage("Order request timed out — check your email or try again", "order_timeout"),
        code: "order_timeout",
      };
    }
    return { ok: false, error: paymentErrorMessage("Network error — try again", "network") };
  } finally {
    clearTimeout(timer);
  }
}
