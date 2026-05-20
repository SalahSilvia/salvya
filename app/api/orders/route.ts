import { NextResponse, type NextRequest } from "next/server";
import { checkoutSessionExpiryMessage, isCheckoutSessionExpired } from "@/lib/checkout/session-guard";
import { notifyAdminNewOrder } from "@/lib/email/notify-admin-new-order";
import { sendOrderEmail } from "@/lib/email/send";
import { appendOrderNotification } from "@/lib/orders/notify";
import { checkPayPalOrderIdempotency } from "@/lib/orders/paypal-guard";
import { generateOrderNumber } from "@/lib/orders/order-number";
import { resolveCheckoutDiscount } from "@/lib/orders/resolve-discount";
import { CUSTOMER_ORDER_SELECT } from "@/lib/orders/order-db-row";
import { rowToCustomerOrder, sanitizePlaceOrderInput } from "@/lib/orders/validate";
import type { OrderPayment, PlaceOrderInput } from "@/lib/orders/types";
import { computePayPalFromMarketLine } from "@/lib/paypal/checkout-from-market";
import {
  commitAllVariantStockForCheckout,
  rollbackCommittedVariantStock,
} from "@/lib/inventory/checkout-stock-commit";
import { isPayPalServerConfigured } from "@/lib/paypal/config";
import { logPayPalEnvWarningsOnce } from "@/lib/paypal/env-validation";
import { logPaymentEvent } from "@/lib/paypal/payment-audit";
import { verifyPayPalPayment } from "@/lib/paypal/verify-payment";
import { resolvePlaceOrderQuote } from "@/lib/orders/resolve-place-order-quote";
import type { ServerCheckoutQuote } from "@/lib/orders/resolve-server-checkout";
import { linkGuestOrdersToUser } from "@/lib/orders/link-guest-orders";
import { markCheckoutRecovered } from "@/lib/orders/abandoned-checkout";
import { DEFAULT_PRODUCTION_LEAD_HOURS } from "@/lib/orders/production-types";
import { checkRateLimit, clientIpFromRequest, rateLimitResponse } from "@/lib/security/api-rate-limit";
import {
  checkCheckoutRateLimit,
  deviceFingerprintFromRequest,
} from "@/lib/security/checkout-rate-limit";
import { logFraudEvent } from "@/lib/security/fraud-log";
import { newCheckoutRequestId, logCheckoutEvent } from "@/lib/checkout/checkout-log";
import { createServerSupabase, getSsrEnv } from "@/lib/supabase/server-ssr";
import { createServiceSupabase } from "@/lib/supabase/service";
import type { CreatorAttributionSnapshot } from "@/lib/creator/attribution";
import { resolveOrderAttribution } from "@/lib/creator/attribution-resolver";
import { processCreatorMonetizationForOrder } from "@/lib/creator/earnings-service";
import { evaluateOrderAttributionRisk } from "@/lib/creator/fraud-detection";

const ORDER_SELECT = CUSTOMER_ORDER_SELECT;

function jsonResponse(body: unknown, init?: ResponseInit) {
  const res = NextResponse.json(body, init);
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}

function paymentStatusForCod(): "cod_pending" {
  return "cod_pending";
}

async function resolvePayPalPayment(
  input: PlaceOrderInput,
  quote: ServerCheckoutQuote,
  discountCents: number,
): Promise<
  | {
      ok: true;
      payment: OrderPayment;
      paymentStatus: "paid";
      paypalOrderId: string;
      paypalCaptureId: string;
      paypalVerifiedAt: string;
    }
  | { ok: false; error: string; status: number; code?: string }
> {
  const paypalOrderId = input.payment.paypalOrderId?.trim();
  if (!paypalOrderId) {
    return { ok: false, error: "PayPal payment was not completed. Return to payment and try again.", status: 400 };
  }

  if (!isPayPalServerConfigured()) {
    return { ok: false, error: "PayPal verification is not configured", status: 503 };
  }

  const expected = computePayPalFromMarketLine(quote.lineTotal, discountCents);

  const verified = await verifyPayPalPayment({
    paypalOrderId,
    paypalCaptureId: input.payment.paypalCaptureId,
    expected,
  });

  if (!verified.ok) {
    logPaymentEvent("paypal_verify_rejected", {
      placementKey: input.placementKey,
      paypalOrderId,
      code: verified.code,
      expectedValue: expected.value,
      expectedCurrency: expected.currency_code,
    });
    return {
      ok: false,
      error: verified.message,
      status: verified.httpStatus,
      code: verified.code,
    };
  }

  const payment: OrderPayment = {
    method: "paypal",
    instrument: input.payment.instrument,
    paypalOrderId: verified.paypalOrderId,
    paypalCaptureId: verified.paypalCaptureId,
    paypalVerifiedAt: verified.verifiedAt,
  };

  return {
    ok: true,
    payment,
    paymentStatus: "paid",
    paypalOrderId: verified.paypalOrderId,
    paypalCaptureId: verified.paypalCaptureId,
    paypalVerifiedAt: verified.verifiedAt,
  };
}

export async function POST(request: NextRequest) {
  const requestId = newCheckoutRequestId();
  const ip = clientIpFromRequest(request);
  const fp = deviceFingerprintFromRequest(request);

  const service = createServiceSupabase();
  if (!service) {
    logCheckoutEvent("orders/place", "error", { requestId, reason: "service_unavailable" });
    return jsonResponse({ error: "Orders not configured", code: "service_unavailable" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = sanitizePlaceOrderInput(body);
  if (!parsed) {
    logCheckoutEvent("orders/place", "error", { requestId, reason: "invalid_payload" });
    return jsonResponse({ error: "Invalid order payload", code: "invalid_payload" }, { status: 400 });
  }

  logCheckoutEvent("orders/place", "info", {
    requestId,
    placementKey: parsed.placementKey,
    paymentMethod: parsed.payment.method,
    variantId: parsed.lineItem.variantId,
  });

  const rate = checkCheckoutRateLimit("orders", {
    ip,
    email: parsed.shipping.buyerEmail,
    deviceFingerprint: fp,
  });
  if (!rate.ok) {
    logFraudEvent("rate_limited", { scope: "orders" }, { ip, email: parsed.shipping.buyerEmail });
    return rateLimitResponse(rate.retryAfterSec);
  }

  if (parsed.checkoutSavedAt !== undefined && isCheckoutSessionExpired(parsed.checkoutSavedAt)) {
    return jsonResponse({ error: checkoutSessionExpiryMessage(), code: "checkout_expired" }, { status: 400 });
  }

  let userId: string | null = null;
  const env = getSsrEnv();
  if (env) {
    const res = jsonResponse({ order: null, created: true });
    try {
      const supabase = createServerSupabase(request, res);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    } catch {
      /* guest checkout */
    }
  }

  const quoteResult = await resolvePlaceOrderQuote(parsed.lineItem, userId, {
    checkoutSessionId: parsed.placementKey,
  });
  if (!quoteResult.ok) {
    logCheckoutEvent("orders/place", "error", {
      requestId,
      placementKey: parsed.placementKey,
      reason: "quote_failed",
      code: quoteResult.code,
      error: quoteResult.error,
    });
    return jsonResponse({ error: quoteResult.error, code: quoteResult.code }, { status: quoteResult.status });
  }
  const quote = quoteResult.quote;
  const bagCheckout = quoteResult.bag;

  const discountResult = resolveCheckoutDiscount(
    quote.priceLabel,
    quote.qty,
    parsed.couponCode,
    parsed.discountCents,
  );
  if ("error" in discountResult) {
    return jsonResponse({ error: discountResult.error, code: "invalid_discount" }, { status: 400 });
  }

  const authoritativeLineItem = quoteResult.lineItem;

  const input: PlaceOrderInput = {
    ...parsed,
    lineItem: authoritativeLineItem,
    discountCents: discountResult.discountCents,
  };

  const { data: existing } = await service
    .from("customer_orders")
    .select(ORDER_SELECT)
    .eq("placement_key", input.placementKey)
    .maybeSingle();

  if (existing) {
    const order = rowToCustomerOrder(existing);
    if (order) return jsonResponse({ order, created: false });
  }

  if (input.payment.method === "paypal") {
    const idem = await checkPayPalOrderIdempotency(
      service,
      input.payment.paypalOrderId ?? "",
      input.placementKey,
      input.payment.paypalCaptureId,
    );
    if (idem.action === "return_existing") {
      return jsonResponse({ order: idem.order, created: false });
    }
    if (idem.action === "reject_duplicate") {
      logPaymentEvent("paypal_duplicate_blocked", {
        placementKey: input.placementKey,
        paypalOrderId: input.payment.paypalOrderId ?? null,
      });
      logFraudEvent(
        "duplicate_order_attempt",
        { placementKey: input.placementKey },
        { ip, email: input.shipping.buyerEmail },
      );
      return jsonResponse({ error: idem.message, code: "duplicate_payment" }, { status: 409 });
    }
  }

  const placementBurst = checkRateLimit(`orders:placement:${input.placementKey}`, {
    limit: 6,
    windowMs: 300_000,
  });
  if (!placementBurst.ok) {
    logFraudEvent("placement_key_reuse", { placementKey: input.placementKey }, { ip });
    return rateLimitResponse(placementBurst.retryAfterSec);
  }

  let shippingAddressIdDb: string | null = null;
  if (input.shippingAddressId) {
    if (!userId) {
      return jsonResponse({ error: "Sign in to use a saved address" }, { status: 400 });
    }
    const { data: addrRow, error: addrErr } = await service
      .from("customer_addresses")
      .select("id")
      .eq("id", input.shippingAddressId)
      .eq("user_id", userId)
      .maybeSingle();
    if (addrErr) {
      return jsonResponse({ error: addrErr.message }, { status: 500 });
    }
    if (!addrRow) {
      return jsonResponse({ error: "Invalid shipping address" }, { status: 400 });
    }
    shippingAddressIdDb = input.shippingAddressId;
  }

  let paymentRow: OrderPayment = input.payment;
  let paymentStatus: "paid" | "cod_pending" = paymentStatusForCod();
  let paypalOrderIdDb: string | null = null;
  let paypalCaptureIdDb: string | null = null;
  let paypalVerifiedAtDb: string | null = null;

  if (input.payment.method === "paypal") {
    const resolved = await resolvePayPalPayment(input, quote, discountResult.discountCents);
    if (!resolved.ok) {
      logFraudEvent(
        "paypal_verify_failed",
        { code: resolved.code, placementKey: input.placementKey },
        { ip, email: input.shipping.buyerEmail },
      );
      return jsonResponse(
        { error: resolved.error, code: resolved.code ?? "payment_failed" },
        { status: resolved.status },
      );
    }
    paymentRow = resolved.payment;
    paymentStatus = resolved.paymentStatus;
    paypalOrderIdDb = resolved.paypalOrderId;
    paypalCaptureIdDb = resolved.paypalCaptureId;
    paypalVerifiedAtDb = resolved.paypalVerifiedAt;
  }

  const stockTargets = bagCheckout
    ? bagCheckout.lines.map((row) => ({ variantId: row.quote.variantId, qty: row.quote.qty, productId: row.quote.productId }))
    : [{ variantId: quote.variantId, qty: quote.qty, productId: quote.productId }];

  const stockCommit = await commitAllVariantStockForCheckout(service, stockTargets, input.placementKey);
  if (!stockCommit.ok) {
    logCheckoutEvent("orders/place", "error", {
      requestId,
      placementKey: input.placementKey,
      reason: "stock_commit_failed",
      stockMessage: stockCommit.message,
    });
    return jsonResponse(
      {
        error:
          stockCommit.code === "out_of_stock"
            ? "This item is out of stock"
            : stockCommit.message,
        code: stockCommit.code,
      },
      { status: 409 },
    );
  }
  const committedStock = stockCommit.committed;
  const lastStockRemaining = stockCommit.lastRemainingStock;

  const updatedAt = new Date().toISOString();
  const productionStartsAt = new Date(
    Date.now() + DEFAULT_PRODUCTION_LEAD_HOURS * 60 * 60 * 1000,
  ).toISOString();
  const finalPrice = quote.lineTotal.unitAmount;
  const orderCurrency = quote.lineTotal.currency;

  let creatorAttribution: CreatorAttributionSnapshot | null = null;
  try {
    const resolved = await resolveOrderAttribution(service, {
      trackingCodeFromRequest: input.creatorTrackingCode ?? null,
      trackingCodeFromCookie: input.creatorTrackingCode ?? null,
      buyerUserId: userId,
    });
    creatorAttribution = resolved?.snapshot ?? null;
  } catch (attrErr) {
    logCheckoutEvent("orders/place", "error", {
      requestId,
      placementKey: input.placementKey,
      reason: "creator_attribution_resolve_failed",
      error: attrErr instanceof Error ? attrErr.message : String(attrErr),
    });
  }

  for (let attempt = 0; attempt < 4; attempt++) {
    const orderNumber = generateOrderNumber();
    const { data, error } = await service
      .from("customer_orders")
      .insert({
        order_number: orderNumber,
        placement_key: input.placementKey,
        user_id: userId,
        shipping_address_id: shippingAddressIdDb,
        checkout_path: input.checkoutPath,
        line_item: authoritativeLineItem,
        shipping: input.shipping,
        payment: paymentRow,
        fulfillment_status: "confirmed",
        payment_status: paymentStatus,
        production_status: "pending",
        production_starts_at: productionStartsAt,
        paypal_order_id: paypalOrderIdDb,
        paypal_capture_id: paypalCaptureIdDb,
        paypal_verified_at: paypalVerifiedAtDb,
        product_snapshot: quote.productSnapshot,
        final_price: finalPrice,
        order_currency: orderCurrency,
        market_code: quote.market.marketCode,
        creator_id: creatorAttribution?.creatorId ?? null,
        creator_tracking_code: creatorAttribution?.creatorTrackingCode ?? null,
        creator_product_link_id: creatorAttribution?.creatorProductLinkId ?? null,
        referral_source: creatorAttribution?.referralSource ?? null,
        creator_self_referral: creatorAttribution?.selfReferral ?? false,
        updated_at: updatedAt,
      })
      .select(ORDER_SELECT)
      .single();

    if (error) {
      await rollbackCommittedVariantStock(service, committedStock);
      if (error.code === "23505") {
        if (error.message.includes("placement_key")) {
          const { data: raced } = await service
            .from("customer_orders")
            .select(ORDER_SELECT)
            .eq("placement_key", input.placementKey)
            .maybeSingle();
          const order = raced ? rowToCustomerOrder(raced) : null;
          if (order) return jsonResponse({ order, created: false });
        }
        if (error.message.includes("paypal_order_id") || error.message.includes("paypal_capture_id")) {
          const replay = await checkPayPalOrderIdempotency(
            service,
            paypalOrderIdDb ?? "",
            input.placementKey,
            paypalCaptureIdDb ?? undefined,
          );
          if (replay.action === "return_existing") {
            return jsonResponse({ order: replay.order, created: false });
          }
          return jsonResponse(
            { error: "This PayPal payment was already processed.", code: "duplicate_payment" },
            { status: 409 },
          );
        }
        continue;
      }
      return jsonResponse({ error: error.message }, { status: 500 });
    }

    const order = rowToCustomerOrder(data);
    if (!order) return jsonResponse({ error: "Order shape invalid" }, { status: 500 });

    logCheckoutEvent("orders/place", "info", {
      requestId,
      placementKey: input.placementKey,
      orderNumber: order.orderNumber,
      orderId: order.id,
      paymentMethod: input.payment.method,
      paymentStatus: order.paymentStatus,
      orderCurrency: orderCurrency,
      finalPrice,
      marketCode: quote.market.marketCode,
      stockRemaining: lastStockRemaining,
      bagVariants: stockTargets.length,
    });

    if (userId) {
      try {
        await markCheckoutRecovered(service, userId, input.placementKey);
      } catch {
        /* non-fatal */
      }
      try {
        await appendOrderNotification(service, userId, order);
      } catch {
        /* non-fatal */
      }
    }

    try {
      await sendOrderEmail(service, "order_confirmation", order);
    } catch {
      /* non-fatal */
    }

    try {
      await notifyAdminNewOrder(service, order);
    } catch {
      /* non-fatal */
    }

    logPaymentEvent("order_placed", {
      orderNumber: order.orderNumber,
      placementKey: input.placementKey,
      paymentMethod: input.payment.method,
      paymentStatus: order.paymentStatus,
      created: true,
    });

    if (creatorAttribution) {
      try {
        await processCreatorMonetizationForOrder(service, {
          orderId: order.id,
          paymentStatus: order.paymentStatus,
          finalPrice,
          orderCurrency,
          buyerUserId: userId,
          attribution: creatorAttribution,
          lineItem: authoritativeLineItem,
        });
        void evaluateOrderAttributionRisk(service, {
          creatorId: creatorAttribution.creatorId,
          buyerUserId: userId,
          orderId: order.id,
          selfReferral: creatorAttribution.selfReferral,
        }).catch(() => undefined);
      } catch (monetizeErr) {
        logCheckoutEvent("orders/place", "error", {
          requestId,
          orderId: order.id,
          reason: "creator_monetization_failed",
          error: monetizeErr instanceof Error ? monetizeErr.message : String(monetizeErr),
        });
      }
    }

    return jsonResponse({ order, created: true });
  }

  return jsonResponse({ error: "Could not allocate order number" }, { status: 500 });
}

export async function GET(request: NextRequest) {
  const env = getSsrEnv();
  if (!env) {
    return jsonResponse({ orders: [], synced: false });
  }

  const res = jsonResponse({ orders: [], synced: true });
  try {
    const supabase = createServerSupabase(request, res);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return jsonResponse({ error: "Unauthorized" }, { status: 401 });
    }

    const linkService = createServiceSupabase();
    if (linkService && user.email) {
      try {
        await linkGuestOrdersToUser(linkService, user.id, user.email);
      } catch {
        /* non-fatal */
      }
    }

    const { data, error } = await supabase
      .from("customer_orders")
      .select(ORDER_SELECT)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return jsonResponse({ error: error.message }, { status: 500 });
    }

    const orders = (data ?? []).map(rowToCustomerOrder).filter((o): o is NonNullable<typeof o> => Boolean(o));
    return jsonResponse({ orders, synced: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Orders unavailable";
    return jsonResponse({ error: message }, { status: 500 });
  }
}
