"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useSupabaseUser } from "@/components/member/useSupabaseUser";
import {
  fulfillmentStatusHeadline,
  fulfillmentStatusLabel,
  fulfillmentStatusTone,
} from "@/lib/orders/display";
import { fetchMyOrders } from "@/lib/orders/fetch-orders-client";
import { readLastOrderSession, type LastOrderSession } from "@/lib/orders/last-order-session";
import type { CustomerOrder, OrderFulfillmentStatus } from "@/lib/orders/types";

const journeySteps = ["Ordered", "Preparing", "Shipped", "Delivered"] as const;

function fulfillmentStepIndex(status: OrderFulfillmentStatus): number {
  if (status === "preparing") return 1;
  if (status === "shipped") return 2;
  if (status === "delivered") return 3;
  return 0;
}

function fromCustomerOrder(order: CustomerOrder): LastOrderSession {
  const li = order.lineItem;
  return {
    orderNumber: order.orderNumber,
    buyerEmail: order.shipping.buyerEmail,
    displayTitle: li.displayTitle,
    colorLabel: li.colorLabel,
    size: li.size,
    qty: li.qty,
    fulfillmentStatus: order.fulfillmentStatus,
    placedAt: order.createdAt,
  };
}

function trackHrefFor(session: LastOrderSession): string {
  return `/track-order?order=${encodeURIComponent(session.orderNumber)}&email=${encodeURIComponent(session.buyerEmail)}`;
}

export function HomeActiveOrderTrack() {
  const reduceMotion = useReducedMotion();
  const { user } = useSupabaseUser();
  const [session, setSession] = useState<LastOrderSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setLoading(true);
      if (user) {
        const result = await fetchMyOrders();
        if (cancelled) return;
        if (result.ok && result.orders.length > 0) {
          const active = result.orders.find(
            (o) => o.fulfillmentStatus !== "delivered" && o.fulfillmentStatus !== "cancelled",
          );
          if (active) {
            setSession(fromCustomerOrder(active));
            setLoading(false);
            return;
          }
        }
      }

      const local = readLastOrderSession();
      if (!cancelled) {
        setSession(local);
        setLoading(false);
      }
    })();

    const onStorage = () => {
      const local = readLastOrderSession();
      if (local) setSession(local);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("salvya-last-order-updated", onStorage);

    return () => {
      cancelled = true;
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("salvya-last-order-updated", onStorage);
    };
  }, [user]);

  const activeIdx = useMemo(
    () => (session ? fulfillmentStepIndex(session.fulfillmentStatus) : 0),
    [session],
  );

  if (
    loading ||
    !session ||
    session.fulfillmentStatus === "cancelled" ||
    session.fulfillmentStatus === "delivered"
  ) {
    return null;
  }

  const href = trackHrefFor(session);

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto w-full max-w-md px-4 pb-2 pt-1"
      aria-label="Your active order"
    >
      <div className="overflow-hidden rounded-2xl border border-[#2D6BFF]/25 bg-gradient-to-br from-[#2D6BFF]/[0.14] via-white/[0.04] to-transparent p-4 shadow-[0_20px_50px_-28px_rgba(45,107,255,0.55)] backdrop-blur-md">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8eb6ff]">Your order</p>
            <p className="mt-1 font-mono text-[12px] font-semibold text-white/90">{session.orderNumber}</p>
            <p className="mt-1 line-clamp-2 text-[13px] font-medium leading-snug text-white/75">
              {session.qty}× {session.displayTitle} · {session.colorLabel} · {session.size}
            </p>
          </div>
          <span
            className={`shrink-0 text-[10px] font-bold uppercase tracking-wide ${fulfillmentStatusTone(session.fulfillmentStatus)}`}
          >
            {fulfillmentStatusLabel(session.fulfillmentStatus)}
          </span>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-[11px] font-medium text-white/45">
            {fulfillmentStatusHeadline(session.fulfillmentStatus)}
          </p>
          <div className="relative flex justify-between gap-1">
            <div className="absolute left-[10%] right-[10%] top-[9px] h-px bg-white/10" aria-hidden />
            {journeySteps.map((label, i) => {
              const active = i <= activeIdx;
              return (
                <div key={label} className="relative z-[1] flex min-w-0 flex-1 flex-col items-center">
                  <span
                    className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border text-[9px] font-bold ${
                      active
                        ? "border-[#2D6BFF]/50 bg-[#2D6BFF]/30 text-white"
                        : "border-white/10 bg-black/40 text-white/35"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="mt-1.5 max-w-[3.25rem] truncate text-center text-[9px] font-medium text-white/50">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <Link
          href={href}
          className="mt-4 flex min-h-[44px] w-full items-center justify-center rounded-xl bg-white text-[13px] font-semibold text-[#0a0e18] shadow-[0_10px_28px_-12px_rgba(255,255,255,0.35)] transition-transform active:scale-[0.99]"
        >
          Track order →
        </Link>
      </div>
    </motion.section>
  );
}
