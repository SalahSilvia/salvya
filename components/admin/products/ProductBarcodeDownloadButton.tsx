"use client";

import { useState } from "react";
import { resolveProductBarcodeValue } from "@/lib/barcode/product-barcode";
import { downloadProductBarcodePng } from "@/lib/barcode/render-product-barcode";
import type { SalvyaProductCategory } from "@/lib/admin/types";

type Props = {
  sku?: string | null;
  slug: string;
  title: string;
  artistSlug: string;
  category: SalvyaProductCategory | string;
  className?: string;
};

export function ProductBarcodeDownloadButton({ sku, slug, title, artistSlug, category, className }: Props) {
  const [busy, setBusy] = useState(false);
  const gtin = resolveProductBarcodeValue({ sku, slug, artistSlug, category });

  if (!gtin) return null;

  return (
    <button
      type="button"
      title={`Download EAN-13 barcode PNG`}
      aria-label={`Download barcode for ${title}`}
      disabled={busy}
      className={
        className ??
        "rounded-md p-1.5 text-[#6d7175] transition-colors hover:bg-[#eef4ff] hover:text-[#2D6BFF] disabled:opacity-40"
      }
      onClick={() => {
        setBusy(true);
        void downloadProductBarcodePng({ sku, slug, artistSlug, category }, { sku: gtin, slug, title }).finally(() =>
          setBusy(false),
        );
      }}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path strokeLinecap="round" d="M4 7V5a2 2 0 012-2h3M20 7V5a2 2 0 00-2-2h-3M4 17v2a2 2 0 002 2h3M20 17v2a2 2 0 01-2 2h-3" />
        <path strokeLinecap="round" d="M6 12h12M8 9v6M16 9v6" />
      </svg>
    </button>
  );
}
