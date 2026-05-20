import type { NextRequest } from "next/server";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import { syncAllProductVariants, syncProductVariants } from "@/lib/inventory/sync-product-variants";
import { rbacApiJson } from "@/lib/auth/api-errors";

export async function POST(request: NextRequest) {
  const ctx = await requireAdminService(request);
  if (!ctx.ok) return ctx.response;

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    /* empty body → sync all */
  }

  const record = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  const productId = typeof record.productId === "string" ? record.productId.trim() : "";

  if (productId) {
    const { data: row, error } = await ctx.service
      .from("salvya_products")
      .select("id, artist_slug, slug, stock, metadata")
      .eq("id", productId)
      .maybeSingle();

    if (error) return rbacApiJson({ ok: false, error: error.message }, { status: 500 });
    if (!row) return rbacApiJson({ ok: false, error: "Product not found" }, { status: 404 });

    const metadata =
      typeof row.metadata === "object" && row.metadata !== null ? (row.metadata as Record<string, unknown>) : {};

    const result = await syncProductVariants(ctx.service, {
      productId: row.id as string,
      artistSlug: row.artist_slug as string,
      productSlug: row.slug as string,
      stock: typeof row.stock === "number" ? row.stock : 0,
      metadata,
    });

    return rbacApiJson(
      { ok: result.ok, result },
      { status: result.ok ? 200 : 500 },
    );
  }

  const onlyLive = record.onlyLive !== false;
  const result = await syncAllProductVariants(ctx.service, { onlyLive });

  return rbacApiJson(
    { ok: result.ok, result },
    { status: result.ok ? 200 : 207 },
  );
}
