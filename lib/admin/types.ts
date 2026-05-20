import type { OrderLineItem } from "@/lib/orders/types";
import { metadataFromPayload, metadataToDb, parseProductMetadata, type ProductMetadata } from "@/lib/admin/product-metadata";

export type SalvyaProductCategory = "hoodie" | "tee" | "accessories" | "other";

export type PublishState = "draft" | "published" | "archived";
export type ProductLifecycleStatus = "draft" | "scheduled" | "live" | "archived";

export type SalvyaProductRow = {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  artist_slug: string;
  price_cents: number;
  price_eur?: number | null;
  price_usd?: number | null;
  price_mad?: number | null;
  market_prices?: Record<string, unknown> | null;
  category: SalvyaProductCategory;
  images: string[];
  stock: number;
  is_limited_drop: boolean;
  published: boolean;
  /** Present after `20250516180000_order_status_history_products_publish.sql`. */
  publish_state?: PublishState | string | null;
  status?: ProductLifecycleStatus | string | null;
  scheduled_at?: string | null;
  published_at?: string | null;
  low_stock_threshold?: number | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type { ProductMetadata };

export function slugifyTitle(title: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base || "product";
}

export function parsePublishState(v: unknown, fallback: PublishState): PublishState {
  if (v === "draft" || v === "published" || v === "archived") return v;
  return fallback;
}

export function parseProductLifecycleStatus(
  v: unknown,
  fallback: ProductLifecycleStatus,
): ProductLifecycleStatus {
  if (v === "draft" || v === "scheduled" || v === "live" || v === "archived") return v;
  if (v === "published") return "live";
  return fallback;
}

export function lifecycleFromPublishState(ps: PublishState): ProductLifecycleStatus {
  if (ps === "published") return "live";
  if (ps === "archived") return "archived";
  return "draft";
}

export function rowToAdminProduct(row: SalvyaProductRow) {
  const publishState = parsePublishState(
    row.publish_state,
    row.published ? "published" : "draft",
  );
  const lifecycleStatus = parseProductLifecycleStatus(
    row.status,
    lifecycleFromPublishState(publishState),
  );
  const lowStockThreshold =
    typeof row.low_stock_threshold === "number" && Number.isFinite(row.low_stock_threshold)
      ? Math.max(0, Math.floor(row.low_stock_threshold))
      : 5;
  const soldOut = row.stock <= 0;
  const lowStock = !soldOut && row.stock > 0 && row.stock <= lowStockThreshold;

  const meta = parseProductMetadata(row.metadata ?? {});

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    slug: row.slug,
    artistSlug: row.artist_slug,
    priceCents: row.price_cents,
    priceEur: typeof row.price_eur === "number" ? row.price_eur : null,
    priceUsd: typeof row.price_usd === "number" ? row.price_usd : null,
    priceMad: typeof row.price_mad === "number" ? row.price_mad : null,
    marketPrices: row.market_prices ?? null,
    category: row.category,
    images: row.images ?? [],
    stock: row.stock,
    isLimitedDrop: row.is_limited_drop,
    published: row.published,
    publishState,
    lifecycleStatus,
    scheduledAt: row.scheduled_at ?? null,
    publishedAt: row.published_at ?? null,
    lowStockThreshold,
    soldOut,
    lowStock,
    sku: meta.sku ?? null,
    compareAtCents: meta.compareAtCents ?? null,
    sizeFit: meta.sizeFit ?? null,
    material: meta.material ?? null,
    featured: meta.featured ?? false,
    subtitle: meta.subtitle ?? null,
    badge: meta.badge ?? null,
    sizes: meta.sizes ?? [],
    colors: meta.colors ?? [],
    careInstructions: meta.careInstructions ?? null,
    shippingNote: meta.shippingNote ?? null,
    metaTitle: meta.metaTitle ?? null,
    metaDescription: meta.metaDescription ?? null,
    maxPerOrder: meta.maxPerOrder ?? null,
    preorder: meta.preorder ?? false,
    preorderShipDate: meta.preorderShipDate ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export type AdminProductDTO = ReturnType<typeof rowToAdminProduct>;

export function sanitizeProductPayload(body: Record<string, unknown>): {
  title: string;
  description: string | null;
  slug: string;
  artistSlug: string;
  priceCents: number;
  category: SalvyaProductCategory;
  images: string[];
  stock: number;
  isLimitedDrop: boolean;
  published: boolean;
  publishState: PublishState;
  lowStockThreshold: number;
  metadata: Record<string, unknown>;
} | null {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) return null;

  const artistSlug =
    typeof body.artistSlug === "string"
      ? body.artistSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "")
      : "";
  if (!artistSlug) return null;

  let slug =
    typeof body.slug === "string" && body.slug.trim()
      ? body.slug
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, "-")
          .replace(/^-+|-+$/g, "")
      : slugifyTitle(title);
  if (!slug) slug = `product-${Date.now()}`;

  const description =
    typeof body.description === "string" && body.description.trim() ? body.description.trim() : null;

  const priceRaw = body.priceCents ?? body.price_cents;
  let priceCents = 0;
  if (typeof priceRaw === "number" && Number.isFinite(priceRaw)) priceCents = Math.max(0, Math.round(priceRaw));
  else if (typeof body.priceEuros === "number" && Number.isFinite(body.priceEuros))
    priceCents = Math.max(0, Math.round(body.priceEuros * 100));

  const catRaw = typeof body.category === "string" ? body.category : "other";
  const category: SalvyaProductCategory =
    catRaw === "hoodie" || catRaw === "tee" || catRaw === "accessories" || catRaw === "other" ? catRaw : "other";

  const images = Array.isArray(body.images)
    ? body.images.filter((x): x is string => typeof x === "string" && x.length > 0).slice(0, 12)
    : [];

  const stock =
    typeof body.stock === "number" && Number.isFinite(body.stock) ? Math.max(0, Math.floor(body.stock)) : 0;

  const isLimitedDrop = body.isLimitedDrop === true || body.is_limited_drop === true;

  let publishState = parsePublishState(body.publishState ?? body.publish_state, "draft");
  if (body.published === true && body.publishState === undefined && body.publish_state === undefined) {
    publishState = "published";
  }

  let lowStockThreshold = 5;
  const lst = body.lowStockThreshold ?? body.low_stock_threshold;
  if (typeof lst === "number" && Number.isFinite(lst)) lowStockThreshold = Math.max(0, Math.floor(lst));

  const published = publishState === "published";
  const metadata = metadataToDb(metadataFromPayload(body));

  return {
    title,
    description,
    slug,
    artistSlug,
    priceCents,
    category,
    images,
    stock,
    isLimitedDrop,
    published,
    publishState,
    lowStockThreshold,
    metadata,
  };
}

export type AdminOrderListRow = {
  id: string;
  order_number: string;
  user_id: string | null;
  line_item: OrderLineItem;
  shipping: Record<string, unknown>;
  payment: Record<string, unknown>;
  fulfillment_status: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
};
