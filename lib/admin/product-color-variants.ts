import type { ProductColorOption } from "@/lib/admin/product-metadata";
import { mergeProductImages, splitProductImages, type ProductImageSlots } from "@/lib/admin/product-images";

export function colorOptionId(color: ProductColorOption, index = 0): string {
  const id = color.id?.trim();
  if (id) return id;
  const slug = color.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || `color-${index}`;
}

export function colorHasOwnImages(color: ProductColorOption): boolean {
  return Boolean(color.front?.trim() || color.back?.trim() || (color.models?.length ?? 0) > 0);
}

export function productHasColorVariantImages(colors: ProductColorOption[]): boolean {
  return colors.some(colorHasOwnImages);
}

export function slotsFromColor(color: ProductColorOption): ProductImageSlots {
  return {
    front: color.front?.trim() || null,
    back: color.back?.trim() || null,
    models: (color.models ?? []).filter((u) => u.trim()),
  };
}

export function colorToImageUrls(color: ProductColorOption): string[] {
  return mergeProductImages(slotsFromColor(color));
}

function modelUrlMatchesColor(url: string, colorId: string, colorName: string): boolean {
  const u = url.toLowerCase();
  const name = colorName.toLowerCase();
  if (colorId === "black" || name.includes("black")) {
    return u.includes("black") || u.includes("noir");
  }
  if (colorId === "white" || name.includes("white")) {
    return u.includes("white") || u.includes("blanc");
  }
  return false;
}

/** Copy legacy flat gallery into colorways field-by-field (front, back, models per color). */
export function hydrateColorVariants(
  colors: ProductColorOption[],
  legacyImages: string[],
): ProductColorOption[] {
  if (!colors.length) return [];
  const legacy = splitProductImages(legacyImages);
  const orphanModels = [...legacy.models];
  const assigned = new Set<string>();

  return colors.map((c, index) => {
    const id = colorOptionId(c, index);
    const out: ProductColorOption = { ...c, name: c.name };
    if (c.id?.trim()) out.id = c.id.trim();
    if (c.hex) out.hex = c.hex;

    const front = c.front?.trim() || legacy.front || undefined;
    const back = c.back?.trim() || legacy.back || undefined;
    if (front) out.front = front;
    if (back) out.back = back;

    let models = (c.models ?? []).map((u) => u.trim()).filter(Boolean);
    if (!models.length && orphanModels.length) {
      const matched = orphanModels.filter((url) => {
        if (assigned.has(url)) return false;
        return modelUrlMatchesColor(url, id, c.name);
      });
      if (matched.length) {
        models = matched;
        matched.forEach((u) => assigned.add(u));
      } else if (index === 0) {
        models = orphanModels.filter((url) => !assigned.has(url));
        models.forEach((u) => assigned.add(u));
      }
    } else if (models.length) {
      models.forEach((u) => assigned.add(u));
    }
    if (models.length) out.models = models.slice(0, 8);

    return out;
  });
}

/** `salvya_products.images` — first colorway with a front, otherwise the default slots. */
export function primaryProductImages(
  colors: ProductColorOption[],
  legacySlots: ProductImageSlots,
): string[] {
  for (const c of colors) {
    const urls = colorToImageUrls(c);
    if (urls.length) return urls;
  }
  return mergeProductImages(legacySlots);
}

export type ColorGalleryMap = Record<string, string[]>;

export function buildColorGalleryMap(
  colors: ProductColorOption[],
  fallbackImages: string[],
): ColorGalleryMap {
  const fallback = fallbackImages.filter(Boolean);
  const map: ColorGalleryMap = {};
  colors.forEach((c, i) => {
    const id = colorOptionId(c, i);
    const urls = colorToImageUrls(c);
    map[id] = urls.length ? urls : fallback;
  });
  return map;
}

export function galleryUrlsForColorId(
  colorId: string,
  map: ColorGalleryMap,
  fallbackImages: string[],
): string[] {
  const urls = map[colorId];
  return urls?.length ? urls : fallbackImages.filter(Boolean);
}

export function normalizeColorsForSave(
  colors: ProductColorOption[],
  legacySlots: ProductImageSlots,
): ProductColorOption[] {
  return colors.map((c) => {
    const front = c.front?.trim() || undefined;
    const back = c.back?.trim() || undefined;
    const models = (c.models ?? []).map((u) => u.trim()).filter(Boolean).slice(0, 8);
    const hex = c.hex?.trim();
    const out: ProductColorOption = { name: c.name.trim() };
    if (c.id?.trim()) out.id = c.id.trim();
    if (hex && /^#[0-9a-fA-F]{3,8}$/.test(hex)) out.hex = hex;
    if (front) out.front = front;
    if (back) out.back = back;
    if (models.length) out.models = models;
    return out;
  }).filter((c) => c.name);
}
