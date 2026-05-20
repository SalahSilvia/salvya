import type { NextRequest } from "next/server";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import { metadataFromPayload, metadataToDb } from "@/lib/admin/product-metadata";
import {
  lifecycleFromPublishState,
  parseProductLifecycleStatus,
  parsePublishState,
  rowToAdminProduct,
  slugifyTitle,
  type PublishState,
  type SalvyaProductCategory,
  type SalvyaProductRow,
} from "@/lib/admin/types";
import { rbacApiJson } from "@/lib/auth/api-errors";
import { syncProductVariants } from "@/lib/inventory/sync-product-variants";

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminService(request);
  if (!admin.ok) return admin.response;

  const { id } = await ctx.params;
  if (!id) return rbacApiJson({ ok: false, error: "Missing id" }, { status: 400 });

  const { data, error } = await admin.service.from("salvya_products").select("*").eq("id", id).maybeSingle();

  if (error) return rbacApiJson({ ok: false, error: error.message }, { status: 500 });
  if (!data) return rbacApiJson({ ok: false, error: "Not found" }, { status: 404 });

  return rbacApiJson({ ok: true, product: rowToAdminProduct(data as SalvyaProductRow) });
}

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminService(request);
  if (!admin.ok) return admin.response;

  const { id } = await ctx.params;
  if (!id) return rbacApiJson({ ok: false, error: "Missing id" }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return rbacApiJson({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  if (!isRecord(body)) return rbacApiJson({ ok: false, error: "Invalid body" }, { status: 400 });

  const { data: existing, error: loadErr } = await admin.service.from("salvya_products").select("*").eq("id", id).maybeSingle();

  if (loadErr) return rbacApiJson({ ok: false, error: loadErr.message }, { status: 500 });
  if (!existing) return rbacApiJson({ ok: false, error: "Not found" }, { status: 404 });

  const cur = existing as SalvyaProductRow;

  const title = typeof body.title === "string" && body.title.trim() ? body.title.trim() : cur.title;
  const description =
    typeof body.description === "string" ? (body.description.trim() ? body.description.trim() : null) : cur.description;
  const slugFromBody =
    typeof body.slug === "string" && body.slug.trim()
      ? body.slug
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, "-")
          .replace(/^-+|-+$/g, "")
      : cur.slug;
  const slug = slugFromBody || slugifyTitle(title);

  const artistSlugRaw =
    typeof body.artistSlug === "string"
      ? body.artistSlug
      : typeof body.artist_slug === "string"
        ? body.artist_slug
        : cur.artist_slug;
  const artistSlug = artistSlugRaw.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (!artistSlug) return rbacApiJson({ ok: false, error: "artistSlug required" }, { status: 400 });

  let priceCents = cur.price_cents;
  if (typeof body.priceCents === "number" && Number.isFinite(body.priceCents)) priceCents = Math.max(0, Math.round(body.priceCents));
  else if (typeof body.price_cents === "number" && Number.isFinite(body.price_cents)) priceCents = Math.max(0, Math.round(body.price_cents));
  else if (typeof body.priceEuros === "number" && Number.isFinite(body.priceEuros)) priceCents = Math.max(0, Math.round(body.priceEuros * 100));

  let category: SalvyaProductCategory = cur.category;
  if (typeof body.category === "string") {
    const c = body.category;
    category =
      c === "hoodie" || c === "tee" || c === "accessories" || c === "other"
        ? c
        : cur.category;
  }

  let images = cur.images ?? [];
  if (Array.isArray(body.images)) {
    images = body.images.filter((x): x is string => typeof x === "string" && x.length > 0).slice(0, 12);
  }

  let stock = cur.stock;
  if (typeof body.stock === "number" && Number.isFinite(body.stock)) stock = Math.max(0, Math.floor(body.stock));

  let isLimitedDrop = cur.is_limited_drop;
  if (typeof body.isLimitedDrop === "boolean") isLimitedDrop = body.isLimitedDrop;
  else if (typeof body.is_limited_drop === "boolean") isLimitedDrop = body.is_limited_drop;

  let publishState: PublishState = parsePublishState(
    cur.publish_state,
    cur.published ? "published" : "draft",
  );
  if (body.publishState !== undefined || body.publish_state !== undefined) {
    publishState = parsePublishState(body.publishState ?? body.publish_state, publishState);
  } else if (typeof body.published === "boolean") {
    publishState = body.published ? "published" : "draft";
  }

  let lowStockThreshold =
    typeof cur.low_stock_threshold === "number" && Number.isFinite(cur.low_stock_threshold)
      ? cur.low_stock_threshold
      : 5;
  if (typeof body.lowStockThreshold === "number" && Number.isFinite(body.lowStockThreshold)) {
    lowStockThreshold = Math.max(0, Math.floor(body.lowStockThreshold));
  } else if (typeof body.low_stock_threshold === "number" && Number.isFinite(body.low_stock_threshold)) {
    lowStockThreshold = Math.max(0, Math.floor(body.low_stock_threshold));
  }

  const published = publishState === "published";

  let lifecycleStatus = parseProductLifecycleStatus(
    cur.status,
    lifecycleFromPublishState(publishState),
  );
  if (body.status !== undefined) {
    lifecycleStatus = parseProductLifecycleStatus(body.status, lifecycleStatus);
  }

  let scheduledAt: string | null =
    typeof cur.scheduled_at === "string" ? cur.scheduled_at : null;
  if (body.scheduledAt !== undefined || body.scheduled_at !== undefined) {
    const raw = body.scheduledAt ?? body.scheduled_at;
    scheduledAt = typeof raw === "string" && raw.trim() ? raw.trim() : null;
  }

  let metadata = metadataToDb(metadataFromPayload(cur.metadata ?? {}));
  if (
    body.metadata !== undefined ||
    body.sku !== undefined ||
    body.compareAtCents !== undefined ||
    body.compareAtEuros !== undefined ||
    body.sizeFit !== undefined ||
    body.material !== undefined ||
    body.featured !== undefined
  ) {
    metadata = metadataToDb(metadataFromPayload(body));
  }

  const patch: Record<string, unknown> = {
    title,
    description,
    slug,
    artist_slug: artistSlug,
    price_cents: priceCents,
    category,
    images,
    stock,
    is_limited_drop: isLimitedDrop,
    published,
    publish_state: publishState,
    status: lifecycleStatus,
    scheduled_at: scheduledAt,
    low_stock_threshold: lowStockThreshold,
    metadata,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await admin.service
    .from("salvya_products")
    .update(patch)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error?.code === "23505") {
    const bump = `${slugifyTitle(title)}-${Date.now().toString(36)}`;
    const retry = await admin.service
      .from("salvya_products")
      .update({ ...patch, slug: bump })
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (retry.error) return rbacApiJson({ ok: false, error: retry.error.message }, { status: 500 });
    if (!retry.data) return rbacApiJson({ ok: false, error: "Not found" }, { status: 404 });
    const retryRow = retry.data as SalvyaProductRow;
    const retryMeta =
      typeof retryRow.metadata === "object" && retryRow.metadata !== null
        ? (retryRow.metadata as Record<string, unknown>)
        : {};
    const retryVariantSync = await syncProductVariants(admin.service, {
      productId: retryRow.id,
      artistSlug: retryRow.artist_slug,
      productSlug: retryRow.slug,
      stock: retryRow.stock,
      metadata: retryMeta,
    });
    return rbacApiJson({
      ok: true,
      product: rowToAdminProduct(retryRow),
      variantSync: retryVariantSync.ok ? retryVariantSync : { ok: false, error: retryVariantSync.error },
    });
  }

  if (error) return rbacApiJson({ ok: false, error: error.message }, { status: 500 });
  if (!data) return rbacApiJson({ ok: false, error: "Not found" }, { status: 404 });

  const saved = data as SalvyaProductRow;
  const meta =
    typeof saved.metadata === "object" && saved.metadata !== null
      ? (saved.metadata as Record<string, unknown>)
      : {};
  const variantSync = await syncProductVariants(admin.service, {
    productId: saved.id,
    artistSlug: saved.artist_slug,
    productSlug: saved.slug,
    stock: saved.stock,
    metadata: meta,
  });

  return rbacApiJson({
    ok: true,
    product: rowToAdminProduct(saved),
    variantSync: variantSync.ok ? variantSync : { ok: false, error: variantSync.error },
  });
}

export async function DELETE(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminService(request);
  if (!admin.ok) return admin.response;

  const { id } = await ctx.params;
  if (!id) return rbacApiJson({ ok: false, error: "Missing id" }, { status: 400 });

  const { error } = await admin.service.from("salvya_products").delete().eq("id", id);

  if (error) return rbacApiJson({ ok: false, error: error.message }, { status: 500 });

  return rbacApiJson({ ok: true });
}
