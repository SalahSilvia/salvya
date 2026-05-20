/** Salvya customer bag line — stable shape for local cache and Supabase JSONB. */

export const CART_SCHEMA_VERSION = 2 as const;
export const CART_MAX_QTY_PER_LINE = 5;

export type CartLine = {
  v: typeof CART_SCHEMA_VERSION;
  lineId: string;
  artistSlug: string;
  artistName: string;
  itemSlug: string;
  productKind: "hoodie" | "tshirt";
  displayTitle: string;
  /** Display-only at add time — checkout always re-quotes from Supabase in EUR. */
  priceLabel: string;
  colorId: string;
  colorLabel: string;
  size: string;
  /** Resolved at add time — used for checkout URL and server quote. */
  variantId?: string;
  qty: number;
  giftNote: string;
  checkoutHref: string;
  addedAt: string;
  updatedAt: string;
};

export type AddCartLineInput = Omit<CartLine, "v" | "lineId" | "qty" | "addedAt" | "updatedAt"> & {
  qty: number;
  /** When true, always append a new line (used for multi-variant bag adds from the PDP). */
  separateLine?: boolean;
};

export type CartSnapshot = {
  lines: CartLine[];
  updatedAt: string | null;
};
