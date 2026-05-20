import { NextResponse, type NextRequest } from "next/server";
import { rowToCustomerAddress } from "@/lib/addresses/map";
import { sanitizeCreateAddressBody } from "@/lib/addresses/validate";
import { createServerSupabase, getSsrEnv } from "@/lib/supabase/server-ssr";

function jsonResponse(body: unknown, init?: ResponseInit) {
  const res = NextResponse.json(body, init);
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}

const SELECT =
  "id, user_id, full_name, phone, address_line_1, address_line_2, city, region, postal_code, country, is_default, created_at, updated_at";

export async function GET(request: NextRequest) {
  const env = getSsrEnv();
  if (!env) {
    return jsonResponse({ error: "Addresses unavailable" }, { status: 503 });
  }

  const res = jsonResponse({ addresses: [] });
  try {
    const supabase = createServerSupabase(request, res);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return jsonResponse({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("customer_addresses")
      .select(SELECT)
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      return jsonResponse({ error: error.message }, { status: 500 });
    }

    const addresses = (data ?? []).map(rowToCustomerAddress);
    return jsonResponse({ addresses });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Addresses unavailable";
    return jsonResponse({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const env = getSsrEnv();
  if (!env) {
    return jsonResponse({ error: "Addresses unavailable" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, { status: 400 });
  }

  const input = sanitizeCreateAddressBody(body);
  if (!input) {
    return jsonResponse({ error: "Invalid address payload" }, { status: 400 });
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

    const { count, error: countError } = await supabase
      .from("customer_addresses")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (countError) {
      return jsonResponse({ error: countError.message }, { status: 500 });
    }

    const firstEver = (count ?? 0) === 0;
    const isDefault = Boolean(input.isDefault || firstEver);

    const { data, error } = await supabase
      .from("customer_addresses")
      .insert({
        user_id: user.id,
        full_name: input.fullName,
        phone: input.phone,
        address_line_1: input.addressLine1,
        address_line_2: input.addressLine2,
        city: input.city,
        region: input.region,
        postal_code: input.postalCode,
        country: input.country,
        is_default: isDefault,
      })
      .select(SELECT)
      .single();

    if (error) {
      return jsonResponse({ error: error.message }, { status: 500 });
    }

    return jsonResponse({ address: rowToCustomerAddress(data) });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Addresses unavailable";
    return jsonResponse({ error: message }, { status: 500 });
  }
}
