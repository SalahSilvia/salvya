import type { CartLine } from "@/lib/cart/types";

export function cartLinesForProduct(
  lines: CartLine[],
  artistSlug: string,
  itemSlug: string,
  productKind: CartLine["productKind"],
): CartLine[] {
  const artist = artistSlug.trim().toLowerCase();
  const item = itemSlug.trim().toLowerCase();
  return lines.filter(
    (l) =>
      l.artistSlug.toLowerCase() === artist &&
      l.itemSlug.toLowerCase() === item &&
      l.productKind === productKind,
  );
}

export function formatCartLineVariant(line: CartLine): string {
  return `${line.size} · ${line.colorLabel}${line.qty > 1 ? ` ×${line.qty}` : ""}`;
}
