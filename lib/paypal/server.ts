import { getPayPalServerConfig, type PayPalServerConfig } from "@/lib/paypal/config";
import type { PayPalApiErrorBody, PayPalOrder } from "@/lib/paypal/types";

let cachedToken: { value: string; expiresAt: number } | null = null;

function configOrThrow(): PayPalServerConfig {
  const cfg = getPayPalServerConfig();
  if (!cfg) {
    throw new Error("PayPal server credentials are not configured");
  }
  return cfg;
}

export async function paypalRequest(path: string, init: RequestInit = {}): Promise<Response> {
  const cfg = configOrThrow();
  const token = await getPayPalAccessToken();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(`${cfg.baseUrl}${path}`, { ...init, headers });
}

export async function getPayPalAccessToken(): Promise<string> {
  const cfg = configOrThrow();
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 30_000) {
    return cachedToken.value;
  }

  const basic = Buffer.from(`${cfg.clientId}:${cfg.clientSecret}`).toString("base64");
  const res = await fetch(`${cfg.baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = (await res.json()) as { access_token?: string; expires_in?: number; error?: string };
  if (!res.ok || !data.access_token) {
    cachedToken = null;
    throw new Error(data.error ?? `PayPal OAuth failed (${res.status})`);
  }

  const ttlMs = (typeof data.expires_in === "number" ? data.expires_in : 3000) * 1000;
  cachedToken = { value: data.access_token, expiresAt: now + ttlMs };
  return data.access_token;
}

/** Reset cached token (tests). */
export function resetPayPalAccessTokenCache(): void {
  cachedToken = null;
}

async function parsePayPalJson<T>(res: Response): Promise<{ ok: true; data: T } | { ok: false; status: number; body: PayPalApiErrorBody }> {
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    body = {};
  }
  if (!res.ok) {
    return { ok: false, status: res.status, body: (body ?? {}) as PayPalApiErrorBody };
  }
  return { ok: true, data: body as T };
}

export async function getPayPalOrder(orderId: string): Promise<
  | { ok: true; order: PayPalOrder }
  | { ok: false; status: number; message: string }
> {
  const id = orderId.trim();
  if (!id) return { ok: false, status: 400, message: "Missing PayPal order id" };

  const res = await paypalRequest(`/v2/checkout/orders/${encodeURIComponent(id)}`, { method: "GET" });
  const parsed = await parsePayPalJson<PayPalOrder>(res);
  if (!parsed.ok) {
    const msg = parsed.body.message ?? parsed.body.name ?? `PayPal order lookup failed (${parsed.status})`;
    return { ok: false, status: parsed.status, message: msg };
  }
  return { ok: true, order: parsed.data };
}

export async function capturePayPalOrder(orderId: string): Promise<
  | { ok: true; order: PayPalOrder }
  | { ok: false; status: number; message: string }
> {
  const id = orderId.trim();
  if (!id) return { ok: false, status: 400, message: "Missing PayPal order id" };

  const res = await paypalRequest(`/v2/checkout/orders/${encodeURIComponent(id)}/capture`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  const parsed = await parsePayPalJson<PayPalOrder>(res);
  if (!parsed.ok) {
    const msg = parsed.body.message ?? parsed.body.name ?? `PayPal capture failed (${parsed.status})`;
    return { ok: false, status: parsed.status, message: msg };
  }
  return { ok: true, order: parsed.data };
}

export type CreatePayPalOrderInput = {
  currency_code: string;
  value: string;
  referenceId?: string;
};

export async function createPayPalCheckoutOrder(input: CreatePayPalOrderInput): Promise<
  | { ok: true; orderId: string }
  | { ok: false; status: number; message: string }
> {
  const res = await paypalRequest("/v2/checkout/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: input.referenceId?.slice(0, 256),
          amount: {
            currency_code: input.currency_code,
            value: input.value,
          },
        },
      ],
    }),
  });

  const parsed = await parsePayPalJson<{ id?: string }>(res);
  if (!parsed.ok || !parsed.data.id) {
    const msg = parsed.ok ? "PayPal did not return an order id" : (parsed.body.message ?? `Create order failed (${parsed.status})`);
    return { ok: false, status: parsed.ok ? 502 : parsed.status, message: msg };
  }
  return { ok: true, orderId: parsed.data.id };
}
