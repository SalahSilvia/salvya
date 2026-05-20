export type ProductColorOption = {
  id?: string;
  name: string;
  hex?: string;
  front?: string;
  back?: string;
  models?: string[];
};

export type ProductMetadata = {
  sku?: string;
  compareAtCents?: number;
  sizeFit?: string;
  material?: string;
  featured?: boolean;
  subtitle?: string;
  badge?: string;
  sizes?: string[];
  colors?: ProductColorOption[];
  careInstructions?: string;
  shippingNote?: string;
  metaTitle?: string;
  metaDescription?: string;
  maxPerOrder?: number;
  preorder?: boolean;
  preorderShipDate?: string;
};

const BADGE_PRESETS = ["New", "Bestseller", "Exclusive", "Limited"] as const;
export const PRODUCT_BADGE_PRESETS: readonly string[] = BADGE_PRESETS;

function parseString(v: unknown, max: number): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t ? t.slice(0, max) : undefined;
}

function parseSizes(v: unknown): string[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const out = v
    .filter((x): x is string => typeof x === "string")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 12);
  return out.length ? [...new Set(out)] : undefined;
}

function parseImageUrl(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t ? t : undefined;
}

function parseColorModels(v: unknown): string[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const out = v
    .filter((x): x is string => typeof x === "string" && Boolean(x.trim()))
    .map((s) => s.trim())
    .slice(0, 8);
  return out.length ? out : undefined;
}

function parseColors(v: unknown): ProductColorOption[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const out: ProductColorOption[] = [];
  for (const item of v) {
    if (typeof item === "string" && item.trim()) {
      out.push({ name: item.trim().slice(0, 40) });
      continue;
    }
    if (typeof item === "object" && item !== null && !Array.isArray(item)) {
      const o = item as Record<string, unknown>;
      const name = typeof o.name === "string" ? o.name.trim() : "";
      if (!name) continue;
      let hex: string | undefined;
      if (typeof o.hex === "string" && /^#[0-9a-fA-F]{3,8}$/.test(o.hex.trim())) {
        hex = o.hex.trim();
      }
      const id = parseString(o.id, 64);
      const front = parseImageUrl(o.front);
      const back = parseImageUrl(o.back);
      const models = parseColorModels(o.models);
      const entry: ProductColorOption = { name: name.slice(0, 40) };
      if (id) entry.id = id;
      if (hex) entry.hex = hex;
      if (front) entry.front = front;
      if (back) entry.back = back;
      if (models) entry.models = models;
      out.push(entry);
    }
  }
  return out.length ? out.slice(0, 8) : undefined;
}

export function parseProductMetadata(raw: unknown): ProductMetadata {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return {};
  const o = raw as Record<string, unknown>;
  const meta: ProductMetadata = {};

  const sku = parseString(o.sku, 64);
  if (sku) meta.sku = sku;

  const compareRaw = o.compareAtCents ?? o.compare_at_cents;
  if (typeof compareRaw === "number" && Number.isFinite(compareRaw) && compareRaw > 0) {
    meta.compareAtCents = Math.round(compareRaw);
  }

  const sizeFit = parseString(o.sizeFit ?? o.size_fit, 2000);
  if (sizeFit) meta.sizeFit = sizeFit;

  const material = parseString(o.material, 500);
  if (material) meta.material = material;

  if (o.featured === true) meta.featured = true;

  const subtitle = parseString(o.subtitle, 120);
  if (subtitle) meta.subtitle = subtitle;

  const badge = parseString(o.badge, 32);
  if (badge) meta.badge = badge;

  const sizes = parseSizes(o.sizes);
  if (sizes) meta.sizes = sizes;

  const colors = parseColors(o.colors);
  if (colors) meta.colors = colors;

  const care = parseString(o.careInstructions ?? o.care_instructions, 1500);
  if (care) meta.careInstructions = care;

  const ship = parseString(o.shippingNote ?? o.shipping_note, 500);
  if (ship) meta.shippingNote = ship;

  const metaTitle = parseString(o.metaTitle ?? o.meta_title, 70);
  if (metaTitle) meta.metaTitle = metaTitle;

  const metaDescription = parseString(o.metaDescription ?? o.meta_description, 160);
  if (metaDescription) meta.metaDescription = metaDescription;

  const maxRaw = o.maxPerOrder ?? o.max_per_order;
  if (typeof maxRaw === "number" && Number.isFinite(maxRaw) && maxRaw > 0) {
    meta.maxPerOrder = Math.min(99, Math.floor(maxRaw));
  }

  if (o.preorder === true) meta.preorder = true;

  const shipDate = parseString(o.preorderShipDate ?? o.preorder_ship_date, 32);
  if (shipDate) meta.preorderShipDate = shipDate;

  return meta;
}

export function metadataFromPayload(body: Record<string, unknown>): ProductMetadata {
  if (body.metadata !== undefined) return parseProductMetadata(body.metadata);
  return parseProductMetadata({
    sku: body.sku,
    compareAtCents:
      typeof body.compareAtCents === "number"
        ? body.compareAtCents
        : typeof body.compareAtEuros === "number"
          ? Math.round(body.compareAtEuros * 100)
          : undefined,
    sizeFit: body.sizeFit ?? body.size_fit,
    material: body.material,
    featured: body.featured,
    subtitle: body.subtitle,
    badge: body.badge,
    sizes: body.sizes,
    colors: body.colors,
    careInstructions: body.careInstructions ?? body.care_instructions,
    shippingNote: body.shippingNote ?? body.shipping_note,
    metaTitle: body.metaTitle ?? body.meta_title,
    metaDescription: body.metaDescription ?? body.meta_description,
    maxPerOrder: body.maxPerOrder ?? body.max_per_order,
    preorder: body.preorder,
    preorderShipDate: body.preorderShipDate ?? body.preorder_ship_date,
  });
}

export function metadataToDb(meta: ProductMetadata): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (meta.sku) out.sku = meta.sku;
  if (meta.compareAtCents && meta.compareAtCents > 0) out.compareAtCents = meta.compareAtCents;
  if (meta.sizeFit) out.sizeFit = meta.sizeFit;
  if (meta.material) out.material = meta.material;
  if (meta.featured) out.featured = true;
  if (meta.subtitle) out.subtitle = meta.subtitle;
  if (meta.badge) out.badge = meta.badge;
  if (meta.sizes?.length) out.sizes = meta.sizes;
  if (meta.colors?.length) out.colors = meta.colors;
  if (meta.careInstructions) out.careInstructions = meta.careInstructions;
  if (meta.shippingNote) out.shippingNote = meta.shippingNote;
  if (meta.metaTitle) out.metaTitle = meta.metaTitle;
  if (meta.metaDescription) out.metaDescription = meta.metaDescription;
  if (meta.maxPerOrder && meta.maxPerOrder > 0) out.maxPerOrder = meta.maxPerOrder;
  if (meta.preorder) out.preorder = true;
  if (meta.preorderShipDate) out.preorderShipDate = meta.preorderShipDate;
  return out;
}
