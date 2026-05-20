export type StockReservationStatus = "reserved" | "confirmed" | "expired" | "released";

export type ProductVariantRow = {
  id: string;
  product_id: string;
  size: string | null;
  color: string;
  stock: number;
  price_delta_cents: number;
  sku: string;
  image_override: string | null;
  created_at: string;
  updated_at: string;
};

export type StorefrontVariant = {
  id: string;
  productId: string;
  size: string | null;
  color: string;
  stock: number;
  priceDeltaCents: number;
  sku: string;
  imageOverride: string | null;
  soldOut: boolean;
};

export function rowToStorefrontVariant(row: ProductVariantRow): StorefrontVariant {
  const stock = Math.max(0, Math.floor(row.stock));
  return {
    id: row.id,
    productId: row.product_id,
    size: row.size,
    color: row.color,
    stock,
    priceDeltaCents: row.price_delta_cents ?? 0,
    sku: row.sku,
    imageOverride: row.image_override,
    soldOut: stock <= 0,
  };
}
