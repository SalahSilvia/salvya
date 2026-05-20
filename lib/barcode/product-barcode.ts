import {
  digitsOnly,
  formatEan13Human,
  formatSalvyaSkuHuman,
  isValidGtin13,
  resolveSalvyaGtin13,
  type GtinResolveInput,
} from "@/lib/barcode/salvya-gtin";

/** Retail barcode symbology (13-digit GTIN). */
export const PRODUCT_BARCODE_FORMAT = "EAN13" as const;

export type { GtinResolveInput };

export function sanitizeBarcodeText(value: string): string {
  return digitsOnly(value).slice(0, 13);
}

/** 13-digit GTIN for barcode encoding. */
export function resolveProductBarcodeValue(input: GtinResolveInput): string | null {
  return resolveSalvyaGtin13(input);
}

export function formatBarcodeDisplayText(gtin13: string): string {
  return formatEan13Human(gtin13);
}

export function formatSkuDisplayText(gtin13: string): string {
  return formatSalvyaSkuHuman(gtin13);
}

export function barcodePngFileName(parts: {
  sku?: string | null;
  slug?: string | null;
  title?: string | null;
}): string {
  const digits = digitsOnly(parts.sku ?? "");
  const base =
    digits.length === 13
      ? digits
      : (parts.slug?.trim() || parts.title?.trim() || "product")
          .replace(/[^a-zA-Z0-9-_]+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 32);
  return `barcode-${base || "product"}.png`;
}

export { isValidGtin13, formatEan13Human, formatSalvyaSkuHuman };
