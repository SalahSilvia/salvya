import type { NextRequest } from "next/server";
import type { AdminCreatorPromoInsights } from "@/lib/creator/product-link-types";
import { rbacApiJson } from "@/lib/auth/api-errors";
import { requireAdminService } from "@/lib/admin/require-admin-service";

export async function GET(request: NextRequest) {
  const admin = await requireAdminService(request);
  if (!admin.ok) return admin.response;

  const { data, error } = await admin.service.from("creator_product_links").select("*").limit(500);

  if (error) {
    if (error.code === "42P01" || error.message.includes("does not exist")) {
      return rbacApiJson({
        ok: true,
        insights: { topProducts: [], topCreators: [] } satisfies AdminCreatorPromoInsights,
      });
    }
    return rbacApiJson({ ok: false, error: error.message }, { status: 500 });
  }

  const rows = data ?? [];
  const productMap = new Map<string, { productId: string; title: string; linkCount: number; clicks: number }>();
  const creatorMap = new Map<string, { creatorId: string; creatorCode: string; linkCount: number; clicks: number }>();

  const productIds = [...new Set(rows.map((r) => r.product_id as string))];
  const { data: products } = await admin.service
    .from("salvya_products")
    .select("id, title")
    .in("id", productIds.length ? productIds : ["00000000-0000-0000-0000-000000000000"]);

  const titleById = new Map((products ?? []).map((p) => [p.id as string, p.title as string]));

  for (const row of rows) {
    const pid = row.product_id as string;
    const cid = row.creator_id as string;
    const clicks = (row.clicks_count as number) ?? 0;
    const code = (row.creator_code as string) ?? "—";

    const p = productMap.get(pid) ?? {
      productId: pid,
      title: titleById.get(pid) ?? "Product",
      linkCount: 0,
      clicks: 0,
    };
    p.linkCount += 1;
    p.clicks += clicks;
    productMap.set(pid, p);

    const c = creatorMap.get(cid) ?? { creatorId: cid, creatorCode: code, linkCount: 0, clicks: 0 };
    c.linkCount += 1;
    c.clicks += clicks;
    creatorMap.set(cid, c);
  }

  const topProducts = [...productMap.values()].sort((a, b) => b.clicks - a.clicks).slice(0, 8);
  const topCreators = [...creatorMap.values()].sort((a, b) => b.linkCount - a.linkCount).slice(0, 8);

  return rbacApiJson({
    ok: true,
    insights: { topProducts, topCreators } satisfies AdminCreatorPromoInsights,
  });
}
