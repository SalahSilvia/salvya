import type { NextRequest } from "next/server";
import {
  createCreatorProductLink,
  listCreatorProductLinks,
} from "@/lib/creator/product-link-service";
import { requireCreator } from "@/lib/creator/require-creator";
import { rbacApiJson, rbacApiNotConfigured } from "@/lib/auth/api-errors";
import { createServiceSupabase } from "@/lib/supabase/service";

export async function GET(request: NextRequest) {
  const auth = await requireCreator(request);
  if (!auth.ok) return auth.response;

  const service = createServiceSupabase();
  if (!service) return rbacApiNotConfigured();

  try {
    const links = await listCreatorProductLinks(service, auth.user.id);
    return rbacApiJson({ ok: true, links });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load links";
    return rbacApiJson({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireCreator(request);
  if (!auth.ok) return auth.response;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return rbacApiJson({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const productId = String(body.productId ?? body.product_id ?? "").trim();
  if (!productId) {
    return rbacApiJson({ ok: false, error: "productId is required" }, { status: 400 });
  }

  const service = createServiceSupabase();
  if (!service) return rbacApiNotConfigured();

  const result = await createCreatorProductLink(service, auth.user.id, productId);
  if (!result.ok) {
    return rbacApiJson({ ok: false, error: result.error }, { status: 400 });
  }

  return rbacApiJson({ ok: true, link: result.link });
}
