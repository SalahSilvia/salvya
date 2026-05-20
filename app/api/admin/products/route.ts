import type { NextRequest } from "next/server";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import {
  rowToAdminProduct,
  sanitizeProductPayload,
  slugifyTitle,
  type SalvyaProductRow,
} from "@/lib/admin/types";
import { productMatchesColorFilter, type FolderColorKey } from "@/lib/catalog/catalog-folder-colors";
import { rbacApiJson } from "@/lib/auth/api-errors";

export async function GET(request: NextRequest) {
  const ctx = await requireAdminService(request);
  if (!ctx.ok) return ctx.response;

  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const category = (url.searchParams.get("category") ?? "").trim();
  const publish = (url.searchParams.get("publishState") ?? url.searchParams.get("publish") ?? "").trim();
  const stock = (url.searchParams.get("stock") ?? "").trim();
  const source = (url.searchParams.get("source") ?? "").trim();
  const colorParam = (url.searchParams.get("color") ?? "").trim().toLowerCase();
  const colorFilter: FolderColorKey | null =
    colorParam === "black" || colorParam === "white" ? colorParam : null;

  let sq = ctx.service
    .from("salvya_products")
    .select("*")
    .order("artist_slug", { ascending: true })
    .order("updated_at", { ascending: false })
    .limit(500);

  if (q) {
    const esc = q.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
    sq = sq.or(`title.ilike.%${esc}%,artist_slug.ilike.%${esc}%,slug.ilike.%${esc}%`);
  }
  if (category === "hoodie" || category === "tee" || category === "accessories" || category === "other") {
    sq = sq.eq("category", category);
  }
  if (publish === "draft" || publish === "published" || publish === "archived") {
    sq = sq.eq("publish_state", publish);
  } else if (publish === "live") {
    sq = sq.eq("published", true);
  }
  if (stock === "out") {
    sq = sq.eq("stock", 0);
  }

  const { data, error } = await sq;

  if (error) {
    if (error.code === "42P01" || error.message.includes("does not exist")) {
      return rbacApiJson({ ok: true, products: [] });
    }
    return rbacApiJson({ ok: false, error: error.message }, { status: 500 });
  }

  let rows = (data ?? []) as SalvyaProductRow[];

  if (source === "folder" || source === "legacy" || source === "manual") {
    rows = rows.filter((row) => {
      const meta = row.metadata;
      const catalogSource =
        typeof meta === "object" && meta !== null && typeof meta.catalogSource === "string"
          ? meta.catalogSource
          : null;
      if (source === "manual") return !catalogSource;
      if (source === "folder") return catalogSource === "folder_hoodie" || catalogSource === "folder_tee";
      if (source === "legacy") return catalogSource === "legacy_hoodie";
      return true;
    });
  }

  let products = rows.map(rowToAdminProduct);

  if (colorFilter) {
    products = products.filter((p) => productMatchesColorFilter(p.colors, p.title, colorFilter));
  }

  return rbacApiJson({ ok: true, products });
}

export async function POST(request: NextRequest) {
  const ctx = await requireAdminService(request);
  if (!ctx.ok) return ctx.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return rbacApiJson({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed =
    typeof body === "object" && body !== null
      ? sanitizeProductPayload(body as Record<string, unknown>)
      : null;
  if (!parsed) return rbacApiJson({ ok: false, error: "Invalid product payload" }, { status: 400 });

  let attempt = 0;
  let lastErr: string | null = null;
  while (attempt < 12) {
    const slug = attempt === 0 ? parsed.slug : `${slugifyTitle(parsed.title)}-${attempt}`;
    const row = {
      title: parsed.title,
      description: parsed.description,
      slug,
      artist_slug: parsed.artistSlug,
      price_cents: parsed.priceCents,
      category: parsed.category,
      images: parsed.images,
      stock: parsed.stock,
      is_limited_drop: parsed.isLimitedDrop,
      published: parsed.published,
      publish_state: parsed.publishState,
      low_stock_threshold: parsed.lowStockThreshold,
      metadata: parsed.metadata,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await ctx.service.from("salvya_products").insert(row).select("*").single();

    if (!error && data) {
      return rbacApiJson({ ok: true, product: rowToAdminProduct(data as SalvyaProductRow) });
    }

    lastErr = error?.message ?? "insert failed";
    if (error?.code === "23505") {
      attempt += 1;
      continue;
    }
    return rbacApiJson({ ok: false, error: lastErr }, { status: 500 });
  }

  return rbacApiJson({ ok: false, error: lastErr ?? "Could not allocate slug" }, { status: 500 });
}
