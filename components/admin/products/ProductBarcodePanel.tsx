"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { adminBtnSecondary, adminMuted } from "@/components/admin/admin-theme";
import {
  formatBarcodeDisplayText,
  formatSkuDisplayText,
  resolveProductBarcodeValue,
} from "@/lib/barcode/product-barcode";
import { isLegacyTextSku } from "@/lib/barcode/salvya-gtin";
import { downloadProductBarcodePng, renderProductBarcodeCanvas } from "@/lib/barcode/render-product-barcode";

type Props = {
  sku: string;
  slug: string;
  artistSlug: string;
  category: string;
  title?: string;
  compact?: boolean;
};

export function ProductBarcodePanel({ sku, slug, artistSlug, category, title, compact }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [displayText, setDisplayText] = useState("");

  const gtin = resolveProductBarcodeValue({ sku, slug, artistSlug, category });
  const skuDisplay = gtin ? formatSkuDisplayText(gtin) : "";
  const legacySku = Boolean(sku.trim() && isLegacyTextSku(sku));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gtin) {
      setDisplayText("");
      setError(null);
      return;
    }

    let cancelled = false;
    setError(null);
    void renderProductBarcodeCanvas(canvas, { sku, slug, artistSlug, category })
      .then(({ displayText: text }) => {
        if (!cancelled) setDisplayText(text);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not render barcode");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [gtin, sku, slug, artistSlug, category]);

  const onDownload = useCallback(async () => {
    if (!gtin) return;
    setBusy(true);
    setError(null);
    try {
      await downloadProductBarcodePng({ sku, slug, artistSlug, category }, { sku: gtin, slug, title });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Download failed");
    } finally {
      setBusy(false);
    }
  }, [gtin, sku, slug, artistSlug, category, title]);

  if (!gtin) {
    return (
      <div className={`rounded-lg border border-dashed border-[#c9cccf] bg-[#fafbfb] px-4 py-3 ${compact ? "mt-2" : "mt-4"}`}>
        <p className="text-[13px] font-medium text-[#202223]">Product barcode (EAN-13)</p>
        <p className={`mt-1 text-[12px] ${adminMuted}`}>
          Select an artist and save a URL slug — a 13-digit Salvya GTIN is generated automatically for retail labels.
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border border-[#e3e5e7] bg-white ${compact ? "mt-2 p-3" : "mt-4 p-4"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium text-[#202223]">Product barcode (EAN-13)</p>
          <p className={`mt-0.5 text-[12px] ${adminMuted}`}>
            Retail GTIN · spaced like major brands
            {legacySku ? " · legacy text SKU upgraded on sync" : ""}
          </p>
        </div>
        <button
          type="button"
          className={adminBtnSecondary}
          disabled={busy || Boolean(error)}
          onClick={() => void onDownload()}
        >
          {busy ? "Preparing…" : "Download PNG"}
        </button>
      </div>

      <div className="mt-3 flex justify-center rounded-md border border-[#e3e5e7] bg-white px-4 py-4">
        <canvas ref={canvasRef} role="img" aria-label={`Barcode ${displayText || formatBarcodeDisplayText(gtin)}`} className="h-auto max-w-full" />
      </div>

      <p className="mt-3 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6d7175]">
        SKU
      </p>
      <p className="mt-1 text-center font-mono text-[15px] font-medium tracking-[0.12em] tabular-nums text-[#202223]">
        {skuDisplay}
      </p>
      <p className="mt-2 text-center font-mono text-[13px] tracking-[0.08em] tabular-nums text-[#6d7175]">
        {displayText || formatBarcodeDisplayText(gtin)}
      </p>

      {error ? <p className="mt-2 text-[12px] text-rose-700">{error}</p> : null}
    </div>
  );
}
