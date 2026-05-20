import { CART_MAX_QTY_PER_LINE, CART_SCHEMA_VERSION, type CartLine } from "@/lib/cart/types";

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

export function isCartLine(x: unknown): x is CartLine {
  if (!isRecord(x)) return false;
  if (x.v !== CART_SCHEMA_VERSION && x.v !== 1) return false;
  const strings = [
    "lineId",
    "artistSlug",
    "artistName",
    "itemSlug",
    "displayTitle",
    "priceLabel",
    "colorId",
    "colorLabel",
    "size",
    "checkoutHref",
  ] as const;
  for (const k of strings) {
    if (typeof x[k] !== "string") return false;
  }
  if (x.productKind !== "hoodie" && x.productKind !== "tshirt") return false;
  if (typeof x.qty !== "number" || !Number.isFinite(x.qty) || x.qty < 1) return false;
  if (typeof x.giftNote !== "string") return false;
  if (x.variantId !== undefined && typeof x.variantId !== "string") return false;
  if (x.v === CART_SCHEMA_VERSION) {
    if (typeof x.addedAt !== "string" || typeof x.updatedAt !== "string") return false;
  }
  return true;
}

export function normalizeCartLine(raw: CartLine): CartLine {
  const now = new Date().toISOString();
  return {
    v: CART_SCHEMA_VERSION,
    lineId: raw.lineId,
    artistSlug: raw.artistSlug,
    artistName: raw.artistName,
    itemSlug: raw.itemSlug,
    productKind: raw.productKind,
    displayTitle: raw.displayTitle,
    priceLabel: raw.priceLabel,
    colorId: raw.colorId,
    colorLabel: raw.colorLabel,
    size: raw.size,
    ...(raw.variantId?.trim() ? { variantId: raw.variantId.trim() } : {}),
    qty: Math.min(CART_MAX_QTY_PER_LINE, Math.max(1, Math.round(raw.qty))),
    giftNote: raw.giftNote.trim(),
    checkoutHref: raw.checkoutHref,
    addedAt: raw.addedAt || now,
    updatedAt: now,
  };
}

export function sanitizeCartLines(parsed: unknown): CartLine[] {
  if (!Array.isArray(parsed)) return [];
  const now = new Date().toISOString();
  return parsed
    .filter(isCartLine)
    .map((line) =>
      normalizeCartLine({
        ...line,
        v: CART_SCHEMA_VERSION,
        addedAt: line.addedAt || now,
        updatedAt: line.updatedAt || now,
      }),
    );
}
