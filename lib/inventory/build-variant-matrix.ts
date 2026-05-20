import { colorOptionId } from "@/lib/admin/product-color-variants";
import { parseProductMetadata, type ProductColorOption } from "@/lib/admin/product-metadata";
import { CATALOG_DEFAULT_SIZES } from "@/lib/catalog/catalog-merchandising-defaults";
import type { StorefrontVariant } from "@/lib/inventory/types";

export type VariantMatrixEntry = {
  size: string;
  color: string;
  stock: number;
  sku: string;
};

function normalizeSize(size: string): string {
  return size.trim().toUpperCase();
}

function parseColorsFromMetadata(metadata: Record<string, unknown>): ProductColorOption[] {
  const meta = parseProductMetadata(metadata);
  if (meta.colors?.length) return meta.colors;
  return [{ id: "default", name: "Default" }];
}

function parseSizesFromMetadata(metadata: Record<string, unknown>): string[] {
  const meta = parseProductMetadata(metadata);
  const sizes = meta.sizes?.length ? meta.sizes : [...CATALOG_DEFAULT_SIZES];
  return [...new Set(sizes.map(normalizeSize).filter(Boolean))];
}

export function variantSku(
  artistSlug: string,
  productSlug: string,
  size: string,
  colorId: string,
): string {
  const base = `${artistSlug}-${productSlug}-${size}-${colorId}`
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base.slice(0, 120) || `${productSlug}-${size}-${colorId}`.slice(0, 120);
}

/** Split product-level stock evenly across variant slots (min 0 per slot). */
export function distributeStockAcrossVariants(totalStock: number, slotCount: number): number[] {
  const slots = Math.max(1, slotCount);
  const total = Math.max(0, Math.floor(totalStock));
  const base = Math.floor(total / slots);
  const remainder = total % slots;
  return Array.from({ length: slots }, (_, i) => base + (i < remainder ? 1 : 0));
}

export function isPlaceholderVariantSet(variants: Pick<StorefrontVariant, "size" | "color">[]): boolean {
  if (variants.length !== 1) return false;
  const v = variants[0]!;
  return v.color.toLowerCase() === "default" && !v.size?.trim();
}

/**
 * Build size × color variant rows from product metadata (PDP + checkout authority).
 */
export function buildVariantMatrixFromMetadata(opts: {
  artistSlug: string;
  productSlug: string;
  metadata: Record<string, unknown>;
  productStock: number;
  existingVariants?: Pick<StorefrontVariant, "size" | "color" | "stock">[];
}): VariantMatrixEntry[] {
  const colors = parseColorsFromMetadata(opts.metadata);
  const sizes = parseSizesFromMetadata(opts.metadata);
  const slots: { size: string; color: string }[] = [];

  colors.forEach((color, colorIndex) => {
    const colorId = colorOptionId(color, colorIndex);
    for (const size of sizes) {
      slots.push({ size, color: colorId });
    }
  });

  const existing = opts.existingVariants ?? [];
  const preserveStock = existing.length > 0 && !isPlaceholderVariantSet(existing);
  const stockByKey = new Map<string, number>();
  if (preserveStock) {
    for (const v of existing) {
      const key = `${normalizeSize(v.size ?? "")}|${v.color.toLowerCase()}`;
      stockByKey.set(key, Math.max(0, v.stock));
    }
  }

  const distributed = distributeStockAcrossVariants(opts.productStock, slots.length);

  return slots.map((slot, index) => {
    const key = `${slot.size}|${slot.color.toLowerCase()}`;
    const stock = preserveStock ? (stockByKey.get(key) ?? 0) : distributed[index] ?? 0;
    return {
      size: slot.size,
      color: slot.color,
      stock,
      sku: variantSku(opts.artistSlug, opts.productSlug, slot.size, slot.color),
    };
  });
}
