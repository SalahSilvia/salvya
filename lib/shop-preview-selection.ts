const SIZES = ["XS", "S", "M", "L", "XL", "2XL"] as const;
const COLOR_IDS = ["ink", "bone", "twilight"] as const;

const COLOR_LABEL: Record<string, string> = {
  ink: "Ink",
  bone: "Bone",
  twilight: "Twilight",
};

export type PreviewSelection = {
  qty: number;
  size: (typeof SIZES)[number];
  colorId: string;
  colorLabel: string;
  variantId?: string;
};

export function parsePreviewSelection(
  sp: Record<string, string | string[] | undefined> | null | undefined,
): PreviewSelection {
  const qtyRaw = typeof sp?.qty === "string" ? Number.parseInt(sp.qty, 10) : NaN;
  const qty = Number.isFinite(qtyRaw) ? Math.min(5, Math.max(1, qtyRaw)) : 1;

  const sizeRaw = typeof sp?.size === "string" ? sp.size : "M";
  const size = (SIZES as readonly string[]).includes(sizeRaw) ? (sizeRaw as (typeof SIZES)[number]) : "M";

  const colorRaw = typeof sp?.color === "string" ? sp.color : "ink";
  const colorId = (COLOR_IDS as readonly string[]).includes(colorRaw) ? colorRaw : "ink";
  const colorLabel = COLOR_LABEL[colorId] ?? colorId;

  const variantId = typeof sp?.variant === "string" ? sp.variant.trim() : undefined;

  return { qty, size, colorId, colorLabel, variantId: variantId || undefined };
}

export function serializePreviewSelection(s: PreviewSelection): string {
  const p = new URLSearchParams();
  p.set("qty", String(s.qty));
  p.set("size", s.size);
  p.set("color", s.colorId);
  if (s.variantId) p.set("variant", s.variantId);
  return p.toString();
}
