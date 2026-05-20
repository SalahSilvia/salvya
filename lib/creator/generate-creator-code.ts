import type { CreatorNiche } from "@/lib/creator/types";

const NICHE_PREFIX: Partial<Record<CreatorNiche, string>> = {
  fashion: "STYLE",
  tech: "TECH",
  beauty: "GLOW",
  fitness: "FIT",
  lifestyle: "LIFE",
  gaming: "GAME",
  other: "CREATE",
};

function slugLetters(input: string, max: number): string {
  const letters = input.replace(/[^a-zA-Z]/g, "").toUpperCase();
  return letters.slice(0, max);
}

/** Build a short memorable creator code (e.g. SALAHX, TECHY). */
export function buildCreatorCodeSeed(fullName: string, niche: CreatorNiche): string {
  const namePart = slugLetters(fullName.split(/\s+/)[0] ?? fullName, 5);
  const nichePart = NICHE_PREFIX[niche] ?? "CREATE";
  if (namePart.length >= 4) return namePart;
  return slugLetters(`${nichePart}${namePart}`, 6) || nichePart.slice(0, 6);
}

export function withCreatorCodeSuffix(seed: string, suffix: string): string {
  const base = seed.replace(/[^A-Z0-9]/g, "").slice(0, 6);
  return `${base}${suffix}`.slice(0, 12);
}

export function randomCreatorCodeSuffix(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 2; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)]!;
  }
  return out;
}
