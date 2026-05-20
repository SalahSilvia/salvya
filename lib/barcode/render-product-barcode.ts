import {
  formatBarcodeDisplayText,
  PRODUCT_BARCODE_FORMAT,
  barcodePngFileName,
  resolveProductBarcodeValue,
  type GtinResolveInput,
} from "@/lib/barcode/product-barcode";
import { isValidGtin13 } from "@/lib/barcode/salvya-gtin";

type JsBarcodeOptions = {
  format?: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  text?: string;
  fontSize?: number;
  textMargin?: number;
  margin?: number;
  background?: string;
  lineColor?: string;
  font?: string;
};

const DEFAULT_OPTIONS: JsBarcodeOptions = {
  format: PRODUCT_BARCODE_FORMAT,
  width: 2.2,
  height: 88,
  displayValue: true,
  fontSize: 15,
  textMargin: 10,
  margin: 18,
  background: "#ffffff",
  lineColor: "#000000",
  font: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
};

export async function renderProductBarcodeCanvas(
  canvas: HTMLCanvasElement,
  input: GtinResolveInput,
  options?: JsBarcodeOptions,
): Promise<{ gtin: string; displayText: string }> {
  const gtin = resolveProductBarcodeValue(input);
  if (!gtin || !isValidGtin13(gtin)) {
    throw new Error("Valid 13-digit GTIN required for barcode");
  }

  const displayText = formatBarcodeDisplayText(gtin);
  const JsBarcode = (await import("jsbarcode")).default;
  JsBarcode(canvas, gtin, {
    ...DEFAULT_OPTIONS,
    text: displayText,
    ...options,
  });
  return { gtin, displayText };
}

export async function downloadProductBarcodePng(
  input: GtinResolveInput,
  fileParts: { sku?: string | null; slug?: string | null; title?: string | null },
): Promise<void> {
  const canvas = document.createElement("canvas");
  await renderProductBarcodeCanvas(canvas, input);
  const url = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = url;
  link.download = barcodePngFileName(fileParts);
  document.body.appendChild(link);
  link.click();
  link.remove();
}
