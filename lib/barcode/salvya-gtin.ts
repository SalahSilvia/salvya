/**
 * Salvya retail GTIN-13 (EAN-13): stable 13-digit codes for SKU + barcode.
 * Company block 843701 (fictional GS1-style prefix) + 6-digit item ref + check digit.
 */

/** Six-digit GS1 company prefix (Salvya catalog). */
export const SALVYA_COMPANY_PREFIX = "843701";

const ARTIST_CODES: Record<string, string> = {
  babygang: "01",
  elgrandetoto: "02",
  inkonnu: "03",
  tchubi: "04",
};

export type SalvyaGtinInput = {
  artistSlug: string;
  category: string;
  slug: string;
};

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/** EAN-13 check digit for the first 12 digits. */
export function ean13CheckDigit(twelveDigits: string): string {
  const d = digitsOnly(twelveDigits);
  if (d.length !== 12) throw new Error("EAN-13 requires 12 digits before check");
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const n = Number(d[i]);
    sum += i % 2 === 0 ? n : n * 3;
  }
  return String((10 - (sum % 10)) % 10);
}

function categoryDigit(category: string): string {
  if (category === "hoodie") return "1";
  if (category === "tee") return "2";
  if (category === "accessories") return "3";
  return "9";
}

/** Stable 3-digit product sequence from artist + category + slug. */
export function stableProductSequence(key: string): string {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return String((h >>> 0) % 1000).padStart(3, "0");
}

/** Six-digit item reference: artist (2) + category (1) + sequence (3). */
export function salvyaItemReference(input: SalvyaGtinInput): string {
  const artist = ARTIST_CODES[input.artistSlug.toLowerCase()] ?? "99";
  const cat = categoryDigit(input.category);
  const seq = stableProductSequence(`${input.artistSlug}|${input.category}|${input.slug}`);
  return `${artist}${cat}${seq}`;
}

/** Build a valid 13-digit GTIN for catalog + barcode (EAN-13). */
export function buildSalvyaGtin13(input: SalvyaGtinInput): string {
  const item = salvyaItemReference(input);
  const body = `${SALVYA_COMPANY_PREFIX}${item}`;
  return body + ean13CheckDigit(body);
}

export function isValidGtin13(value: string): boolean {
  const d = digitsOnly(value);
  if (d.length !== 13 || !/^\d{13}$/.test(d)) return false;
  return d[12] === ean13CheckDigit(d.slice(0, 12));
}

/** GS1 human-readable under barcode: `8 437012 00145 7` */
export function formatEan13Human(gtin13: string): string {
  const d = digitsOnly(gtin13);
  if (d.length !== 13) return gtin13.trim();
  return `${d[0]} ${d.slice(1, 7)} ${d.slice(7, 12)} ${d[12]}`;
}

/** Catalog SKU line: `8437 · 012 · 00145 · 7` */
export function formatSalvyaSkuHuman(gtin13: string): string {
  const d = digitsOnly(gtin13);
  if (d.length !== 13) return gtin13.trim();
  return `${d.slice(0, 4)} · ${d.slice(4, 7)} · ${d.slice(7, 12)} · ${d[12]}`;
}

/** Compact storage / copy: `8437-012-00145-7` */
export function formatSalvyaSkuCompact(gtin13: string): string {
  const d = digitsOnly(gtin13);
  if (d.length !== 13) return gtin13.trim();
  return `${d.slice(0, 4)}-${d.slice(4, 7)}-${d.slice(7, 12)}-${d[12]}`;
}

export function isLegacyTextSku(sku: string): boolean {
  return /^SV[-_]/i.test(sku.trim());
}

export type GtinResolveInput = {
  sku?: string | null;
  slug?: string | null;
  artistSlug?: string | null;
  category?: string | null;
};

/** Normalize to 13-digit GTIN for encoding; rebuild legacy SKUs when context exists. */
export function resolveSalvyaGtin13(input: GtinResolveInput): string | null {
  const raw = (input.sku ?? "").trim();
  const digits = digitsOnly(raw);

  if (digits.length === 13 && isValidGtin13(digits)) return digits;

  const artist = (input.artistSlug ?? "").trim().toLowerCase();
  const slug = (input.slug ?? "").trim();
  const category = (input.category ?? "hoodie").trim();

  if (artist && slug) {
    return buildSalvyaGtin13({ artistSlug: artist, category, slug });
  }

  if (digits.length === 13) return digits;

  return null;
}
