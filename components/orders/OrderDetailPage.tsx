"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { AccountBackButton } from "@/components/account/AccountBackButton";
import { OrderInvoiceCard } from "@/components/orders/OrderInvoiceCard";
import { OrderInvoiceDownloadButton } from "@/components/orders/OrderInvoiceDownloadButton";
import {
  OrderJourneyBar,
  OrdersCard,
  OrdersErrorBanner,
  OrdersPageShell,
  OrdersSectionLabel,
  OrdersSkeletonList,
  ORDERS_EASE,
  PackageThumb,
  PaymentBadge,
} from "@/components/orders/orders-ui";
import { buildCustomerOrderActions } from "@/lib/orders/customer-order-actions";
import {
  fulfillmentStatusHeadline,
  fulfillmentStatusLabel,
  orderTrackHref,
} from "@/lib/orders/display";
import type { RefundEligibility } from "@/lib/orders/refund-policy";
import type { CustomerOrder } from "@/lib/orders/types";

type DetailPayload = {
  order: CustomerOrder;
  eligibility: RefundEligibility;
  timeline: { currentLabel: string; estimatedNote: string | null };
};

export function OrderDetailPage({ orderId }: { orderId: string }) {
  const [data, setData] = useState<DetailPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/account/refunds/${orderId}`, { credentials: "include", cache: "no-store" });
      const body = (await res.json()) as DetailPayload & { ok?: boolean; error?: string };
      if (!res.ok || body.ok === false) throw new Error(body.error ?? "Not found");
      setData(body);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void load();
  }, [load]);

  const order = data?.order;
  const eligibility = data?.eligibility;
  const actions = order && eligibility ? buildCustomerOrderActions(order, eligibility) : null;
  const payMethod = order?.payment.method === "cod" ? "cod" : "paypal";
  return (
    <OrdersPageShell>
      <header className="border-b border-white/[0.06] px-5 pb-5 pt-[max(1.1rem,env(safe-area-inset-top))] sm:px-6">
        <AccountBackButton fallbackHref="/orders" />
        {order ? (
          <motion.div
            className="mt-5"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: ORDERS_EASE }}
          >
            <div className="flex gap-4">
              <PackageThumb src={order.lineItem.productImageSrc} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-mono text-[12px] font-semibold text-[#8fa8e8]">{order.orderNumber}</p>
                  {payMethod ? <PaymentBadge method={payMethod} /> : null}
                </div>
                <h1 className="mt-1 line-clamp-2 text-[1.2rem] font-semibold leading-snug tracking-[-0.03em] text-white">
                  {order.lineItem.displayTitle}
                </h1>
                <p className="mt-1.5 text-[14px] text-white/55">{fulfillmentStatusHeadline(order.fulfillmentStatus)}</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <h1 className="mt-4 text-[1.35rem] font-semibold tracking-[-0.03em]">Order details</h1>
        )}
      </header>

      <main className="relative z-[1] mx-auto w-full max-w-lg flex-1 space-y-4 px-5 py-6 pb-32 sm:px-6">
        {loading ? <OrdersSkeletonList rows={2} /> : null}
        {error ? <OrdersErrorBanner message={error} /> : null}

        {order && actions && eligibility && data ? (
          <>
            <OrdersCard variant="elevated" className="p-4">
              <OrdersSectionLabel>Status</OrdersSectionLabel>
              <p className="mt-2 text-[17px] font-semibold tracking-[-0.02em] text-white">{data.timeline.currentLabel}</p>
              <p className="mt-1 text-[12px] text-white/45">
                {fulfillmentStatusLabel(order.fulfillmentStatus)}
                {data.timeline.estimatedNote ? ` · ${data.timeline.estimatedNote}` : ""}
              </p>
              <OrderJourneyBar status={order.fulfillmentStatus} />
              <Link
                href={orderTrackHref(order)}
                className="mt-4 inline-flex min-h-[46px] w-full items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.06] text-[14px] font-semibold text-white transition-colors hover:bg-white/[0.09]"
              >
                Track shipment
              </Link>
            </OrdersCard>

            <OrderInvoiceCard order={order} />

            <OrdersCard variant="elevated" className="p-4">
              <OrdersSectionLabel>Cancellation</OrdersSectionLabel>
              <p className="mt-2 text-[13px] leading-relaxed text-white/55">{eligibility.reason}</p>

              {actions.canCancel && actions.cancelHref ? (
                <Link
                  href={actions.cancelHref}
                  className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-[15px] font-semibold text-white shadow-[0_10px_28px_-12px_rgba(244,63,94,0.5)] transition-transform active:scale-[0.99]"
                >
                  {actions.cancelLabel}
                </Link>
              ) : (
                <p className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[13px] text-white/45">
                  {eligibility.code === "window_closed"
                    ? "The 24-hour cancellation window has passed for this order."
                    : eligibility.code === "delivered_no_refund"
                      ? "This order can no longer be refunded online."
                      : "Cancellation is not available for this order right now."}
                </p>
              )}

              {actions.showInvoice ? (
                <OrderInvoiceDownloadButton orderId={order.id} orderNumber={order.orderNumber} />
              ) : null}

              {actions.showReturnsLink ? (
                <Link
                  href={actions.returnsHref}
                  className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-white/[0.12] text-[14px] font-semibold text-white/85 hover:bg-white/[0.06]"
                >
                  Morocco returns policy
                </Link>
              ) : null}
            </OrdersCard>
          </>
        ) : null}
      </main>
    </OrdersPageShell>
  );
}
