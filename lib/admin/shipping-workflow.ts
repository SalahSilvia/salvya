export type ShippingQueueTab =
  | "all"
  | "ready"
  | "packing"
  | "in_transit"
  | "needs_tracking"
  | "delivered";

export const SHIPPING_QUEUE_TABS: { id: ShippingQueueTab; label: string; hint: string }[] = [
  { id: "ready", label: "Ready to ship", hint: "Paid · awaiting fulfillment" },
  { id: "packing", label: "Packing", hint: "Being prepared" },
  { id: "in_transit", label: "In transit", hint: "Marked shipped" },
  { id: "needs_tracking", label: "Missing tracking", hint: "Shipped without tracking ID" },
  { id: "delivered", label: "Delivered", hint: "Completed deliveries" },
  { id: "all", label: "All active", hint: "Excludes cancelled" },
];

export function parseShippingQueue(raw: string | null): ShippingQueueTab | null {
  const v = (raw ?? "").toLowerCase();
  if (
    v === "ready" ||
    v === "packing" ||
    v === "in_transit" ||
    v === "needs_tracking" ||
    v === "delivered" ||
    v === "all"
  ) {
    return v;
  }
  return null;
}
