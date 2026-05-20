export type OrderWorkflowTab =
  | "all"
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export function parseOrderWorkflowTab(raw: string | null): OrderWorkflowTab {
  const v = (raw ?? "all").toLowerCase();
  if (
    v === "pending" ||
    v === "paid" ||
    v === "processing" ||
    v === "shipped" ||
    v === "delivered" ||
    v === "cancelled"
  ) {
    return v;
  }
  return "all";
}
