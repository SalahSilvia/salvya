import type { LikedItemRecord, LikedProductType } from "@/lib/member/likes-storage";

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

export function isLikedItemRecord(x: unknown): x is LikedItemRecord {
  if (!isRecord(x)) return false;
  const type = x.type;
  return (
    typeof x.productId === "string" &&
    typeof x.timestamp === "number" &&
    Number.isFinite(x.timestamp) &&
    (type === "tee" || type === "hoodie") &&
    typeof x.artistSlug === "string" &&
    typeof x.title === "string" &&
    typeof x.imageSrc === "string" &&
    typeof x.href === "string" &&
    typeof x.priceLabel === "string" &&
    typeof x.artistLabel === "string"
  );
}

export function normalizeLikedItem(raw: LikedItemRecord): LikedItemRecord {
  return {
    productId: raw.productId,
    timestamp: Math.round(raw.timestamp),
    type: raw.type as LikedProductType,
    artistSlug: raw.artistSlug,
    title: raw.title,
    imageSrc: raw.imageSrc,
    href: raw.href,
    priceLabel: raw.priceLabel,
    artistLabel: raw.artistLabel,
  };
}

export function sanitizeLikedItems(parsed: unknown): LikedItemRecord[] {
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter(isLikedItemRecord)
    .map(normalizeLikedItem)
    .sort((a, b) => b.timestamp - a.timestamp);
}
