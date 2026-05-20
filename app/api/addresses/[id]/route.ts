import { NextResponse, type NextRequest } from "next/server";
import { rowToCustomerAddress } from "@/lib/addresses/map";
import { sanitizePatchAddressBody } from "@/lib/addresses/validate";
import { createServerSupabase, getSsrEnv } from "@/lib/supabase/server-ssr";

function jsonResponse(body: unknown, init?: ResponseInit) {
  const res = NextResponse.json(body, init);
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}

const SELECT =
  "id, user_id, full_name, phone, address_line_1, address_line_2, city, region, postal_code, country, is_default, created_at, updated_at";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(id: string): boolean {
  return UUID_RE.test(id);
}

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const env = getSsrEnv();
  if (!env) {
    return jsonResponse({ error: "Addresses unavailable" }, { status: 503 });
  }

  const { id } = await ctx.params;
  if (!id || !isUuid(id)) {
    return jsonResponse({ error: "Invalid address id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, { status: 400 });
  }

  const patch = sanitizePatchAddressBody(body);
  if (!patch) {
    return jsonResponse({ error: "Invalid patch" }, { status: 400 });
  }

  const res = jsonResponse({});
  try {
    const supabase = createServerSupabase(request, res);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return jsonResponse({ error: "Unauthorized" }, { status: 401 });
    }

    const row: Record<string, unknown> = {};
    if (patch.fullName !== undefined) row.full_name = patch.fullName;
    if (patch.phone !== undefined) row.phone = patch.phone;
    if (patch.addressLine1 !== undefined) row.address_line_1 = patch.addressLine1;
    if (patch.addressLine2 !== undefined) row.address_line_2 = patch.addressLine2;
    if (patch.city !== undefined) row.city = patch.city;
    if (patch.region !== undefined) row.region = patch.region;
    if (patch.postalCode !== undefined) row.postal_code = patch.postalCode;
    if (patch.country !== undefined) row.country = patch.country;
    if (patch.isDefault !== undefined) row.is_default = patch.isDefault;

    const { data, error } = await supabase
      .from("customer_addresses")
      .update(row)
      .eq("id", id)
      .eq("user_id", user.id)
      .select(SELECT)
      .maybeSingle();

    if (error) {
      return jsonResponse({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return jsonResponse({ error: "Address not found" }, { status: 404 });
    }

    return jsonResponse({ address: rowToCustomerAddress(data) });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Addresses unavailable";
    return jsonResponse({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const env = getSsrEnv();
  if (!env) {
    return jsonResponse({ error: "Addresses unavailable" }, { status: 503 });
  }

  const { id } = await ctx.params;
  if (!id || !isUuid(id)) {
    return jsonResponse({ error: "Invalid address id" }, { status: 400 });
  }

  const res = jsonResponse({});
  try {
    const supabase = createServerSupabase(request, res);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return jsonResponse({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase.from("customer_addresses").delete().eq("id", id).eq("user_id", user.id);

    if (error) {
      return jsonResponse({ error: error.message }, { status: 500 });
    }

    return jsonResponse({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Addresses unavailable";
    return jsonResponse({ error: message }, { status: 500 });
  }
}
