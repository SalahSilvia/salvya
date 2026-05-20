/** Gallery order: [0] front, [1] back, [2…] on-model shots. */

export const MAX_PRODUCT_IMAGES = 12;
export const MAX_MODEL_IMAGES = 8;

export type ProductImageSlots = {
  front: string | null;
  back: string | null;
  models: string[];
};

export function splitProductImages(images: string[]): ProductImageSlots {
  const list = images.filter(Boolean);
  return {
    front: list[0] ?? null,
    back: list[1] ?? null,
    models: list.slice(2, 2 + MAX_MODEL_IMAGES),
  };
}

export function mergeProductImages(slots: ProductImageSlots): string[] {
  const out: string[] = [];
  if (slots.front?.trim()) out.push(slots.front.trim());
  if (slots.back?.trim()) out.push(slots.back.trim());
  for (const url of slots.models) {
    const u = url.trim();
    if (u) out.push(u);
  }
  return out.slice(0, MAX_PRODUCT_IMAGES);
}
