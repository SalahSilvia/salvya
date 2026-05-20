"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AccountBackButton } from "@/components/account/AccountBackButton";
import type { RefundEligibility } from "@/lib/orders/refund-policy";
import type { CustomerOrder } from "@/lib/orders/types";

type RefundListItem = {
  order: CustomerOrder;
  eligibility: RefundEligibility;
  timelineSummary: string;
};

export function RefundsListView() {
  const [items, setItems] = useState<RefundListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/account/refunds", { credentials: "include", cache: "no-store" });
      const body = (await res.json()) as { ok?: boolean; items?: RefundListItem[]; error?: string };
      if (!res.ok || !body.ok) throw new Error(body.error ?? "Could not load refunds");
      setItems(body.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="min-h-dvh bg-[#050508] text-white">
      <header className="border-b border-white/10 px-5 pb-5 pt-6">
        <AccountBackButton fallbackHref="/orders" />
        <h1 className="mt-4 text-[22px] font-semibold tracking-tight text-white">Refunds</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-white/50">
          Request refunds before production starts. Every order shows eligibility and why.
        </p>
      </header>

      <div className="space-y-4 px-5 py-6">
        {loading ? <p className="text-[14px] text-white/45">Loading orders…</p> : null}
        {error ? (
          <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-[14px] text-rose-100">
            {error}
          </p>
        ) : null}

        {!loading && !error && items.length === 0 ? (
          <p className="text-[14px] text-white/45">No orders on your account yet.</p>
        ) : null}

        <ul className="space-y-3">
          {items.map(({ order, eligibility, timelineSummary }) => (
            <li key={order.id}>
              <Link
                href={`/account/refunds/${order.id}`}
                className="block rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-white/20"
              >
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[13px] text-white/80">{order.orderNumber}</p>
                    <p className="mt-1 truncate text-[15px] font-medium text-white">
                      {order.lineItem.displayTitle}
                    </p>
                    <p className="mt-1 text-[12px] text-white/45">{timelineSummary}</p>
                  </div>
                  <EligibilityPill eligible={eligibility.eligible} code={eligibility.code} />
                </div>
                {!eligibility.eligible ? (
                  <p className="mt-3 text-[12px] leading-relaxed text-white/45">{eligibility.reason}</p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function EligibilityPill({ eligible, code }: { eligible: boolean; code: string }) {
  if (eligible) {
    return (
      <span className="shrink-0 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
        Eligible
      </span>
    );
  }
  if (code === "refund_in_progress" || code === "already_refunded") {
    return (
      <span className="shrink-0 rounded-full bg-sky-500/15 px-2.5 py-1 text-[11px] font-semibold text-sky-200">
        In progress
      </span>
    );
  }
  return (
    <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/55">
      Not eligible
    </span>
  );
}
