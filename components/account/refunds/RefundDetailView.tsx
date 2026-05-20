"use client";

import { useCallback, useEffect, useState } from "react";
import { AccountBackButton } from "@/components/account/AccountBackButton";
import type { RefundEligibility } from "@/lib/orders/refund-policy";
import type { RefundTimelineStep } from "@/lib/orders/refund-timeline";
import type { CustomerOrder } from "@/lib/orders/types";

type DetailPayload = {
  order: CustomerOrder;
  eligibility: RefundEligibility;
  timeline: {
    steps: RefundTimelineStep[];
    currentLabel: string;
    estimatedNote: string | null;
  };
};

export function RefundDetailView({ orderId }: { orderId: string }) {
  const [data, setData] = useState<DetailPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/account/refunds/${orderId}`, {
        credentials: "include",
        cache: "no-store",
      });
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

  const requestRefund = async () => {
    if (!reason.trim()) {
      setSubmitMsg("Please describe why you are requesting a refund.");
      return;
    }
    setSubmitting(true);
    setSubmitMsg(null);
    try {
      const res = await fetch("/api/account/refunds/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orderId, reason: reason.trim() }),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string; refundReferenceId?: string };
      if (!res.ok || !body.ok) throw new Error(body.error ?? "Request failed");
      setSubmitMsg(
        body.refundReferenceId
          ? `Refund requested. Reference ${body.refundReferenceId}`
          : "Refund requested. We will review it shortly.",
      );
      await load();
    } catch (e) {
      setSubmitMsg(e instanceof Error ? e.message : "Request failed");
    } finally {
      setSubmitting(false);
    }
  };

  const order = data?.order;
  const eligibility = data?.eligibility;
  const timeline = data?.timeline;

  return (
    <div className="min-h-dvh bg-[#050508] text-white">
      <header className="border-b border-white/10 px-5 pb-5 pt-6">
        <AccountBackButton fallbackHref="/orders" />
        <h1 className="mt-4 text-[22px] font-semibold tracking-tight text-white">Refund tracking</h1>
        {order ? (
          <p className="mt-1 font-mono text-[13px] text-white/55">{order.orderNumber}</p>
        ) : null}
      </header>

      <div className="space-y-6 px-5 py-6">
        {loading ? <p className="text-[14px] text-white/45">Loading…</p> : null}
        {error ? (
          <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-[14px] text-rose-100">
            {error}
          </p>
        ) : null}

        {order && eligibility && timeline ? (
          <>
            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <h2 className="text-[13px] font-semibold uppercase tracking-wide text-white/40">Order</h2>
              <p className="mt-2 text-[16px] font-medium">{order.lineItem.displayTitle}</p>
              <dl className="mt-3 grid gap-2 text-[13px] text-white/55">
                <div className="flex justify-between gap-4">
                  <dt>Payment</dt>
                  <dd className="text-white/85">
                    {order.payment.method === "paypal" ? "PayPal" : "Cash on delivery"}
                  </dd>
                </div>
                <ProductionRows order={order} eligibility={eligibility} />
                {order.refundReferenceId ? (
                  <div className="flex justify-between gap-4">
                    <dt>Refund reference</dt>
                    <dd className="font-mono text-[12px] text-white/85">{order.refundReferenceId}</dd>
                  </div>
                ) : null}
              </dl>
            </section>

            <section>
              <h2 className="text-[13px] font-semibold uppercase tracking-wide text-white/40">Status</h2>
              <p className="mt-2 text-[15px] text-white">{timeline.currentLabel}</p>
              {timeline.estimatedNote ? (
                <p className="mt-1 text-[13px] text-white/45">{timeline.estimatedNote}</p>
              ) : null}
              <ol className="mt-4 space-y-0">
                {timeline.steps.map((step) => (
                  <li key={step.id} className="relative flex gap-3 pb-6 last:pb-0">
                    <span
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                        step.state === "done"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : step.state === "current"
                            ? "bg-sky-500/25 text-sky-100 ring-2 ring-sky-400/40"
                            : step.state === "failed"
                              ? "bg-rose-500/20 text-rose-200"
                              : "bg-white/10 text-white/35"
                      }`}
                    >
                      {step.state === "done" ? "✓" : step.state === "failed" ? "!" : "·"}
                    </span>
                    <div>
                      <p className="text-[14px] font-medium text-white">{step.label}</p>
                      {step.at ? (
                        <p className="text-[12px] text-white/40">{new Date(step.at).toLocaleString()}</p>
                      ) : null}
                      {step.detail ? (
                        <p className="mt-1 text-[12px] leading-relaxed text-white/50">{step.detail}</p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <h2 className="text-[13px] font-semibold uppercase tracking-wide text-white/40">
                Eligibility
              </h2>
              <p className="mt-2 text-[12px] font-medium uppercase tracking-wide text-white/40">
                Policy: {eligibility.policyReason}
              </p>
              <p
                className={`mt-2 text-[14px] ${eligibility.eligible ? "text-emerald-300" : "text-white/70"}`}
              >
                {eligibility.eligible ? "You can request a refund for this order." : eligibility.reason}
              </p>
              {eligibility.refundDeadlineAt ? (
                <p className="mt-2 text-[12px] text-white/45">
                  Refund deadline: {new Date(eligibility.refundDeadlineAt).toLocaleString()}
                </p>
              ) : null}
            </section>

            {eligibility.eligible ? (
              <section className="space-y-3">
                <label className="block text-[13px] font-medium text-white/70" htmlFor="refund-reason">
                  Reason for refund
                </label>
                <textarea
                  id="refund-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-[14px] text-white placeholder:text-white/30"
                  placeholder="Tell us why you need to cancel…"
                />
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => void requestRefund()}
                  className="w-full rounded-xl bg-white py-3 text-[15px] font-semibold text-black disabled:opacity-50"
                >
                  {submitting ? "Submitting…" : "Request refund"}
                </button>
                {submitMsg ? <p className="text-[13px] text-white/60">{submitMsg}</p> : null}
              </section>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}

function ProductionRows({
  order,
  eligibility,
}: {
  order: CustomerOrder;
  eligibility: RefundEligibility;
}) {
  return (
    <>
      <div className="flex justify-between gap-4">
        <dt>Production</dt>
        <dd className="capitalize text-white/85">{order.productionStatus.replace(/_/g, " ")}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt>Production starts</dt>
        <dd className="text-white/85">
          {eligibility.productionStartsAt
            ? new Date(eligibility.productionStartsAt).toLocaleString()
            : "Not scheduled"}
        </dd>
      </div>
    </>
  );
}
