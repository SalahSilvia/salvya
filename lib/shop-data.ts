/**
 * @deprecated MIGRATION / IMPORT ONLY — not used for live storefront resolution.
 * Runtime catalog is Supabase-only (`salvya_products`). See `docs/CATALOG-SOURCES.md`.
 *
 * Artist hoodies: image files are served from `GET /api/artist-shop/[slug]/[filename]`.
 * Place assets under each artist folder, e.g. `artists/Elgrandetoto/shop/hoodie-name-front.png`,
 * or `public/media/artists/{slug}/shop/` after copying.
 *
 * For every hoodie, the **back** view is always ordered first for listings and PDP,
 * even if `images` is authored with the front shot first.
 */
export type HoodieImageAngle = "front" | "back" | "detail";

export type HoodieImageDef = {
  file: string;
  /** If omitted, angle is inferred from the filename when possible */
  angle?: HoodieImageAngle;
};

export type ArtistHoodie = {
  itemSlug: string;
  artistSlug: string;
  name: string;
  priceLabel: string;
  images: HoodieImageDef[];
};

const FALSE_BACK = /flashback|feedback|fallback|cutback/i;

/** Infer angle from filename when `angle` is not set */
export function inferHoodieAngleFromFilename(file: string): HoodieImageAngle {
  const lower = file.toLowerCase();
  if (/\b(back|rear)\b|_back|-back|_rear|-rear/i.test(lower) && !FALSE_BACK.test(lower)) {
    return "back";
  }
  if (/\b(front|face)\b|_front|-front/i.test(lower)) {
    return "front";
  }
  if (/\b(detail|macro|texture|close)\b|_detail|-detail/i.test(lower)) {
    return "detail";
  }
  return "detail";
}

function angleRank(angle: HoodieImageAngle): number {
  if (angle === "back") return 0;
  if (angle === "detail") return 1;
  return 2;
}

/** Hoodies: back first, then detail/other, then front — for grid, PDP default, and thumbnails */
export function orderHoodieImages<T extends HoodieImageDef>(images: T[]): T[] {
  return [...images].sort((a, b) => {
    const aa = a.angle ?? inferHoodieAngleFromFilename(a.file);
    const bb = b.angle ?? inferHoodieAngleFromFilename(b.file);
    return angleRank(aa) - angleRank(bb);
  });
}

export function shopImageSrc(artistSlug: string, file: string): string {
  const enc = encodeURIComponent(file);
  return `/api/artist-shop/${artistSlug}/${enc}`;
}

/** Default hoodie price (Moroccan dirham) — listings, carousel, and PDP */
export const HOODIE_PRICE_LABEL = "250 DH";

/** T-shirt price (Moroccan dirham) — ElGrandeToto folder carousels and T-shirt PDP */
export const TSHIRT_PRICE_LABEL = "175 DH";

/** Listing + PDP title, e.g. `Hoodie oversize .. Simple Salgoat` */
export function formatOversizeHoodieTitle(baseName: string): string {
  const n = baseName.trim();
  if (!n) return "Hoodie oversize";
  return `Hoodie oversize .. ${n}`;
}

/** Same pattern as hoodies, for T-shirt rows */
export function formatOversizeTshirtTitle(baseName: string): string {
  const n = baseName.trim();
  if (!n) return "T-shirt oversize";
  return `T-shirt oversize .. ${n}`;
}

export const artistHoodies: ArtistHoodie[] = [
  {
    itemSlug: "stage-black-hoodie",
    artistSlug: "babygang",
    name: "Stage black hoodie",
    priceLabel: HOODIE_PRICE_LABEL,
    images: [
      { file: "stage-hoodie-back.jpg", angle: "back" },
      { file: "stage-hoodie-front.jpg", angle: "front" },
    ],
  },
  {
    itemSlug: "quiet-line-hoodie",
    artistSlug: "tchubi",
    name: "Quiet line hoodie",
    priceLabel: HOODIE_PRICE_LABEL,
    images: [{ file: "quiet-hoodie-front.png", angle: "front" }, { file: "quiet-hoodie-back.png" }],
  },
  {
    itemSlug: "shadow-box-hoodie",
    artistSlug: "inkonnu",
    name: "Shadow box hoodie",
    priceLabel: HOODIE_PRICE_LABEL,
    images: [{ file: "shadow-hoodie-back.webp", angle: "back" }, { file: "shadow-hoodie-front.webp", angle: "front" }],
  },
];

export function hoodiesForArtist(artistSlug: string): ArtistHoodie[] {
  return artistHoodies.filter((h) => h.artistSlug === artistSlug);
}

export function findHoodie(artistSlug: string, itemSlug: string): ArtistHoodie | undefined {
  return artistHoodies.find((h) => h.artistSlug === artistSlug && h.itemSlug === itemSlug);
}
