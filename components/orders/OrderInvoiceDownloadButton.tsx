"use client";

import { useCallback, useState } from "react";
import { invoicePdfFilename } from "@/lib/orders/generate-order-invoice-pdf";

type Props = {
  orderId: string;
  orderNumber: string;
  variant?: "dark" | "light";
};

export function OrderInvoiceDownloadButton({ orderId, orderNumber, variant = "dark" }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const download = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/account/orders/${orderId}/invoice`, {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Download failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = invoicePdfFilename(orderNumber);
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Download failed");
    } finally {
      setLoading(false);
    }
  }, [orderId, orderNumber]);

  const dark = variant === "dark";

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => void download()}
        disabled={loading}
        className={`inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border text-[15px] font-semibold transition-[transform,opacity] active:scale-[0.99] disabled:opacity-60 ${
          dark
            ? "border-white/[0.14] bg-white/[0.06] text-white hover:bg-white/[0.09]"
            : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
        }`}
      >
        <DownloadIcon className="h-5 w-5 shrink-0 opacity-80" />
        {loading ? "Preparing PDF…" : "Download PDF invoice"}
      </button>
      {error ? <p className="mt-2 text-center text-[12px] text-rose-300">{error}</p> : null}
      <p className={`mt-2 text-center text-[11px] leading-relaxed ${dark ? "text-white/35" : "text-slate-500"}`}>
        Includes SKU / GTIN codes and order details for your records.
      </p>
    </div>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 4v10m0 0 4-4m-4 4-4-4M5 18h14"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
