import type { ProductColorOption } from "@/lib/admin/product-metadata";
import { primaryProductImages } from "@/lib/admin/product-color-variants";
import { mergeProductImages, type ProductImageSlots } from "@/lib/admin/product-images";

export type FolderColorKey = "black" | "white";

const COLOR_ORDER: FolderColorKey[] = ["black", "white"];

const COLOR_PRESETS: Record<FolderColorKey, { name: string; hex: string; id: string }> = {
  black: { name: "Black", hex: "#1a1a1a", id: "black" },
  white: { name: "White", hex: "#f5f5f0", id: "white" },
};

const FALSE_BACK = /flashback|feedback|fallback|cutback/i;

/**
 * Folder catalog angle rules (Salvya artist folders):
 * - `hoodie-back-black.png` → front flat lay (legacy naming)
 * - `hoodie-front-back-black.png` → back print
 * - `back-black-hoodie.png` → back
 * - `hoodie-black-oversize-front.png` → front
 */
export function inferFolderImageAngle(filename: string): "front" | "back" | "detail" {
  const lower = filename.toLowerCase();
  if (FALSE_BACK.test(lower)) return "detail";

  if (/\b(model|models|worn|wearing|wear|lookbook|lifestyle|portrait|on[-_]?body|styled)\b/i.test(lower)) {
    return "detail";
  }

  const hasColor = inferFolderColorKey(filename) !== null;

  if (/front[-_ ]back/i.test(lower)) {
    return hasColor ? "back" : "front";
  }

  if (/[-_.]front(?:[-_.]|\.(?:png|jpe?g|webp)$)/i.test(lower) || /[-_]front\.(?:png|jpe?g|webp)$/i.test(lower)) {
    return "front";
  }

  if (/^back[-_]/i.test(lower)) {
    return "back";
  }

  if (/hoodie[-_ ]back[-_]/i.test(lower)) {
    return "front";
  }

  if (/[-_](?:white|black)[-_]back\b|[-_]back\.(?:png|jpe?g|webp)$/i.test(lower)) {
    return "back";
  }

  if (/\b(back|rear)\b|[-_]back[-_]/i.test(lower)) {
    return "back";
  }

  if (/\b(front|face)\b|[-_]front[-_]/i.test(lower)) {
    return "front";
  }

  return "detail";
}

/** Detect black / white from image filename (folder catalog). */
export function inferFolderColorKey(filename: string): FolderColorKey | null {
  const lower = filename.toLowerCase();
  if (/[-_]black(?:[^a-z]|$)|\bblack\b/i.test(lower)) return "black";
  if (/[-_]white(?:[^a-z]|$)|\bwhite\b|back[-_]white/i.test(lower)) return "white";
  return null;
}

type MutableBucket = ProductImageSlots & { models: string[] };

function emptyBucket(): MutableBucket {
  return { front: null, back: null, models: [] };
}

function assignUrl(bucket: MutableBucket, url: string, angle: ReturnType<typeof inferFolderImageAngle>) {
  if (angle === "front" && !bucket.front) {
    bucket.front = url;
    return;
  }
  if (angle === "back" && !bucket.back) {
    bucket.back = url;
    return;
  }
  if (!bucket.models.includes(url)) bucket.models.push(url);
}

function bucketToColorOption(key: FolderColorKey, bucket: MutableBucket): ProductColorOption {
  const preset = COLOR_PRESETS[key];
  const out: ProductColorOption = {
    id: preset.id,
    name: preset.name,
    hex: preset.hex,
  };
  if (bucket.front) out.front = bucket.front;
  if (bucket.back) out.back = bucket.back;
  if (bucket.models.length) out.models = bucket.models.slice(0, 8);
  return out;
}

export type FolderColorImportResult = {
  colors: ProductColorOption[];
  images: string[];
};

export type FolderImageEntry = {
  /** Used for black/white + angle detection */
  filename: string;
  url: string;
};

/**
 * Group flat + model-shooting images into Black / White colorways.
 * Model filenames (e.g. `model lady white hoodie.png`) go to that color's `models` array.
 */
export function buildFolderColorImportEntries(entries: FolderImageEntry[]): FolderColorImportResult {
  if (!entries.length) return { colors: [], images: [] };

  const buckets = new Map<FolderColorKey, MutableBucket>();
  const untagged: { filename: string; url: string; angle: ReturnType<typeof inferFolderImageAngle> }[] = [];

  const sorted = [...entries].sort((a, b) =>
    a.filename.localeCompare(b.filename, undefined, { sensitivity: "base" }),
  );

  for (const { filename, url } of sorted) {
    const colorKey = inferFolderColorKey(filename);
    const angle = inferFolderImageAngle(filename);

    if (colorKey) {
      const bucket = buckets.get(colorKey) ?? emptyBucket();
      assignUrl(bucket, url, angle);
      buckets.set(colorKey, bucket);
    } else {
      untagged.push({ filename, url, angle });
    }
  }

  const activeKeys = [...buckets.keys()];

  if (untagged.length && activeKeys.length === 1) {
    const only = activeKeys[0]!;
    const bucket = buckets.get(only)!;
    for (const u of untagged) assignUrl(bucket, u.url, u.angle);
  } else if (untagged.length && activeKeys.length > 1) {
    for (const u of untagged) {
      const key = inferFolderColorKey(u.filename) ?? activeKeys[0]!;
      const bucket = buckets.get(key) ?? emptyBucket();
      assignUrl(bucket, u.url, u.angle);
      buckets.set(key, bucket);
    }
  } else if (untagged.length && activeKeys.length === 0) {
    const flat = emptyBucket();
    for (const u of untagged) assignUrl(flat, u.url, u.angle);
    return {
      colors: [],
      images: mergeProductImages(flat),
    };
  }

  if (buckets.size === 0) {
    const flat = emptyBucket();
    for (const { filename, url } of sorted) {
      assignUrl(flat, url, inferFolderImageAngle(filename));
    }
    return { colors: [], images: mergeProductImages(flat) };
  }

  const colors: ProductColorOption[] = [];
  for (const key of COLOR_ORDER) {
    const bucket = buckets.get(key);
    if (!bucket) continue;
    if (!bucket.front && !bucket.back && !bucket.models.length) continue;
    colors.push(bucketToColorOption(key, bucket));
  }

  const legacySlots: ProductImageSlots = { front: null, back: null, models: [] };
  return {
    colors,
    images: primaryProductImages(colors, legacySlots),
  };
}

/** @deprecated Prefer `buildFolderColorImportEntries` when combining flat + model folders. */
export function buildFolderColorImport(
  orderedFiles: string[],
  urlForFile: (file: string) => string,
): FolderColorImportResult {
  return buildFolderColorImportEntries(
    orderedFiles.map((file) => ({ filename: file, url: urlForFile(file) })),
  );
}

export function productMatchesColorFilter(
  colors: ProductColorOption[] | undefined,
  title: string,
  filter: FolderColorKey,
): boolean {
  const name = filter === "black" ? "black" : "white";
  if (colors?.some((c) => c.name.toLowerCase().includes(name) || c.id === filter)) return true;
  return title.toLowerCase().includes(name);
}
