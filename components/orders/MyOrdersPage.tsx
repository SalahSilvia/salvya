"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  OrderJourneyBar,
  OrdersEmpty,
  OrdersErrorBanner,
  OrdersHero,
  OrdersPageShell,
  OrdersPolicyFootnote,
  OrdersSegmentedControl,
  OrdersSkeletonList,
  OrdersStickyHeader,
  PackageThumb,
  PaymentBadge,
} from "@/components/orders/orders-ui";
import { fulfillmentStatusHeadline, orderListLabel } from "@/lib/orders/display";
import { formatOrderTotal } from "@/lib/orders/customer-order-actions";
import { fetchAccountOrders, type AccountOrderListItem } from "@/lib/orders/fetch-account-orders-client";
import { formatNotificationWhen } from "@/lib/notifications/format-time";
type Tab = "active" | "history";

function OrderCard({ item }: { item: AccountOrderListItem }) {
  const { order, actions, eligibility } = item;
  const active = actions.isActive;
  const reduceMotion = useReducedMotion();
  const payMethod = order.payment.method === "cod" ? "cod" : "paypal";

  return (
    <motion.li
      layout={!reduceMotion}
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Link
        href={`/orders/${order.id}`}
        className={`group relative flex overflow-hidden rounded-[1.15rem] border transition-[transform,box-shadow] active:scale-[0.99] ${
          active
            ? "border-slate-200/95 bg-white text-slate-900 shadow-[0_8px_32px_-12px_rgba(15,23,42,0.22),0_0_0_1px_rgba(45,107,255,0.06)]"
            : "border-white/[0.09] bg-gradient-to-br from-white/[0.07] to-white/[0.02] text-white/85 hover:border-white/[0.14]"
        }`}
      >
        <span
          className={`w-1 shrink-0 ${active ? "bg-gradient-to-b from-[#2D6BFF] to-indigo-500" : "bg-white/10"}`}
          aria-hidden
        />

        <div className="flex min-w-0 flex-1 gap-3.5 p-4 pr-3">
          <PackageThumb src={order.lineItem.productImageSrc} variant={active ? "light" : "dark"} />

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className={`font-mono text-[11px] font-semibold tracking-wide ${active ? "text-[#2D6BFF]" : "text-white/40"}`}>
                  {order.orderNumber}
                </p>
                <p
                  className={`mt-1 line-clamp-2 text-[15px] font-semibold leading-snug tracking-[-0.02em] ${
                    active ? "text-slate-900" : "text-white/92"
                  }`}
                >
                  {order.lineItem.displayTitle}
                </p>
              </div>
              <PaymentBadge method={payMethod} variant={active ? "light" : "dark"} />
            </div>

            <p className={`mt-1 text-[12px] ${active ? "text-slate-500" : "text-white/42"}`}>
              {orderListLabel(order)} · <span className="font-semibold">{formatOrderTotal(order)}</span>
            </p>

            <p className={`mt-1.5 text-[11px] ${active ? "text-slate-400" : "text-white/32"}`}>
              {fulfillmentStatusHeadline(order.fulfillmentStatus)} · {formatNotificationWhen(order.createdAt)}
            </p>

            {active ? <OrderJourneyBar status={order.fulfillmentStatus} variant="light" /> : null}

            {actions.canCancel ? (
              <p
                className={`mt-2.5 inline-flex rounded-lg px-2 py-1 text-[10px] font-semibold ${
                  active ? "bg-emerald-50 text-emerald-700" : "bg-emerald-500/15 text-emerald-300"
                }`}
              >
                {eligibility.policyReason} · Cancel available
              </p>
            ) : actions.showReturnsLink ? (
              <p className={`mt-2 text-[10px] ${active ? "text-slate-400" : "text-white/35"}`}>Returns policy (Morocco)</p>
            ) : null}
          </div>

          <ChevronRight
            className={`mt-1 h-5 w-5 shrink-0 self-center transition-transform group-hover:translate-x-0.5 ${
              active ? "text-slate-300" : "text-white/20"
            }`}
          />
        </div>
      </Link>
    </motion.li>
  );
}

export function MyOrdersPage() {
  const [items, setItems] = useState<AccountOrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("active");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchAccountOrders();
    if (result.ok) {
      setItems(result.items);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const activeItems = useMemo(() => items.filter((i) => i.actions.isActive), [items]);
  const historyItems = useMemo(() => items.filter((i) => !i.actions.isActive), [items]);
  const filtered = tab === "active" ? activeItems : historyItems;

  return (
    <OrdersPageShell>
      <OrdersStickyHeader>
        <OrdersHero
          kicker="Your purchases"
          title="My orders"
          subtitle="Invoice, tracking, and cancellation — all in one place."
        />
        <OrdersSegmentedControl
          value={tab}
          onChange={setTab}
          options={[
            { id: "active", label: "In progress", count: activeItems.length },
            { id: "history", label: "History", count: historyItems.length },
          ]}
        />
      </OrdersStickyHeader>

      <main className="relative z-[1] mx-auto w-full max-w-lg flex-1 px-5 py-5 pb-28 sm:px-6">
        {loading ? <OrdersSkeletonList /> : null}
        {error ? <OrdersErrorBanner message={error} /> : null}

        {!loading && !error && filtered.length === 0 ? (
          <OrdersEmpty
            title={tab === "active" ? "No orders in progress" : "No order history yet"}
            description={
              tab === "active"
                ? "When you checkout while signed in, live orders show here with tracking and your invoice."
                : "Completed and cancelled orders will appear here."
            }
            actionHref={tab === "active" ? "/shop" : undefined}
            actionLabel={tab === "active" ? "Start shopping" : undefined}
          />
        ) : null}

        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {filtered.map((item) => (
            <OrderCard key={item.order.id} item={item} />
          ))}
        </ul>

        {!loading && items.length > 0 ? (
          <div className="mt-8">
            <OrdersPolicyFootnote />
          </div>
        ) : null}
      </main>
    </OrdersPageShell>
  );
}
