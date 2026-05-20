import { NextResponse, type NextRequest } from "next/server";

import type { OrderLineItem } from "@/lib/orders/types";

import { resolveCheckoutDiscount } from "@/lib/orders/resolve-discount";

import { resolvePlaceOrderQuote } from "@/lib/orders/resolve-place-order-quote";
import { isOrderLineItem } from "@/lib/orders/validate";

import { computePayPalFromMarketLine } from "@/lib/paypal/checkout-from-market";

import { isPayPalServerConfigured } from "@/lib/paypal/config";

import { createPayPalCheckoutOrder } from "@/lib/paypal/server";

import { logPayPalEnvWarningsOnce } from "@/lib/paypal/env-validation";

import { clientIpFromRequest, rateLimitResponse } from "@/lib/security/api-rate-limit";

import {

  checkCheckoutRateLimit,

  deviceFingerprintFromRequest,

} from "@/lib/security/checkout-rate-limit";

import { logFraudEvent } from "@/lib/security/fraud-log";

import { newCheckoutRequestId, logCheckoutEvent } from "@/lib/checkout/checkout-log";



function jsonResponse(body: unknown, init?: ResponseInit) {

  const res = NextResponse.json(body, init);

  res.headers.set("Cache-Control", "private, no-store");

  return res;

}



type CreateBody = {

  priceLabel?: string;

  qty?: number;

  discountCents?: number;

  couponCode?: string;

  referenceId?: string;

  artistSlug?: string;

  itemSlug?: string;

  productKind?: "hoodie" | "tshirt";

  variantId?: string;

  size?: string;

  colorId?: string;

  colorLabel?: string;

  bagLines?: OrderLineItem[];

};



export async function POST(request: NextRequest) {

  const requestId = newCheckoutRequestId();

  logPayPalEnvWarningsOnce();

  const ip = clientIpFromRequest(request);

  const fp = deviceFingerprintFromRequest(request);



  if (!isPayPalServerConfigured()) {

    logCheckoutEvent("paypal/create-order", "error", {

      requestId,

      reason: "paypal_not_configured",

    });

    return jsonResponse({ error: "PayPal is not configured on the server", code: "paypal_not_configured" }, { status: 503 });

  }



  let body: CreateBody;

  try {

    body = (await request.json()) as CreateBody;

  } catch {

    logCheckoutEvent("paypal/create-order", "error", { requestId, reason: "invalid_json" });

    return jsonResponse({ error: "Invalid JSON", code: "invalid_json" }, { status: 400 });

  }



  const bagLines = Array.isArray(body.bagLines) ? body.bagLines.filter(isOrderLineItem) : [];

  let qty = typeof body.qty === "number" && Number.isFinite(body.qty) ? Math.floor(body.qty) : 1;

  if (bagLines.length) {
    qty = bagLines.reduce((n, line) => n + line.qty, 0);
  }

  if (qty < 1 || qty > 25) {

    logCheckoutEvent("paypal/create-order", "error", { requestId, reason: "invalid_qty", qty });

    return jsonResponse({ error: "Invalid checkout amount", code: "invalid_qty" }, { status: 400 });

  }



  const rateLimit = checkCheckoutRateLimit("paypal", { ip, deviceFingerprint: fp });

  if (!rateLimit.ok) {

    logFraudEvent("rate_limited", { scope: "paypal" }, { ip });

    logCheckoutEvent("paypal/create-order", "warn", { requestId, reason: "rate_limited" });

    return rateLimitResponse(rateLimit.retryAfterSec);

  }



  const placementKey = typeof body.referenceId === "string" ? body.referenceId.trim() : undefined;

  const variantId = typeof body.variantId === "string" ? body.variantId.trim() : "";

  let lineItem: OrderLineItem;

  if (bagLines.length) {
    const first = bagLines[0]!;
    lineItem = {
      ...first,
      bagLines,
      displayTitle: first.displayTitle,
      priceLabel: typeof body.priceLabel === "string" ? body.priceLabel : first.priceLabel,
      qty,
      kindLabel: first.kindLabel || "",
    };
  } else {
    if (
      typeof body.artistSlug !== "string" ||
      typeof body.itemSlug !== "string" ||
      !variantId ||
      (body.productKind !== "hoodie" && body.productKind !== "tshirt")
    ) {
      logCheckoutEvent("paypal/create-order", "error", {
        requestId,
        reason: "invalid_product_reference",
        placementKey,
        variantId: variantId || null,
        artistSlug: typeof body.artistSlug === "string" ? body.artistSlug : null,
        itemSlug: typeof body.itemSlug === "string" ? body.itemSlug : null,
        productKind: body.productKind ?? null,
      });
      return jsonResponse(
        { error: "Invalid product reference", code: "invalid_product_reference" },
        { status: 400 },
      );
    }

    lineItem = {
      artistSlug: body.artistSlug.trim(),
      itemSlug: body.itemSlug.trim(),
      productKind: body.productKind,
      variantId,
      displayTitle: "",
      priceLabel: typeof body.priceLabel === "string" ? body.priceLabel : "",
      kindLabel: "",
      qty,
      size: typeof body.size === "string" ? body.size : "M",
      colorId: typeof body.colorId === "string" ? body.colorId : "default",
      colorLabel: typeof body.colorLabel === "string" ? body.colorLabel : "",
    };
  }

  const quoteResult = await resolvePlaceOrderQuote(
    lineItem,
    undefined,
    placementKey ? { checkoutSessionId: placementKey } : undefined,
  );

  if (!quoteResult.ok) {

    logCheckoutEvent("paypal/create-order", "error", {

      requestId,

      reason: "quote_failed",

      placementKey,

      variantId,

      code: quoteResult.code,

      error: quoteResult.error,

      status: quoteResult.status,

    });

    return jsonResponse({ error: quoteResult.error, code: quoteResult.code }, { status: quoteResult.status });

  }

  const quote = quoteResult.quote;



  const clientDiscount =

    typeof body.discountCents === "number" && Number.isFinite(body.discountCents)

      ? Math.max(0, Math.floor(body.discountCents))

      : 0;

  const couponCode = typeof body.couponCode === "string" ? body.couponCode : undefined;



  const discountResult = resolveCheckoutDiscount(quote.priceLabel, qty, couponCode, clientDiscount);

  if ("error" in discountResult) {

    logCheckoutEvent("paypal/create-order", "error", {

      requestId,

      reason: "invalid_discount",

      placementKey,

      variantId,

      error: discountResult.error,

    });

    return jsonResponse({ error: discountResult.error, code: "invalid_discount" }, { status: 400 });

  }



  const amount = computePayPalFromMarketLine(quote.lineTotal, discountResult.discountCents);



  logCheckoutEvent("paypal/create-order", "info", {

    requestId,

    placementKey,

    variantId,

    marketCode: quote.market.marketCode,

    displayCurrency: quote.lineTotal.currency,

    paymentCurrency: amount.currency_code,

    lineTotalCents: quote.lineTotal.unitCents,

    paymentValue: amount.value,

    discountCents: discountResult.discountCents,

  });



  const created = await createPayPalCheckoutOrder({

    currency_code: amount.currency_code,

    value: amount.value,

    referenceId: placementKey,

  });



  if (!created.ok) {

    logCheckoutEvent("paypal/create-order", "error", {

      requestId,

      placementKey,

      variantId,

      reason: "paypal_api_failed",

      paypalStatus: created.status,

      error: created.message,

      paymentCurrency: amount.currency_code,

      paymentValue: amount.value,

    });

    return jsonResponse(

      { error: created.message, code: "paypal_create_failed" },

      { status: created.status >= 500 ? 503 : 402 },

    );

  }



  logCheckoutEvent("paypal/create-order", "info", {

    requestId,

    placementKey,

    variantId,

    paypalOrderId: created.orderId,

    paymentCurrency: amount.currency_code,

    paymentValue: amount.value,

  });



  return jsonResponse({

    orderId: created.orderId,

    amount,

  });

}


