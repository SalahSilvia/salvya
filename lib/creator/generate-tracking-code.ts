import type { CreatorNiche } from "@/lib/creator/types";

function slugPart(input: string, max: number): string {
  return input.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, max);
}

/** e.g. SALAH-NIKE-X92, TECHY-TSHIRT-KL2 */
export function buildTrackingCodeSeed(creatorCode: string, productTitle: string): string {
  const creator = slugPart(creatorCode, 6) || "CREATE";
  const product = slugPart(productTitle.split(/\s+/)[0] ?? productTitle, 8) || "ITEM";
  return `${creator}-${product}`;
}

export function withTrackingSuffix(seed: string, suffix: string): string {
  const base = seed.replace(/[^A-Z0-9-]/g, "").slice(0, 24);
  return `${base}-${suffix}`.slice(0, 32);
}

export function randomTrackingSuffix(length = 3): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)]!;
  }
  return out;
}

export function randomTrackingSuffixFromNiche(_niche?: CreatorNiche): string {
  return randomTrackingSuffix(3);
}
