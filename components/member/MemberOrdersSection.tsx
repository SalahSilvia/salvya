"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SalvyaMemberOrdersSkeleton } from "@/components/skeleton";
import { useSupabaseUser } from "@/components/member/useSupabaseUser";
import {
  fulfillmentStatusLabel,
  fulfillmentStatusTone,
  orderListLabel,
  orderDetailHref,
} from "@/lib/orders/display";
import { fetchMyOrders } from "@/lib/orders/fetch-orders-client";
import type { CustomerOrder } from "@/lib/orders/types";

type Props = {
  variant?: "profile" | "account";
  limit?: number;
};

export function MemberOrdersSection({ variant = "profile", limit = 5 }: Props) {
  const { user } = useSupabaseUser();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const result = await fetchMyOrders();
      if (cancelled) return;
      if (result.ok) {
        setOrders(result.orders.slice(0, limit));
        setSynced(result.synced);
      } else {
        setOrders([]);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, limit]);

  const isProfile = variant === "profile";
  const linkClass = isProfile
    ? "inline-flex text-[13px] font-semibold text-[#9eb6ff] hover:text-[#c9d6ff]"
    : "inline-flex text-[14px] font-semibold text-[#8fa8e8] hover:text-[#b8c9ff]";

  if (!user) {
    return (
      <p className={isProfile ? "mt-3 text-[12px] leading-relaxed text-white/36" : "mt-2 text-[14px] leading-relaxed text-white/48"}>
        Sign in to see orders linked to your account. Guest checkouts can still be tracked with your order number and email.
      </p>
    );
  }

  if (loading) {
    return <SalvyaMemberOrdersSkeleton rows={isProfile ? 3 : 4} />;
  }

  if (orders.length === 0) {
    return (
      <div className={isProfile ? "mt-4 space-y-2" : "mt-2 space-y-3"}>
        <p className={isProfile ? "text-[12px] leading-relaxed text-white/36" : "text-[14px] leading-relaxed text-white/48"}>
          {synced
            ? "No orders on this account yet. After checkout, orders placed while signed in appear here."
            : "Orders are not available right now. Use track order with your SVY reference and checkout email."}
        </p>
        <Link href="/track-order" className={linkClass}>
          Track an order →
        </Link>
      </div>
    );
  }

  return (
    <>
      <ul className={isProfile ? "mt-4 space-y-2.5" : "mt-4 space-y-2"}>
        {orders.map((o) => (
          <li key={o.id}>
            <Link
              href={orderDetailHref(o)}
              className={
                isProfile
                  ? "flex items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 transition-colors hover:border-white/[0.12] hover:bg-white/[0.05]"
                  : "flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 transition-colors hover:bg-white/[0.05]"
              }
            >
              <div className="min-w-0">
                <p className={isProfile ? "m-0 text-[13px] font-semibold text-white/88" : "m-0 text-[14px] font-semibold text-white/90"}>
                  {o.orderNumber}
                </p>
                <p className={isProfile ? "mt-0.5 truncate text-[12px] text-white/42" : "mt-0.5 truncate text-[13px] text-white/45"}>
                  {orderListLabel(o)}
                </p>
              </div>
              <span className={`shrink-0 text-[11px] font-semibold uppercase tracking-wide ${fulfillmentStatusTone(o.fulfillmentStatus)}`}>
                {fulfillmentStatusLabel(o.fulfillmentStatus)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {isProfile ? (
        <p className="mt-3 text-[12px] leading-relaxed text-white/36">
          Salvya fulfillment status — carrier scan events will appear when shipping partners are connected.
        </p>
      ) : null}
    </>
  );
}
