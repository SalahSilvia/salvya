import type { RefundEligibility } from "@/lib/orders/refund-policy";
import type { CustomerOrderActions } from "@/lib/orders/customer-order-actions";
import type { CustomerOrder } from "@/lib/orders/types";

export type AccountOrderListItem = {
  order: CustomerOrder;
  eligibility: RefundEligibility;
  actions: CustomerOrderActions;
  timelineSummary: string;
};

export type FetchAccountOrdersResult =
  | { ok: true; items: AccountOrderListItem[] }
  | { ok: false; error: string; status?: number };

export async function fetchAccountOrders(): Promise<FetchAccountOrdersResult> {
  try {
    const res = await fetch("/api/account/orders", { credentials: "include", cache: "no-store" });
    const data = (await res.json()) as { ok?: boolean; items?: AccountOrderListItem[]; error?: string };
    if (!res.ok || !data.ok) {
      return { ok: false, error: data.error ?? "Could not load orders", status: res.status };
    }
    return { ok: true, items: data.items ?? [] };
  } catch {
    return { ok: false, error: "Network error" };
  }
}
