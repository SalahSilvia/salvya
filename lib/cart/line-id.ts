import type { CartLine } from "@/lib/cart/types";

export function makeCartLineId(parts: {
  artistSlug: string;
  productKind: CartLine["productKind"];
  itemSlug: string;
  colorId: string;
  size: string;
}): string {
  return `${parts.artistSlug}:${parts.productKind}:${parts.itemSlug}:${parts.colorId}:${parts.size}`;
}

export function makeUniqueCartLineId(parts: Parameters<typeof makeCartLineId>[0]): string {
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return `${makeCartLineId(parts)}:${suffix}`;
}

export function productPageHrefForLine(line: CartLine): string {
  const base =
    line.productKind === "tshirt"
      ? `/artist/${line.artistSlug}/tshirt/${line.itemSlug}`
      : `/artist/${line.artistSlug}/item/${line.itemSlug}`;
  const params = new URLSearchParams({ size: line.size, color: line.colorId });
  if (line.variantId?.trim()) params.set("variant", line.variantId.trim());
  const q = params.toString();
  return q ? `${base}?${q}` : base;
}

export function checkoutUrlForLine(line: CartLine): string {
  const params = new URLSearchParams({
    qty: String(line.qty),
    size: line.size,
    color: line.colorId,
  });
  if (line.variantId?.trim()) params.set("variant", line.variantId.trim());
  return `${line.checkoutHref}?${params.toString()}`;
}
