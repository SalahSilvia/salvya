/** Best-effort numeric extraction from checkout price labels (e.g. "€89 · Oversized"). */
export function parsePriceLabelToNumber(label: string): number {
  const cleaned = label.replace(/,/g, "").replace(/\s/g, " ");
  const match = cleaned.match(/(\d+(?:[.,]\d+)?)/);
  if (!match) return 0;
  const n = parseFloat(match[1].replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

export function estimateOrderTotalCents(lineItem: {
  priceLabel: string;
  qty: number;
}): number {
  const unit = parsePriceLabelToNumber(lineItem.priceLabel);
  const cents = Math.round(unit * 100) * Math.max(1, lineItem.qty);
  return cents;
}
