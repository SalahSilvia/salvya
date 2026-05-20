"use client";

import { checkoutCountryLabel } from "@/lib/checkout-country";
import { formatOrderTotal } from "@/lib/orders/customer-order-actions";
import type { CustomerOrder, OrderLineItem } from "@/lib/orders/types";

function orderLines(order: CustomerOrder): OrderLineItem[] {
  const bag = order.lineItem.bagLines;
  if (bag?.length) return bag;
  return [order.lineItem];
}

function paymentLabel(order: CustomerOrder): string {
  if (order.payment.method === "cod") return "Cash on delivery";
  return order.payment.instrument === "paypal_card" ? "PayPal · Card" : "PayPal";
}

type Props = {
  order: CustomerOrder;
};

export function OrderInvoiceCard({ order }: Props) {
  const lines = orderLines(order);
  const total = formatOrderTotal(order);
  const placed = new Date(order.createdAt).toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section className="overflow-hidden rounded-[1.15rem] border border-slate-200/95 bg-white text-slate-900 shadow-[0_12px_40px_-16px_rgba(15,23,42,0.2)]">
      <div className="relative overflow-hidden bg-[#050508] px-5 py-4 sm:px-6">
        <div
          className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-[#2D6BFF]/30 blur-2xl"
          aria-hidden
        />
        <p className="relative text-[10px] font-bold uppercase tracking-[0.2em] text-[#8fa8e8]">Invoice</p>
        <p className="relative mt-1 font-mono text-lg font-semibold text-white">{order.orderNumber}</p>
        <p className="relative mt-0.5 text-[12px] text-white/50">Placed {placed}</p>
      </div>

      <div className="px-5 py-4 sm:px-6">
        <table className="w-full border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wide text-slate-400">
              <th className="pb-2 pr-2">Item</th>
              <th className="pb-2 px-2 text-center">Qty</th>
              <th className="pb-2 pl-2 text-right">Line</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, i) => (
              <tr key={`${line.variantId}-${i}`} className="border-b border-slate-50 last:border-0">
                <td className="py-3 pr-2">
                  <p className="font-semibold text-slate-900">{line.displayTitle}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {line.colorLabel} · {line.size} · {line.kindLabel}
                  </p>
                </td>
                <td className="py-3 px-2 text-center tabular-nums text-slate-600">{line.qty}</td>
                <td className="py-3 pl-2 text-right text-[12px] font-medium text-slate-800">{line.priceLabel}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="mt-4 space-y-2 border-t border-dashed border-slate-200 pt-4 text-[12px]">
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">Ship to</dt>
            <dd className="text-right font-medium text-slate-800">
              {order.shipping.buyerName}
              <br />
              <span className="font-normal text-slate-600">
                {order.shipping.buyerCity}, {checkoutCountryLabel(order.shipping.buyerCountry)}
              </span>
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">Payment</dt>
            <dd className="font-medium text-slate-800">{paymentLabel(order)}</dd>
          </div>
          <div className="flex justify-between gap-3 border-t border-slate-100 pt-3">
            <dt className="text-[13px] font-semibold text-slate-700">Total</dt>
            <dd className="text-[15px] font-bold tabular-nums text-slate-900">{total}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
