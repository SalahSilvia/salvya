import { makeCartLineId, makeUniqueCartLineId } from "@/lib/cart/line-id";
import { CART_MAX_QTY_PER_LINE, type AddCartLineInput, type CartLine } from "@/lib/cart/types";
import { normalizeCartLine } from "@/lib/cart/validate";

export function cartTotalQty(lines: CartLine[]): number {
  return lines.reduce((n, l) => n + l.qty, 0);
}

export function addLineToCart(lines: CartLine[], input: AddCartLineInput): CartLine[] {
  const idParts = {
    artistSlug: input.artistSlug,
    productKind: input.productKind,
    itemSlug: input.itemSlug,
    colorId: input.colorId,
    size: input.size,
  };
  const separateLine = input.separateLine === true;
  const baseLineId = makeCartLineId(idParts);
  const lineId = separateLine ? makeUniqueCartLineId(idParts) : baseLineId;

  const now = new Date().toISOString();
  const idx = separateLine ? -1 : lines.findIndex((l) => l.lineId === baseLineId);
  const mergedQty =
    idx >= 0
      ? Math.min(CART_MAX_QTY_PER_LINE, lines[idx].qty + input.qty)
      : Math.min(CART_MAX_QTY_PER_LINE, input.qty);

  const row = normalizeCartLine({
    v: 2,
    lineId,
    artistSlug: input.artistSlug,
    artistName: input.artistName,
    itemSlug: input.itemSlug,
    productKind: input.productKind,
    displayTitle: input.displayTitle,
    priceLabel: input.priceLabel,
    colorId: input.colorId,
    colorLabel: input.colorLabel,
    size: input.size,
    qty: mergedQty,
    giftNote: input.giftNote.trim() ? input.giftNote.trim() : idx >= 0 ? lines[idx].giftNote : "",
    ...(input.variantId?.trim()
      ? { variantId: input.variantId.trim() }
      : idx >= 0 && lines[idx].variantId
        ? { variantId: lines[idx].variantId }
        : {}),
    checkoutHref: input.checkoutHref,
    addedAt: idx >= 0 ? lines[idx].addedAt : now,
    updatedAt: now,
  });

  if (idx >= 0) {
    return lines.map((l, i) => (i === idx ? row : l));
  }
  return [row, ...lines];
}

export function removeLineFromCart(lines: CartLine[], lineId: string): CartLine[] {
  return lines.filter((l) => l.lineId !== lineId);
}

export function updateLineQtyInCart(lines: CartLine[], lineId: string, qty: number): CartLine[] {
  const nextQty = Math.min(CART_MAX_QTY_PER_LINE, Math.max(1, Math.floor(qty)));
  const now = new Date().toISOString();
  return lines.map((l) =>
    l.lineId === lineId ? normalizeCartLine({ ...l, qty: nextQty, updatedAt: now }) : l,
  );
}
