import type { NextRequest } from "next/server";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import { rbacApiJson } from "@/lib/auth/api-errors";
import type { CurrencyCode } from "@/lib/currency/config";
import { clearFxRateCache, loadFxRatesIntoCache } from "@/lib/currency/fx-store";

function parsePair(
  body: Record<string, unknown>,
): { base: CurrencyCode; quote: CurrencyCode; rate: number } | null {
  const base = typeof body.baseCurrency === "string" ? body.baseCurrency.trim().toUpperCase() : "";
  const quote = typeof body.quoteCurrency === "string" ? body.quoteCurrency.trim().toUpperCase() : "";
  const rate = typeof body.rate === "number" ? body.rate : Number.parseFloat(String(body.rate ?? ""));
  if ((base !== "EUR" && base !== "USD" && base !== "MAD") || (quote !== "EUR" && quote !== "USD" && quote !== "MAD")) {
    return null;
  }
  if (!Number.isFinite(rate) || rate <= 0) return null;
  return { base: base as CurrencyCode, quote: quote as CurrencyCode, rate };
}

export async function GET(request: NextRequest) {
  const admin = await requireAdminService(request);
  if (!admin.ok) return admin.response;

  const { data, error } = await admin.service
    .from("fx_rates")
    .select("id, base_currency, quote_currency, rate, effective_at, created_at")
    .order("effective_at", { ascending: false })
    .limit(60);

  if (error) return rbacApiJson({ ok: false, error: error.message }, { status: 500 });

  const { data: history } = await admin.service
    .from("fx_rate_history")
    .select("base_currency, quote_currency, rate, effective_at, archived_at")
    .order("archived_at", { ascending: false })
    .limit(40);

  return rbacApiJson({ ok: true, rates: data ?? [], history: history ?? [] });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdminService(request);
  if (!admin.ok) return admin.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return rbacApiJson({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  if (!body || typeof body !== "object") return rbacApiJson({ ok: false, error: "Invalid body" }, { status: 400 });

  const pair = parsePair(body as Record<string, unknown>);
  if (!pair) return rbacApiJson({ ok: false, error: "Invalid currency pair or rate" }, { status: 400 });

  const effectiveAt = new Date().toISOString();

  const { data: prev } = await admin.service
    .from("fx_rates")
    .select("rate, effective_at")
    .eq("base_currency", pair.base)
    .eq("quote_currency", pair.quote)
    .order("effective_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (prev) {
    await admin.service.from("fx_rate_history").insert({
      base_currency: pair.base,
      quote_currency: pair.quote,
      rate: prev.rate,
      effective_at: prev.effective_at,
      actor_user_id: admin.user.id,
    });
  }

  const { data, error } = await admin.service
    .from("fx_rates")
    .insert({
      base_currency: pair.base,
      quote_currency: pair.quote,
      rate: pair.rate,
      effective_at: effectiveAt,
      created_by: admin.user.id,
    })
    .select()
    .maybeSingle();

  if (error) return rbacApiJson({ ok: false, error: error.message }, { status: 500 });

  clearFxRateCache();
  await loadFxRatesIntoCache(admin.service);

  return rbacApiJson({ ok: true, rate: data });
}
