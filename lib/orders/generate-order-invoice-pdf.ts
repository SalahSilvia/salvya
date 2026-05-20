import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont } from "pdf-lib";
import type { OrderInvoiceDocument } from "@/lib/orders/order-invoice-data";

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 48;
const BRAND = rgb(0.176, 0.42, 1);
const INK = rgb(0.08, 0.1, 0.14);
const MUTED = rgb(0.35, 0.38, 0.44);
const LINE = rgb(0.88, 0.9, 0.93);

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function drawLabelValue(
  page: PDFPage,
  font: PDFFont,
  fontBold: PDFFont,
  x: number,
  y: number,
  label: string,
  value: string,
  valueSize = 10,
): number {
  page.drawText(label.toUpperCase(), {
    x,
    y,
    size: 7,
    font: fontBold,
    color: MUTED,
  });
  const lines = value.split("\n");
  let cy = y - 12;
  for (const line of lines) {
    page.drawText(line, { x, y: cy, size: valueSize, font, color: INK });
    cy -= valueSize + 3;
  }
  return cy - 4;
}

export async function generateOrderInvoicePdf(doc: OrderInvoiceDocument): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Salvya Invoice ${doc.orderNumber}`);
  pdf.setAuthor("Salvya");
  pdf.setSubject("Order proof of purchase");

  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let page = pdf.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  page.drawRectangle({
    x: 0,
    y: PAGE_H - 72,
    width: PAGE_W,
    height: 72,
    color: rgb(0.02, 0.02, 0.05),
  });
  page.drawText("SALVYA", {
    x: MARGIN,
    y: PAGE_H - 42,
    size: 22,
    font: fontBold,
    color: rgb(1, 1, 1),
  });
  page.drawText("Official order invoice · Proof of purchase", {
    x: MARGIN,
    y: PAGE_H - 58,
    size: 9,
    font,
    color: rgb(0.75, 0.82, 1),
  });

  y = PAGE_H - 96;

  page.drawText("INVOICE", { x: MARGIN, y, size: 20, font: fontBold, color: INK });
  y -= 28;

  const col2 = PAGE_W / 2 + 12;
  y = drawLabelValue(page, font, fontBold, MARGIN, y, "Order number", doc.orderNumber, 12);
  y = drawLabelValue(page, font, fontBold, col2, y + 28, "Order ID", doc.orderId.slice(0, 8).toUpperCase(), 10);
  y -= 8;
  y = drawLabelValue(page, font, fontBold, MARGIN, y, "Date placed", doc.placedAt, 10);
  y = drawLabelValue(page, font, fontBold, col2, y + 20, "Status", doc.fulfillmentLabel, 10);
  y = drawLabelValue(page, font, fontBold, MARGIN, y, "Payment", doc.paymentLabel, 10);

  y -= 12;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 1, color: LINE });
  y -= 20;

  const buyerY = y;
  let leftBottom = drawLabelValue(page, font, fontBold, MARGIN, buyerY, "Bill to", doc.buyerName, 11);
  leftBottom = drawLabelValue(page, font, fontBold, MARGIN, leftBottom, "Email", doc.buyerEmail, 9);
  if (doc.buyerPhone.trim()) {
    leftBottom = drawLabelValue(page, font, fontBold, MARGIN, leftBottom, "Phone", doc.buyerPhone, 9);
  }

  drawLabelValue(page, font, fontBold, col2, buyerY, "Ship to", doc.shipTo, 9);

  y = Math.min(leftBottom, buyerY - 80) - 16;

  page.drawText("LINE ITEMS", { x: MARGIN, y, size: 8, font: fontBold, color: MUTED });
  y -= 14;

  const tableTop = y;
  const cols = {
    sku: MARGIN,
    item: MARGIN + 108,
    qty: PAGE_W - MARGIN - 120,
    amount: PAGE_W - MARGIN - 52,
  };

  page.drawRectangle({
    x: MARGIN,
    y: tableTop - 14,
    width: PAGE_W - MARGIN * 2,
    height: 16,
    color: rgb(0.96, 0.97, 0.99),
  });
  page.drawText("SKU / GTIN", { x: cols.sku, y: tableTop - 10, size: 7, font: fontBold, color: MUTED });
  page.drawText("Description", { x: cols.item, y: tableTop - 10, size: 7, font: fontBold, color: MUTED });
  page.drawText("Qty", { x: cols.qty, y: tableTop - 10, size: 7, font: fontBold, color: MUTED });
  page.drawText("Line", { x: cols.amount, y: tableTop - 10, size: 7, font: fontBold, color: MUTED });

  y = tableTop - 28;

  for (const line of doc.lines) {
    if (y < 140) {
      page = pdf.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN;
    }

    const skuLines = wrapText(line.skuDisplay, font, 8, 100);
    const titleLines = wrapText(line.title, font, 9, PAGE_W - MARGIN - cols.item - 130);
    const meta = `${line.kindLabel} · ${line.size} · ${line.colorLabel}`;
    const rowHeight = Math.max(skuLines.length, titleLines.length) * 11 + 22;

    page.drawText(skuLines[0] ?? line.skuRaw, { x: cols.sku, y, size: 8, font: fontBold, color: INK });
    if (skuLines[1]) {
      page.drawText(skuLines[1], { x: cols.sku, y: y - 10, size: 7, font, color: MUTED });
    }

    page.drawText(titleLines[0] ?? line.title, { x: cols.item, y, size: 9, font: fontBold, color: INK });
    let ty = y - 11;
    for (let i = 1; i < titleLines.length; i++) {
      page.drawText(titleLines[i], { x: cols.item, y: ty, size: 9, font, color: INK });
      ty -= 11;
    }
    page.drawText(meta, { x: cols.item, y: ty - 2, size: 7, font, color: MUTED });
    page.drawText(`Variant ${line.variantId.slice(0, 8)}…`, {
      x: cols.item,
      y: ty - 12,
      size: 6.5,
      font,
      color: MUTED,
    });

    page.drawText(String(line.qty), { x: cols.qty, y, size: 9, font, color: INK });
    page.drawText(line.lineAmount, { x: cols.amount, y, size: 9, font: fontBold, color: INK });

    y -= rowHeight;
    page.drawLine({ start: { x: MARGIN, y: y + 6 }, end: { x: PAGE_W - MARGIN, y: y + 6 }, thickness: 0.5, color: LINE });
    y -= 8;
  }

  y -= 4;
  page.drawLine({ start: { x: PAGE_W - MARGIN - 180, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 1, color: INK });
  y -= 18;
  page.drawText("TOTAL PAID", { x: PAGE_W - MARGIN - 180, y, size: 8, font: fontBold, color: MUTED });
  page.drawText(doc.total, {
    x: PAGE_W - MARGIN - fontBold.widthOfTextAtSize(doc.total, 14),
    y: y - 2,
    size: 14,
    font: fontBold,
    color: BRAND,
  });
  if (doc.currency) {
    page.drawText(doc.currency, {
      x: PAGE_W - MARGIN - 180,
      y: y - 14,
      size: 8,
      font,
      color: MUTED,
    });
  }

  y -= 36;
  const proofLines = wrapText(doc.proofNote, font, 8, PAGE_W - MARGIN * 2);
  for (const pl of proofLines) {
    if (y < 60) break;
    page.drawText(pl, { x: MARGIN, y, size: 8, font, color: MUTED });
    y -= 11;
  }

  page.drawText("salvya.com · Customer support: help center in your account", {
    x: MARGIN,
    y: 36,
    size: 7,
    font,
    color: MUTED,
  });

  return pdf.save();
}

export function invoicePdfFilename(orderNumber: string): string {
  const safe = orderNumber.replace(/[^\w-]+/g, "-");
  return `Salvya-Invoice-${safe}.pdf`;
}
