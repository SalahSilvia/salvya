import type { ProductImageSlots } from "@/lib/admin/product-images";
import { inferFolderImageAngle } from "@/lib/catalog/catalog-folder-colors";
import type { StorefrontProduct } from "@/lib/catalog/storefront-product";

function filenameFromUrl(url: string): string {
  try {
    const path = new URL(url, "https://salvyastore.com").pathname;
    return decodeURIComponent(path.split("/").pop() ?? url);
  } catch {
    const parts = url.split("/");
    return decodeURIComponent(parts[parts.length - 1] ?? url);
  }
}

/** Model-shoot folders and filenames (e.g. `models shooting hoodies/model lady white.png`). */
export function isLikelyModelShotUrl(url: string): boolean {
  const decoded = decodeURIComponent(url).toLowerCase();
  return (
    /\bmodels?\b/.test(decoded) ||
    /\bshooting\b/.test(decoded) ||
    /\b(lookbook|lifestyle|on[-_]?body|worn|wearing|wear|styled|portrait)\b/.test(decoded)
  );
}

/** Every image URL attached to a product (colorways + legacy flat gallery). */
export function allProductImageUrls(product: StorefrontProduct): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const push = (raw?: string | null) => {
    const u = raw?.trim();
    if (!u || seen.has(u)) return;
    seen.add(u);
    out.push(u);
  };

  for (const color of product.colors) {
    push(color.front);
    push(color.back);
    for (const m of color.models ?? []) push(m);
  }
  for (const u of product.images) push(u);

  return out;
}

/** Classify URLs into front / back / on-model (ignores legacy array order). */
export function slotsFromImageUrls(urls: string[]): ProductImageSlots {
  const bucket: ProductImageSlots = { front: null, back: null, models: [] };

  for (const url of urls.filter(Boolean)) {
    if (isLikelyModelShotUrl(url)) {
      if (!bucket.models.includes(url)) bucket.models.push(url);
      continue;
    }

    const angle = inferFolderImageAngle(filenameFromUrl(url));
    if (angle === "front" && !bucket.front) {
      bucket.front = url;
    } else if (angle === "back" && !bucket.back) {
      bucket.back = url;
    } else if (!bucket.models.includes(url)) {
      bucket.models.push(url);
    }
  }

  if (!bucket.front) {
    const frontCandidate = urls.find(
      (u) => !isLikelyModelShotUrl(u) && inferFolderImageAngle(filenameFromUrl(u)) === "front",
    );
    if (frontCandidate) {
      bucket.front = frontCandidate;
    } else {
      const notBack = urls.find(
        (u) => !isLikelyModelShotUrl(u) && inferFolderImageAngle(filenameFromUrl(u)) !== "back",
      );
      bucket.front = notBack ?? null;
    }
  }

  if (!bucket.back) {
    const backCandidate = urls.find(
      (u) => !isLikelyModelShotUrl(u) && inferFolderImageAngle(filenameFromUrl(u)) === "back",
    );
    if (backCandidate) bucket.back = backCandidate;
  }

  return {
    front: bucket.front,
    back: bucket.back,
    models: bucket.models.slice(0, 8),
  };
}

export function slotsFromStorefrontProduct(product: StorefrontProduct): ProductImageSlots {
  const urls = allProductImageUrls(product);
  if (!urls.length) return { front: null, back: null, models: [] };
  return slotsFromImageUrls(urls);
}

/** Flat-lay front — never the back print or a model shot. */
export function storefrontFrontImageUrl(product: StorefrontProduct): string | null {
  const slots = slotsFromStorefrontProduct(product);
  return slots.front ?? null;
}

/** Flat-lay back / print side — never a model shot. */
export function storefrontBackImageUrl(product: StorefrontProduct): string | null {
  const slots = slotsFromStorefrontProduct(product);
  return slots.back ?? null;
}

/** On-model / lifestyle shot (Editor's rack only). */
export function storefrontModelImageUrl(product: StorefrontProduct): string | null {
  const slots = slotsFromStorefrontProduct(product);
  return slots.models[0] ?? null;
}

/** Shop carousels & spotlight — back flat lay; fallback to front if no back. Never models. */
export function storefrontShopCardImageUrl(product: StorefrontProduct): string | null {
  return storefrontBackImageUrl(product) ?? storefrontFrontImageUrl(product);
}
