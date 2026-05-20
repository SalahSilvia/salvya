import type { NextRequest } from "next/server";
import { requireAuthenticated } from "@/lib/auth/require-role";
import { CUSTOMER_ORDER_SELECT } from "@/lib/orders/order-db-row";
import {
  buildOrderInvoiceDocument,
  collectVariantIdsForInvoice,
} from "@/lib/orders/order-invoice-data";
import { generateOrderInvoicePdf, invoicePdfFilename } from "@/lib/orders/generate-order-invoice-pdf";
import { rowToCustomerOrder } from "@/lib/orders/validate";
import { createServiceSupabase } from "@/lib/supabase/service";

type Params = { params: Promise<{ orderId: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const auth = await requireAuthenticated(request);
  if (!auth.ok) return auth.response;

  const { orderId } = await params;
  const service = createServiceSupabase();
  if (!service) {
    return new Response("Not configured", { status: 503 });
  }

  const { data: row, error } = await service
    .from("customer_orders")
    .select(CUSTOMER_ORDER_SELECT)
    .eq("id", orderId)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (error) {
    return new Response(error.message, { status: 500 });
  }
  if (!row) {
    return new Response("Not found", { status: 404 });
  }

  const order = rowToCustomerOrder(row);
  if (!order) {
    return new Response("Invalid order", { status: 500 });
  }

  const variantIds = collectVariantIdsForInvoice(order);
  const variantSkuById = new Map<string, string>();

  if (variantIds.length > 0) {
    const { data: variants } = await service.from("product_variants").select("id, sku").in("id", variantIds);
    for (const v of variants ?? []) {
      if (v.id && typeof v.sku === "string") variantSkuById.set(v.id, v.sku);
    }
  }

  const invoice = buildOrderInvoiceDocument(order, row.product_snapshot, variantSkuById);
  const pdfBytes = await generateOrderInvoicePdf(invoice);
  const filename = invoicePdfFilename(order.orderNumber);

  return new Response(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
