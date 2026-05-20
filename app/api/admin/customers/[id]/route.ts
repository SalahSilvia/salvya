import type { NextRequest } from "next/server";
import { adminOrderTotalCentsFromDbRow } from "@/lib/admin/order-money";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import { rbacApiJson } from "@/lib/auth/api-errors";
import { normalizeSalvyaRole, salvyaRoleToClient } from "@/lib/auth/roles";
import { isOrderLineItem } from "@/lib/orders/validate";

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminService(request);
  if (!admin.ok) return admin.response;

  const { id } = await ctx.params;
  if (!id) return rbacApiJson({ ok: false, error: "Missing id" }, { status: 400 });

  const { data: authUser, error: authErr } = await admin.service.auth.admin.getUserById(id);
  if (authErr) return rbacApiJson({ ok: false, error: authErr.message }, { status: 500 });
  if (!authUser?.user) return rbacApiJson({ ok: false, error: "Not found" }, { status: 404 });

  const u = authUser.user;

  const { data: profile } = await admin.service.from("user_profiles").select("user_id, role, created_at").eq("user_id", id).maybeSingle();

  const { data: addresses } = await admin.service
    .from("customer_addresses")
    .select("id, full_name, phone, address_line_1, address_line_2, city, region, postal_code, country, is_default, created_at")
    .eq("user_id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: orders } = await admin.service
    .from("customer_orders")
    .select("id, order_number, line_item, final_price, order_currency, payment_status, fulfillment_status, created_at")
    .eq("user_id", id)
    .order("created_at", { ascending: false })
    .limit(40);

  const orderList = (orders ?? []).map((r) => ({
    id: r.id,
    orderNumber: r.order_number,
    total: isOrderLineItem(r.line_item) ? Math.round(adminOrderTotalCentsFromDbRow(r)) / 100 : 0,
    paymentStatus: r.payment_status,
    fulfillmentStatus: r.fulfillment_status,
    createdAt: r.created_at,
  }));

  const { data: likesRow } = await admin.service.from("customer_likes").select("items").eq("user_id", id).maybeSingle();
  let likesCount = 0;
  if (likesRow && Array.isArray((likesRow as { items?: unknown }).items)) {
    likesCount = (likesRow as { items: unknown[] }).items.length;
  }

  const { data: followsRow } = await admin.service.from("customer_artist_follows").select("follows").eq("user_id", id).maybeSingle();
  let followsCount = 0;
  if (followsRow && Array.isArray((followsRow as { follows?: unknown }).follows)) {
    followsCount = (followsRow as { follows: unknown[] }).follows.length;
  }

  const { count: commentsCount } = await admin.service
    .from("product_reviews")
    .select("id", { count: "exact", head: true })
    .eq("user_id", id);

  const roleRaw = normalizeSalvyaRole(profile?.role) ?? "customer";

  return rbacApiJson({
    ok: true,
    customer: {
      id: u.id,
      email: u.email ?? "",
      createdAt: profile?.created_at ?? u.created_at,
      lastSignInAt: u.last_sign_in_at ?? null,
      rolePublic: salvyaRoleToClient(roleRaw),
    },
    addresses: addresses ?? [],
    orders: orderList,
    engagement: {
      likesCount,
      followsCount,
      commentsCount: commentsCount ?? 0,
    },
  });
}
