import type { CartLine } from "@/lib/cart/types";
import type { OrderLineItem } from "@/lib/orders/types";
export function orderLineItemFromCartLine(line: CartLine): OrderLineItem {
  return {
    artistSlug: line.artistSlug,
    itemSlug: line.itemSlug,
    productKind: line.productKind,
    variantId: line.variantId?.trim() ?? "",
    displayTitle: line.displayTitle,
    priceLabel: line.priceLabel,
    kindLabel: line.productKind === "tshirt" ? "Oversize tee" : "Oversize hoodie",
    qty: line.qty,
    size: line.size,
    colorId: line.colorId,
    colorLabel: line.colorLabel,
  };
}
