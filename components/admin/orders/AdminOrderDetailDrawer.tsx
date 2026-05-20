"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import {
  adminBtnPrimary,
  adminBtnSecondary,
  adminDrawer,
  adminInputClass,
  adminMuted,
  adminPanelClass,
} from "@/components/admin/admin-theme";
import { AdminSectionHeader } from "@/components/admin/admin-ui";
import { AdminFulfillmentBadge, AdminPaymentBadge } from "@/components/admin/orders/AdminOrderStatusBadge";
import { formatAdminOrderTotal, formatOrderTotalPaid, orderTotalMinor } from "@/lib/admin/order-money";
import { FULFILLMENT_STEPS, fulfillmentStepIndex } from "@/lib/admin/order-status-ui";
import { SHIPPING_CARRIER_OPTIONS } from "@/lib/admin/shipping-carriers";
import { buildCarrierTrackingUrl } from "@/lib/admin/tracking-url";
import type { CustomerOrder, OrderFulfillmentStatus, OrderPaymentStatus } from "@/lib/orders/types";

export type OrderHistoryEntry = {
  id: string;
  fulfillmentStatus: string;
  paymentStatus: string | null;
  previousFulfillment: string | null;
  note: string | null;
  createdAt: string;
};

type Props = {
  order: CustomerOrder;
  history: OrderHistoryEntry[];
  loading: boolean;
  busy: boolean;
  onClose: () => void;
  onPatch: (
    patch: {
      fulfillmentStatus?: OrderFulfillmentStatus;
      paymentStatus?: OrderPaymentStatus;
      note?: string;
      trackingNumber?: string;
      carrier?: string;
      trackingUrl?: string;
    },
  ) => Promise<void>;
  onRefund?: (reason: string) => Promise<void>;
};

function DetailSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className={`${adminPanelClass} p-4 sm:p-5`}>
      <AdminSectionHeader title={title} description={description} /><div className="mt-4">{children}</div>
    </section>
  );
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function CopyChip({
  label,
  copyKey,
  value,
  copiedKey,
  onCopied,
}: {
  label: string;
  copyKey: string;
  value: string;
  copiedKey: string | null;
  onCopied: (key: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        void copyText(value).then((ok) => {
          if (ok) onCopied(copyKey);
        });
      }}
      className="inline-flex items-center gap-1.5 rounded-lg border border-[#e3e5e7] bg-[#fafbfb] px-3 py-1.5 text-[12px] font-semibold text-[#202223] transition-colors hover:border-[#2D6BFF]/40 hover:bg-[#eef4ff]"
    >
      <svg className="h-3.5 w-3.5 text-[#6d7175]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 8V5a2 2 0 012-2h7a2 2 0 012 2v7a2 2 0 01-2 2h-3M6 10h7a2 2 0 012 2v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-7a2 2 0 012-2z"
        />
      </svg>
      {copiedKey === copyKey ? "Copied" : label}
    </button>
  );
}

export function AdminOrderDetailDrawer({ order, history, loading, busy, onClose, onPatch, onRefund }: Props) {
  const [note, setNote] = useState("");
  const [tracking, setTracking] = useState(order.shipping.trackingNumber ?? "");
  const [carrier, setCarrier] = useState(order.shipping.carrier ?? "dhl");
  const [trackingUrl, setTrackingUrl] = useState(order.shipping.trackingUrl ?? "");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    setTracking(order.shipping.trackingNumber ?? "");
    setCarrier(order.shipping.carrier ?? "dhl");
    setTrackingUrl(order.shipping.trackingUrl ?? "");
  }, [order.id, order.shipping.trackingNumber, order.shipping.carrier, order.shipping.trackingUrl]);

  const suggestedUrl = buildCarrierTrackingUrl(carrier, tracking) ?? "";
  const paidMinor = orderTotalMinor(order);
  const step = fulfillmentStepIndex(order.fulfillmentStatus);
  const cancelled = order.fulfillmentStatus === "cancelled";
  const trackingHref = order.shipping.trackingUrl || trackingUrl || suggestedUrl;

  const addressBlock = [
    order.shipping.buyerName,
    order.shipping.buyerAddress,
    order.shipping.buyerCity,
    order.shipping.buyerCountry,
  ]
    .filter(Boolean)
    .join("\n");

  const markCopied = (key: string) => {
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <>
      <button type="button" className="fixed inset-0 z-[80] bg-black/45 backdrop-blur-[2px]" aria-label="Close" onClick={onClose} />
      <aside className={adminDrawer} role="dialog" aria-modal="true" aria-labelledby="admin-order-detail-title">
        <header className="shrink-0 border-b border-[#e3e5e7] bg-[#fafbfb] px-5 py-4"><div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#2D6BFF]">Order detail</p>
              <h2 id="admin-order-detail-title" className="mt-1 truncate font-mono text-[1.25rem] font-semibold text-[#202223]">
                {order.orderNumber}
              </h2>
              <p className={`mt-1 text-[12px] ${adminMuted}`}>{new Date(order.createdAt).toLocaleString()}</p>
              <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p className="text-[1.35rem] font-semibold tabular-nums text-emerald-700">{formatAdminOrderTotal(order)}</p>
                {paidMinor.currency !== "EUR" ? (
                  <p className={`text-[12px] ${adminMuted}`}>{formatOrderTotalPaid(order)} charged</p>
                ) : null}
              </div><div className="mt-2 flex flex-wrap gap-2">
                <AdminPaymentBadge status={order.paymentStatus} />
                <AdminFulfillmentBadge status={order.fulfillmentStatus} />
                {loading ? (
                  <span className="inline-flex items-center rounded-full border border-[#e3e5e7] bg-white px-2.5 py-0.5 text-[11px] font-medium text-[#6d7175]">
                    Syncing…
                  </span>
                ) : null}
              </div>
            </div>
            <button type="button" onClick={onClose} className={`shrink-0 ${adminBtnSecondary} min-h-[38px] px-3`} aria-label="Close order detail">
              Close
            </button>
          </div>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto bg-[#f6f6f7] px-4 py-4 sm:px-5 sm:py-5">
          {!cancelled ? (
            <section className={`${adminPanelClass} p-4 sm:p-5`}>
              <AdminSectionHeader title="Fulfillment progress" description="Where this order sits in the pipeline" />
              <ol className="mt-4 grid gap-2 sm:grid-cols-4">
                {FULFILLMENT_STEPS.map((s, i) => {
                  const done = i <= step;
                  const active = i === step;
                  return (
                    <li
                      key={s.id}
                      className={`rounded-lg border px-3 py-2.5 text-center transition-colors ${
                        active
                          ? "border-[#2D6BFF] bg-[#eef4ff] shadow-sm"
                          : done
                            ? "border-[#b4ccf7] bg-white"
                            : "border-[#e3e5e7] bg-[#fafbfb]"
                      }`}
                    >
                      <span
                        className={`mx-auto mb-1.5 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                          done ? "bg-[#2D6BFF] text-white" : "bg-[#e3e5e7] text-[#6d7175]"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span className={`block text-[11px] font-semibold ${done ? "text-[#2D6BFF]" : "text-[#8c9196]"}`}>
                        {s.label}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </section>
          ) : (<div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] font-medium text-rose-900">
              This order was cancelled.
            </div>
          )}

          <DetailSection title="Quick copy" description="Paste into shipping tools or support replies">
            <div className="flex flex-wrap gap-2">
              <CopyChip label="Order #" copyKey="order" value={order.orderNumber} copiedKey={copiedKey} onCopied={markCopied} />
              <CopyChip label="Email" copyKey="email" value={order.shipping.buyerEmail} copiedKey={copiedKey} onCopied={markCopied} />
              <CopyChip label="Address" copyKey="address" value={addressBlock} copiedKey={copiedKey} onCopied={markCopied} />
            </div>
          </DetailSection>

          <div className="grid gap-4 lg:grid-cols-2">
            <DetailSection title="Customer" description="Buyer contact">
              <p className="text-[15px] font-semibold text-[#202223]">{order.shipping.buyerName}</p>
              <a href={`mailto:${order.shipping.buyerEmail}`} className="mt-1 inline-block text-[13px] font-semibold text-[#2D6BFF] hover:underline">
                {order.shipping.buyerEmail}
              </a>
              {order.shipping.buyerPhone ? (
                <p className={`mt-2 text-[13px] ${adminMuted}`}>{order.shipping.buyerPhone}</p>
              ) : null}
            </DetailSection>

            <DetailSection title="Ship to" description="Delivery address">
              <p className="whitespace-pre-line text-[13px] leading-relaxed text-[#202223]">{addressBlock}</p>
              {order.shipping.shippedAt ? (
                <p className={`mt-3 text-[12px] ${adminMuted}`}>Shipped {new Date(order.shipping.shippedAt).toLocaleString()}</p>
              ) : null}
            </DetailSection>
          </div>

          <DetailSection title="Tracking" description="Carrier details — saved when you mark shipped">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-[#6d7175]">Carrier</span>
                <select className={`mt-1.5 min-h-[42px] w-full ${adminInputClass}`} value={carrier} onChange={(e) => setCarrier(e.target.value)}>
                  {SHIPPING_CARRIER_OPTIONS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-[#6d7175]">Tracking number</span>
                <input
                  className={`mt-1.5 min-h-[42px] w-full ${adminInputClass}`}
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value)}
                  placeholder="Carrier tracking ID"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-[#6d7175]">Tracking URL</span>
                <input
                  className={`mt-1.5 min-h-[42px] w-full ${adminInputClass}`}
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  placeholder={suggestedUrl || "https://…"}
                />
              </label>
            </div>
            {suggestedUrl && trackingUrl !== suggestedUrl ? (
              <button
                type="button"
                className="mt-2 text-[12px] font-semibold text-[#2D6BFF] hover:underline"
                onClick={() => setTrackingUrl(suggestedUrl)}
              >
                Use suggested carrier link
              </button>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void onPatch({
                    trackingNumber: tracking.trim(),
                    carrier,
                    trackingUrl: trackingUrl.trim() || suggestedUrl || undefined,
                  })
                }
                className={adminBtnSecondary}
              >
                Save tracking
              </button>
              {trackingHref ? (
                <a href={trackingHref} target="_blank" rel="noopener noreferrer" className={adminBtnSecondary}>
                  Open tracking
                </a>
              ) : null}
            </div>
          </DetailSection>

          <DetailSection title="Line item">
            <div className="flex gap-4 rounded-lg border border-[#e3e5e7] bg-[#fafbfb] p-3">
              {order.lineItem.productImageSrc ? (<div className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-[#e3e5e7] bg-white">
                  <Image src={order.lineItem.productImageSrc} alt="" fill className="object-cover" sizes="80px" />
                </div>
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#202223]">{order.lineItem.displayTitle}</p>
                <p className={`mt-1 text-[12px] ${adminMuted}`}>
                  {order.lineItem.artistSlug} · {order.lineItem.qty}× {order.lineItem.size} · {order.lineItem.colorLabel}
                </p>
                <p className="mt-2 text-[14px] font-semibold tabular-nums text-emerald-700">{order.lineItem.priceLabel}</p>
              </div>
            </div>
          </DetailSection>

          <DetailSection title="Payment" description="Capture IDs and manual payment controls">
            <p className="text-[14px] font-medium capitalize text-[#202223]">
              {order.payment.method === "paypal"
                ? order.payment.instrument === "paypal_card"
                  ? "PayPal · card"
                  : "PayPal · wallet"
                : "Cash on delivery"}
            </p>
            {order.payment.method === "paypal" ? (
              <dl className={`mt-3 space-y-2 rounded-lg border border-[#e3e5e7] bg-[#fafbfb] p-3 text-[12px] ${adminMuted}`}>
                {order.payment.paypalOrderId ? (<div className="flex flex-wrap items-center justify-between gap-2">
                    <dt className="font-semibold text-[#6d7175]">PayPal order</dt>
                    <dd className="font-mono text-[11px] text-[#202223]">{order.payment.paypalOrderId}</dd>
                  </div>
                ) : null}
                {order.payment.paypalCaptureId ? (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <dt className="font-semibold text-[#6d7175]">Capture</dt>
                    <dd className="font-mono text-[11px] text-[#202223]">{order.payment.paypalCaptureId}</dd>
                  </div>
                ) : null}
                {order.payment.paypalVerifiedAt ? (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <dt className="font-semibold text-[#6d7175]">Verified</dt>
                    <dd>{new Date(order.payment.paypalVerifiedAt).toLocaleString()}</dd>
                  </div>
                ) : null}
              </dl>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              {order.payment.method === "paypal" && order.payment.paypalOrderId ? (
                <>
                  <CopyChip
                    label="PayPal order id"
                    copyKey="paypal-order"
                    value={order.payment.paypalOrderId}
                    copiedKey={copiedKey}
                    onCopied={markCopied}
                  />
                  {order.payment.paypalCaptureId ? (
                    <CopyChip
                      label="Capture id"
                      copyKey="paypal-capture"
                      value={order.payment.paypalCaptureId}
                      copiedKey={copiedKey}
                      onCopied={markCopied}
                    />
                  ) : null}
                </>
              ) : null}
              {onRefund &&
              (order.payment.method === "paypal" || order.payment.method === "cod") &&
              (order.paymentStatus === "paid" ||
                order.paymentStatus === "cod_pending" ||
                order.paymentStatus === "refund_requested") &&
              order.refundStatus !== "refunded" ? (
                <button
                  type="button"
                  disabled={busy || order.productionStatus === "in_production" || order.productionStatus === "shipped"}
                  onClick={() => {
                    const reason = window.prompt("Refund reason (required for audit trail):", note || "");
                    if (!reason?.trim()) return;
                    void onRefund(reason.trim());
                  }}
                  className="inline-flex items-center rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-[12px] font-semibold text-amber-900 disabled:opacity-45"
                >
                  {order.refundStatus === "requested" ? "Execute refund" : "Refund order"}
                </button>
              ) : null}
              <button
                type="button"
                disabled={busy || order.paymentStatus === "paid"}
                onClick={() => void onPatch({ paymentStatus: "paid", note: note || "Marked paid" })}
                className={adminBtnSecondary}
              >
                Mark paid
              </button>
              <button
                type="button"
                disabled={busy || order.paymentStatus === "failed"}
                onClick={() => void onPatch({ paymentStatus: "failed", note: note || "Payment failed" })}
                className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[13px] font-semibold text-rose-800 disabled:opacity-45"
              >
                Mark failed
              </button>
            </div>
          </DetailSection>

          <DetailSection title="Internal note" description="Attached to the next status change">
            <textarea
              className={`min-h-[80px] w-full resize-y rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-[13px] text-[#202223] focus:border-[#2D6BFF] focus:outline-none focus:ring-2 focus:ring-[#2D6BFF]/25`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Warehouse note, customer request, refund context…"
            />
          </DetailSection>

          <DetailSection title="Activity timeline" description="Fulfillment and payment history">
            <ul className="space-y-0">
              {history.length ? (
                history.map((h, i) => (
                  <li key={h.id} className="relative flex gap-3 pb-4 last:pb-0">
                    {i < history.length - 1 ? (
                      <span className="absolute left-[11px] top-6 bottom-0 w-px bg-[#e3e5e7]" aria-hidden />
                    ) : null}
                    <span className="relative z-[1] mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-[#2D6BFF] bg-white text-[10px] font-bold text-[#2D6BFF]">
                      {history.length - i}
                    </span>
                    <div className="min-w-0 flex-1 rounded-lg border border-[#e3e5e7] bg-[#fafbfb] px-3 py-2.5">
                      <p className="font-semibold capitalize text-[#202223]">{h.fulfillmentStatus.replace(/_/g, " ")}</p>
                      <p className={`mt-0.5 text-[11px] ${adminMuted}`}>{new Date(h.createdAt).toLocaleString()}</p>
                      {h.previousFulfillment ? (
                        <p className={`mt-1 text-[12px] ${adminMuted}`}>From {h.previousFulfillment}</p>
                      ) : null}
                      {h.note ? <p className="mt-1.5 text-[12px] font-medium text-amber-900">{h.note}</p> : null}
                    </div>
                  </li>
                ))
              ) : (
                <li className={`rounded-lg border border-dashed border-[#e3e5e7] px-4 py-6 text-center text-[13px] ${adminMuted}`}>
                  No history yet — status changes appear here.
                </li>
              )}
            </ul>
          </DetailSection>
        </div>

        {!cancelled ? (
          <footer className="shrink-0 border-t border-[#e3e5e7] bg-white px-4 py-4 sm:px-5">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-[#6d7175]">Fulfillment actions</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy || order.fulfillmentStatus === "preparing"}
                onClick={() => void onPatch({ fulfillmentStatus: "preparing", note: note || undefined })}
                className={adminBtnSecondary}
              >
                Processing
              </button>
              <button
                type="button"
                disabled={busy || order.fulfillmentStatus === "shipped"}
                onClick={() =>
                  void onPatch({
                    fulfillmentStatus: "shipped",
                    note: note || (tracking.trim() ? `Shipped · ${tracking.trim()}` : undefined),
                    trackingNumber: tracking.trim() || undefined,
                    carrier,
                    trackingUrl: trackingUrl.trim() || suggestedUrl || undefined,
                  })
                }
                className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-[13px] font-semibold text-emerald-800 disabled:opacity-45"
              >
                Mark shipped
              </button>
              <button
                type="button"
                disabled={busy || order.fulfillmentStatus === "delivered"}
                onClick={() => void onPatch({ fulfillmentStatus: "delivered", note: note || undefined })}
                className={`${adminBtnPrimary} disabled:opacity-45`}
              >
                Mark delivered
              </button>
              <button
                type="button"
                disabled={busy || order.fulfillmentStatus === "cancelled"}
                onClick={() => {
                  if (!window.confirm("Cancel this order?")) return;
                  void onPatch({ fulfillmentStatus: "cancelled", note: note || "Cancelled by admin" });
                }}
                className="ml-auto rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-[13px] font-semibold text-rose-800 disabled:opacity-45"
              >
                Cancel
              </button>
            </div>
          </footer>
        ) : null}
      </aside>
    </>
  );
}
