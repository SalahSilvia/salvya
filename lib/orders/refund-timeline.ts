import type { CustomerOrder } from "@/lib/orders/types";

export type RefundTimelineStepId =
  | "requested"
  | "approved"
  | "processing"
  | "completed"
  | "rejected";

export type RefundTimelineStep = {
  id: RefundTimelineStepId;
  label: string;
  state: "done" | "current" | "upcoming" | "failed";
  at?: string | null;
  detail?: string;
};

export function buildRefundTimeline(order: CustomerOrder): {
  steps: RefundTimelineStep[];
  currentLabel: string;
  estimatedNote: string | null;
} {
  const rejected =
    order.refundStatus === "rejected" ||
    order.refundStatus === "failed" ||
    order.paymentStatus === "refund_rejected";

  const completed =
    order.refundStatus === "refunded" ||
    order.refundStatus === "processed" ||
    order.paymentStatus === "refunded";
  const approved =
    order.refundStatus === "approved" ||
    order.paymentStatus === "refund_approved" ||
    completed;
  const requested =
    Boolean(order.refundRequestedAt) ||
    order.refundStatus === "requested" ||
    order.paymentStatus === "refund_requested" ||
    approved ||
    completed ||
    rejected;

  const requestedState: RefundTimelineStep["state"] = rejected
    ? "done"
    : requested && !approved && !completed
      ? "current"
      : requested
        ? "done"
        : "upcoming";

  const approvedState: RefundTimelineStep["state"] = rejected
    ? "upcoming"
    : approved
      ? "done"
      : requested
        ? "upcoming"
        : "upcoming";

  const processingState: RefundTimelineStep["state"] = rejected
    ? "upcoming"
    : completed
      ? "done"
      : approved
        ? "current"
        : "upcoming";

  const terminalState: RefundTimelineStep["state"] = rejected
    ? "failed"
    : completed
      ? "done"
      : "upcoming";

  const steps: RefundTimelineStep[] = [
    {
      id: "requested",
      label: "Requested",
      state: requestedState,
      at: order.refundRequestedAt ?? null,
    },
    {
      id: "approved",
      label: "Approved",
      state: approvedState,
      at: order.refundStatus === "approved" ? order.refundProcessedAt ?? null : null,
    },
    {
      id: "processing",
      label: "Processing",
      state: processingState,
      at: approved && !completed ? order.refundProcessedAt ?? null : null,
      detail:
        order.payment.method === "paypal" ? "PayPal refund in progress" : "Manual refund processing",
    },
    {
      id: rejected ? "rejected" : "completed",
      label: rejected ? "Rejected" : "Completed",
      state: terminalState,
      at: rejected ? order.refundProcessedAt ?? order.updatedAt : order.refundedAt ?? null,
      detail: rejected
        ? (order.refundReason ?? "Refund request was not approved.")
        : (order.refundReferenceId ?? undefined),
    },
  ];

  let currentLabel = "No refund activity";
  if (completed) currentLabel = "Refund completed";
  else if (rejected) currentLabel = "Refund rejected";
  else if (approved) currentLabel = "Refund processing";
  else if (requested) currentLabel = "Refund requested — under review";

  const estimatedNote =
    !completed && !rejected && (requested || approved)
      ? order.payment.method === "paypal"
        ? "PayPal refunds usually appear in 5–10 business days."
        : "COD refunds are processed manually within 3–5 business days."
      : null;

  return { steps, currentLabel, estimatedNote };
}
