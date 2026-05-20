"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { ProductCheckoutPageProps } from "@/components/shop/ProductCheckoutPage";
import { CheckoutPaymentTrustStrip } from "@/components/shop/CheckoutPaymentTrustStrip";
import { PayPalHostedButtons } from "@/components/shop/PayPalHostedButtons";
import { BagCheckoutOrderSummary } from "@/components/shop/BagCheckoutOrderSummary";
import { ProductCheckoutOrderSummary } from "@/components/shop/ProductCheckoutOrderSummary";
import { CardBrandRow, CheckoutStepGraphic, PayPalMarkImg, TrustStrip } from "@/components/shop/product-checkout-shared";
import { IconCreditCard } from "@/components/shop/product-dock-icons";
import {
  ensureCheckoutPlacementKey,
  mergeCheckoutDetailsPatch,
  readCheckoutDetailsSession,
  type CheckoutDetailsSessionV1,
} from "@/lib/checkout-preview-session";
import { checkoutCountryLabel, isCashOnDeliveryAvailable, isKnownCheckoutCountry } from "@/lib/checkout-country";
import { CheckoutCouponField } from "@/components/shop/CheckoutCouponField";
import {
  applyCouponToSubtotal,
  formatDiscountLine,
  subtotalCentsFromCheckout,
  totalCentsAfterDiscount,
  type CouponResult,
} from "@/lib/checkout/coupons";
import { parsePriceLabelToNumber } from "@/lib/admin/parse-price";
import { getAnalyticsTracker } from "@/lib/analytics/tracker";
import { makeProductId } from "@/lib/member/likes-storage";
import { checkoutSessionExpiryMessage, isCheckoutSessionExpired } from "@/lib/checkout/session-guard";
import { parseProductCheckoutPath } from "@/lib/checkout/parse-checkout-path";
import { reserveCheckoutStock, reserveCheckoutStockBag } from "@/lib/checkout/reserve-stock-client";
import { computePayPalCheckoutTotal } from "@/lib/paypal/checkout-amount";
import { paymentErrorMessage } from "@/lib/orders/payment-user-message";

const CHECKOUT_NEXT_STEP_PAGE = "Confirmation";
const CHECKOUT_PAYMENT_PRIMARY_CTA = "Continue to confirmation";

type PaySelection = "cod" | "paypal_wallet" | "paypal_card";

function PaymentWizardTile({
  selected,
  onSelect,
  title,
  description,
  badge,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  description: string;
  badge?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`group flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-[border-color,box-shadow,background-color] sm:min-h-[8.5rem] ${
        selected
          ? "border-[#2D6BFF] bg-gradient-to-b from-[#2D6BFF]/[0.08] to-white shadow-[0_0_0_1px_rgba(45,107,255,0.22)_inset,0_12px_36px_-20px_rgba(45,107,255,0.35)]"
          : "border-slate-200/95 bg-white hover:border-slate-300 hover:bg-slate-50/90"
      }`}
    >
      <div className="flex w-full items-start justify-between gap-2">
        <span className="text-[14px] font-semibold tracking-tight text-slate-900">{title}</span>
        <span
          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
            selected ? "border-[#2D6BFF] bg-[#2D6BFF]" : "border-slate-300 bg-white group-hover:border-slate-400"
          }`}
          aria-hidden
        >
          {selected ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
        </span>
      </div>
      <p className="text-[12px] leading-relaxed text-slate-600">{description}</p>
      {badge ? <div className="mt-0.5">{badge}</div> : null}
      {children ? <div className="mt-auto pt-1">{children}</div> : null}
    </button>
  );
}

export function ProductCheckoutPaymentPage({
  artistName,
  displayTitle,
  priceLabel,
  productKind,
  kindLabel,
  returnHref,
  recapQty,
  recapSize,
  recapColorLabel,
  productImageSrc,
  previewQueryString,
  soldOut = false,
  priceCents,
  serverPayPalAmount,
  variantId,
  bag,
}: ProductCheckoutPageProps) {
  const pathname = usePathname();
  const router = useRouter();
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";

  const detailsPath = useMemo(() => {
    if (!pathname?.endsWith("/checkout/payment")) return null;
    return pathname.slice(0, -"/payment".length);
  }, [pathname]);

  const q = previewQueryString.trim();
  const qs = q ? `?${q}` : "";

  const detailsHref = useMemo(() => (detailsPath ? `${detailsPath}${qs}` : "#"), [detailsPath, qs]);

  const confirmHref = useMemo(() => (detailsPath ? `${detailsPath}/confirm${qs}` : "#"), [detailsPath, qs]);

  const checkoutMeta = useMemo(() => parseProductCheckoutPath(pathname), [pathname]);

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<CheckoutDetailsSessionV1 | null>(null);
  const [paySelection, setPaySelection] = useState<PaySelection>("paypal_wallet");
  const [coupon, setCoupon] = useState<CouponResult | null>(null);
  const [stockReserveError, setStockReserveError] = useState<string | null>(null);
  /** Catalog stock can read 0 while this session holds a unit — reserve-stock is authoritative on payment. */
  const [stockHold, setStockHold] = useState<"pending" | "held" | "unavailable">(bag ? "held" : "pending");

  const recapColorId = useMemo(() => {
    const raw = new URLSearchParams(previewQueryString).get("color") ?? "ink";
    return raw.trim() || "ink";
  }, [previewQueryString]);
  const [paymentHint, setPaymentHint] = useState<string | null>(null);
  const [paypalUiError, setPaypalUiError] = useState<string | null>(null);
  const paySelectionRef = useRef(paySelection);
  useEffect(() => {
    paySelectionRef.current = paySelection;
  }, [paySelection]);

  const selectPayment = useCallback(
    (selection: PaySelection) => {
      setPaySelection(selection);
      setPaypalUiError(null);
      setPaymentHint(null);
      if (!checkoutMeta || !pathname) return;
      const contentId = makeProductId(
        checkoutMeta.artistSlug,
        checkoutMeta.productKind === "tshirt" ? "tee" : "hoodie",
        checkoutMeta.itemSlug,
      );
      getAnalyticsTracker().trackPaymentMethodSelected(pathname, contentId, checkoutMeta.artistSlug, {
        payment_selection: selection,
      });
    },
    [checkoutMeta, pathname],
  );

  const contentId = useMemo(() => {
    if (!checkoutMeta) return null;
    return makeProductId(
      checkoutMeta.artistSlug,
      checkoutMeta.productKind === "tshirt" ? "tee" : "hoodie",
      checkoutMeta.itemSlug,
    );
  }, [checkoutMeta]);

  const effectivePriceLabel = bag?.subtotalLabel ?? priceLabel;
  const effectiveQty = bag?.primaryLineItem.qty ?? recapQty;

  const appliedDiscountCents = coupon?.ok ? coupon.discountCents : 0;
  const fallbackPayPal = useMemo(
    () =>
      computePayPalCheckoutTotal(effectivePriceLabel, effectiveQty, appliedDiscountCents, {
        ...(priceCents !== undefined ? { priceCents } : {}),
        ...(bag ? { priceCents: bag.subtotalCents } : {}),
      }),
    [bag, effectivePriceLabel, effectiveQty, appliedDiscountCents, priceCents],
  );
  const [paypalCharge, setPaypalCharge] = useState(
    serverPayPalAmount ?? fallbackPayPal,
  );
  useEffect(() => {
    setPaypalCharge(serverPayPalAmount ?? fallbackPayPal);
  }, [serverPayPalAmount, fallbackPayPal]);

  const paypalCurrency = paypalCharge.currency_code;
  const paypalValue = paypalCharge.value;

  const createPayPalOrder = useCallback(async () => {
    const res = await fetch("/api/paypal/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priceLabel: effectivePriceLabel,
        qty: effectiveQty,
        discountCents: appliedDiscountCents,
        couponCode: coupon?.ok ? coupon.code : undefined,
        referenceId: detailsPath ? readCheckoutDetailsSession(detailsPath)?.placementKey : undefined,
        ...(bag?.primaryLineItem.bagLines?.length
          ? { bagLines: bag.primaryLineItem.bagLines }
          : checkoutMeta
            ? {
                artistSlug: checkoutMeta.artistSlug,
                itemSlug: checkoutMeta.itemSlug,
                productKind: checkoutMeta.productKind,
                variantId,
                size: recapSize,
                colorId: recapColorId,
                colorLabel: recapColorLabel,
              }
            : {}),
      }),
    });
    const data = (await res.json()) as {
      orderId?: string;
      amount?: { currency_code: string; value: string };
      error?: string;
      code?: string;
    };
    if (!res.ok || !data.orderId) {
      throw new Error(paymentErrorMessage(data.error ?? "Could not start PayPal checkout", data.code));
    }
    if (data.amount?.currency_code && data.amount.value) {
      setPaypalCharge(data.amount);
    }
    return data.orderId;
  }, [
    appliedDiscountCents,
    bag,
    checkoutMeta,
    coupon,
    detailsPath,
    effectivePriceLabel,
    effectiveQty,
    recapColorId,
    recapColorLabel,
    recapSize,
    variantId,
  ]);

  const pricing = useMemo(() => {
    const subtotalCents = bag?.subtotalCents ?? subtotalCentsFromCheckout(effectivePriceLabel, effectiveQty);
    const discountCents = appliedDiscountCents;
    const totalCents = totalCentsAfterDiscount(subtotalCents, discountCents);
    const unit = parsePriceLabelToNumber(effectivePriceLabel);
    const isEur = /€|EUR/i.test(effectivePriceLabel);
    const isMad = /\bDH\b|\bMAD\b/i.test(effectivePriceLabel);
    let totalLabel = effectivePriceLabel;
    if (discountCents > 0) {
      const total = totalCents / 100;
      if (isEur) totalLabel = `€${total.toFixed(2)}`;
      else if (isMad) totalLabel = `${Math.round(total)} DH`;
      else totalLabel = `${total.toFixed(2)}`;
    }
    return {
      subtotalCents,
      discountCents,
      discountLabel: discountCents > 0 ? formatDiscountLine(discountCents, effectivePriceLabel) : null,
      totalLabel,
      unit,
    };
  }, [appliedDiscountCents, bag?.subtotalCents, effectivePriceLabel, effectiveQty]);

  useEffect(() => {
    if (!detailsPath) {
      setLoading(false);
      return;
    }
    const data = readCheckoutDetailsSession(detailsPath);
    setLoading(false);
    if (!data) {
      router.replace(detailsHref);
      return;
    }
    if (isCheckoutSessionExpired(data.savedAt)) {
      router.replace(detailsHref);
      return;
    }
    if (!isKnownCheckoutCountry(data.buyerCountry)) {
      router.replace(detailsHref);
      return;
    }
    setSession(data);
    if (data.couponCode && data.discountCents) {
      const restored = applyCouponToSubtotal(
        data.couponCode,
        subtotalCentsFromCheckout(effectivePriceLabel, effectiveQty),
        effectivePriceLabel,
      );
      setCoupon(restored.ok ? restored : null);
    }
    const codOk = isCashOnDeliveryAvailable(data.buyerCountry);
    if (!codOk) {
      setPaySelection(data.paymentInstrument === "paypal_card" ? "paypal_card" : "paypal_wallet");
      return;
    }
    if (data.paymentMethod === "cod") setPaySelection("cod");
    else if (data.paymentInstrument === "paypal_card") setPaySelection("paypal_card");
    else setPaySelection("paypal_wallet");
  }, [detailsHref, detailsPath, effectivePriceLabel, effectiveQty, router]);

  useEffect(() => {
    if (!session || !detailsPath) return;
    const placementKey = session.placementKey?.trim() || ensureCheckoutPlacementKey(detailsPath);
    if (!placementKey) return;

    if (bag?.primaryLineItem.bagLines?.length) {
      let cancelled = false;
      setStockHold("pending");
      setStockReserveError(null);
      void reserveCheckoutStockBag(placementKey, bag.primaryLineItem.bagLines).then((result) => {
        if (cancelled) return;
        if (!result.ok) {
          setStockReserveError(result.error);
          setStockHold("unavailable");
        } else {
          setStockReserveError(null);
          setStockHold("held");
        }
      });
      return () => {
        cancelled = true;
      };
    }

    if (!checkoutMeta || !variantId) return;

    let cancelled = false;
    setStockHold("pending");
    setStockReserveError(null);
    void reserveCheckoutStock(placementKey, {
      artistSlug: checkoutMeta.artistSlug,
      itemSlug: checkoutMeta.itemSlug,
      productKind: checkoutMeta.productKind,
      variantId,
      displayTitle,
      priceLabel,
      kindLabel,
      qty: recapQty,
      size: recapSize,
      colorId: recapColorId,
      colorLabel: recapColorLabel,
    }).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setStockReserveError(result.error);
        setStockHold("unavailable");
      } else {
        setStockReserveError(null);
        setStockHold("held");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [
    bag,
    checkoutMeta,
    detailsPath,
    displayTitle,
    kindLabel,
    priceLabel,
    recapColorId,
    recapColorLabel,
    recapQty,
    recapSize,
    session,
    variantId,
  ]);

  const checkoutBlocked = stockHold === "unavailable";
  const stockPending = stockHold === "pending";

  const persistCoupon = useCallback(
    (next: CouponResult | null) => {
      setCoupon(next);
      if (!detailsPath) return;
      if (next?.ok) {
        mergeCheckoutDetailsPatch(detailsPath, {
          couponCode: next.code,
          couponLabel: next.label,
          discountCents: next.discountCents,
        });
      } else {
        mergeCheckoutDetailsPatch(detailsPath, {
          couponCode: undefined,
          couponLabel: undefined,
          discountCents: undefined,
        });
      }
    },
    [detailsPath],
  );

  const paypalRequired = paySelection === "paypal_wallet" || paySelection === "paypal_card";
  const paypalComplete = Boolean(session?.paypalOrderId?.trim());

  const goToConfirm = useCallback(() => {
    if (checkoutBlocked) return;
    if (!detailsPath || !session) return;
    if (isCheckoutSessionExpired(session.savedAt)) {
      setPaymentHint(checkoutSessionExpiryMessage());
      return;
    }
    if (paypalRequired && !paypalComplete) {
      setPaymentHint("Complete payment with the PayPal button above before continuing.");
      return;
    }
    setPaymentHint(null);
    ensureCheckoutPlacementKey(detailsPath);
    if (paySelection === "cod" && isCashOnDeliveryAvailable(session.buyerCountry)) {
      mergeCheckoutDetailsPatch(detailsPath, { paymentMethod: "cod" });
    } else {
      mergeCheckoutDetailsPatch(detailsPath, {
        paymentMethod: "paypal",
        paymentInstrument: paySelection === "paypal_card" ? "paypal_card" : "paypal_wallet",
      });
    }
    router.push(confirmHref);
  }, [checkoutBlocked, confirmHref, detailsPath, paySelection, paypalComplete, paypalRequired, router, session]);

  const onPayPalApproved = useCallback(
    (result: { paypalOrderId?: string; paypalCaptureId?: string }) => {
      if (!detailsPath) return;
      ensureCheckoutPlacementKey(detailsPath);
      const sel = paySelectionRef.current;
      setPaypalUiError(null);
      setPaymentHint(null);
      mergeCheckoutDetailsPatch(detailsPath, {
        paymentMethod: "paypal",
        paymentInstrument: sel === "paypal_card" ? "paypal_card" : "paypal_wallet",
        paypalOrderId: result.paypalOrderId?.trim() || undefined,
        paypalCaptureId: result.paypalCaptureId?.trim() || undefined,
      });
      router.push(confirmHref);
    },
    [confirmHref, detailsPath, router],
  );

  const codAvailable = useMemo(
    () => (session ? isCashOnDeliveryAvailable(session.buyerCountry) : false),
    [session],
  );

  const continueLabel =
    paySelection === "cod" && codAvailable
      ? CHECKOUT_PAYMENT_PRIMARY_CTA
      : paypalComplete
        ? "Continue to confirmation"
        : "Complete PayPal payment above";

  const continueDisabled =
    checkoutBlocked ||
    stockPending ||
    (paypalRequired && !paypalComplete) ||
    isCheckoutSessionExpired(session?.savedAt);
  const showPaymentHero = !loading && session !== null;
  const showPayPalUi = paySelection === "paypal_wallet" || paySelection === "paypal_card";
  const deliveryHint = useMemo(
    () =>
      session && isCashOnDeliveryAvailable(session.buyerCountry)
        ? "Morocco · COD or online payment on this step."
        : "International · secure PayPal (wallet or guest card).",
    [session],
  );

  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden bg-[#f4f6fb] text-slate-900">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.14)_1px,transparent_0)] [background-size:22px_22px] opacity-70" />
        <div className="absolute -right-28 top-0 h-[26rem] w-[26rem] rounded-full bg-[#2D6BFF]/[0.07] blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-[20rem] w-[20rem] rounded-full bg-indigo-400/10 blur-3xl" />
      </div>

      <motion.header
        className="relative z-[1] border-b border-slate-200/80 bg-white/85 shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-xl"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
          <div className="flex w-full flex-wrap items-center justify-between gap-3 sm:w-auto sm:justify-start">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={returnHref}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                <span aria-hidden className="text-[15px] leading-none text-slate-500">
                  ←
                </span>
                Back to product
              </Link>
              <Link
                href={detailsHref}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-medium text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                Edit information
              </Link>
              <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-600 sm:inline-flex">
                Step 2 · Payment
              </span>
            </div>
            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-normal text-slate-500 sm:hidden">
              Payment
            </span>
          </div>
          <CheckoutStepGraphic activeStep={2} />
        </div>
      </motion.header>

      <motion.main
        className="relative z-[1] mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 280, delay: 0.05 }}
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-10 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0">
            {showPaymentHero ? (
              <div className="mb-6 hidden sm:block">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Salvya · checkout wizard</p>
                <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900 sm:text-[1.7rem]">
                  Payment method
                </h1>
                <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-slate-600">
                  {codAvailable ? (
                    <>
                      Morocco: choose <span className="font-medium text-slate-800">cash on delivery</span>, your{" "}
                      <span className="font-medium text-slate-800">PayPal balance</span>, or pay as{" "}
                      <span className="font-medium text-slate-800">guest with Visa / Mastercard</span> through PayPal.
                    </>
                  ) : (
                    <>
                      Your address is outside Morocco —{" "}
                      <span className="font-medium text-slate-800">online payment only</span>. Use PayPal with a wallet or
                      guest checkout with a bank card ({artistName}).
                    </>
                  )}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <CardBrandRow />
                  <span className="text-[11px] text-slate-500">Cards are processed by PayPal — no card numbers stored on Salvya.</span>
                </div>
              </div>
            ) : (
              <div className="mb-6 hidden min-h-[5.5rem] sm:block" aria-hidden />
            )}

            <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_24px_60px_-28px_rgba(15,23,42,0.18)]">
              <div className="h-1 w-full bg-gradient-to-r from-[#2D6BFF] via-indigo-400 to-[#2D6BFF]" aria-hidden />
              <div className="border-b border-slate-100 px-5 py-5 sm:px-6 sm:py-6">
                <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:hidden">Payment</h1>
                <p className="mt-1 text-[13px] text-slate-500 sm:hidden">
                  {!loading && session ? (codAvailable ? "COD · PayPal · Card" : "PayPal only") : null} · {artistName}
                </p>
                <p className="mt-3 hidden text-[13px] text-slate-500 sm:block">
                  {kindLabel} · {productKind === "hoodie" ? "Oversize hoodie" : "Oversize tee"}
                </p>
              </div>

              {loading ? (
                <div className="px-5 py-10 text-center text-[14px] text-slate-500 sm:px-6">Preparing payment step…</div>
              ) : session ? (
                <>
                  <div
                    role="status"
                    className="mx-5 mt-4 rounded-xl border border-emerald-200/90 bg-gradient-to-r from-emerald-50/95 to-white px-4 py-3 text-[13px] text-emerald-950 sm:mx-6"
                  >
                    <p className="font-semibold text-emerald-950">Details on file</p>
                    <p className="mt-1 text-emerald-900/90">Review your recap below, pick a payment option, then continue.</p>
                  </div>

                  <div className="space-y-3 border-b border-slate-100 px-5 py-5 text-[13px] text-slate-700 sm:px-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Ship to</p>
                    <dl className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5">
                        <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Name</dt>
                        <dd className="mt-0.5 font-medium text-slate-900">{session.buyerName}</dd>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5">
                        <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Phone</dt>
                        <dd className="mt-0.5 font-medium text-slate-900">{session.buyerPhone}</dd>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5 sm:col-span-2">
                        <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Country</dt>
                        <dd className="mt-0.5 font-medium text-slate-900">{checkoutCountryLabel(session.buyerCountry)}</dd>
                      </div>
                      {session.buyerEmail.trim() ? (
                        <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5 sm:col-span-2">
                          <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Email</dt>
                          <dd className="mt-0.5 font-medium text-slate-900">{session.buyerEmail}</dd>
                        </div>
                      ) : null}
                      {session.buyerCity.trim() ? (
                        <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5">
                          <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">City</dt>
                          <dd className="mt-0.5 font-medium text-slate-900">{session.buyerCity}</dd>
                        </div>
                      ) : null}
                      {session.buyerAddress.trim() ? (
                        <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5 sm:col-span-2">
                          <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Address</dt>
                          <dd className="mt-0.5 leading-relaxed text-slate-900">{session.buyerAddress}</dd>
                        </div>
                      ) : null}
                    </dl>
                  </div>

                  <div className="space-y-4 border-b border-slate-100 px-5 py-5 sm:px-6">
                    <CheckoutPaymentTrustStrip />
                    <div className="flex flex-wrap items-end justify-between gap-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Choose payment</p>
                      <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/90">
                        Secure
                      </span>
                    </div>

                    {!codAvailable ? (
                      <>
                        <div
                          role="note"
                          className="rounded-xl border border-amber-200/90 bg-gradient-to-r from-amber-50 to-white px-4 py-3 text-[13px] text-amber-950"
                        >
                          <p className="font-semibold">International shipping</p>
                          <p className="mt-1 leading-relaxed text-amber-900/90">
                            Cash on delivery is only offered in Morocco. Complete checkout with PayPal below — use your
                            PayPal balance or pay with Visa / Mastercard as a guest.
                          </p>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <PaymentWizardTile
                            selected={paySelection === "paypal_wallet"}
                            onSelect={() => selectPayment("paypal_wallet")}
                            title="PayPal balance"
                            description="Log in with your PayPal account and pay in one tap."
                            badge={<PayPalMarkImg className="h-7" />}
                          />
                          <PaymentWizardTile
                            selected={paySelection === "paypal_card"}
                            onSelect={() => selectPayment("paypal_card")}
                            title="Debit / credit card"
                            description="Visa or Mastercard — guest checkout, secured by PayPal."
                            badge={<CardBrandRow />}
                          />
                        </div>
                        {showPayPalUi ? (
                          <div className="space-y-3 rounded-2xl border border-slate-200/90 bg-slate-50/50 p-4">
                            <p className="text-[12px] leading-relaxed text-slate-600">
                              Order amount for PayPal:{" "}
                              <span className="font-mono font-semibold text-slate-900">{paypalValue}</span>{" "}
                              <span className="font-mono font-semibold text-slate-900">{paypalCurrency}</span>
                              {/\bDH\b|\bMAD\b/i.test(priceLabel) ? (
                                <span className="text-slate-500"> (cart {priceLabel}; PayPal uses USD in Sandbox.)</span>
                              ) : (
                                <span className="text-slate-500"> (from {priceLabel})</span>
                              )}
                            </p>
                            <PayPalHostedButtons
                              clientId={paypalClientId}
                              currencyCode={paypalCurrency}
                              value={paypalValue}
                              funding={paySelection === "paypal_card" ? "card" : "paypal"}
                              createOrder={createPayPalOrder}
                              onApproved={onPayPalApproved}
                              onError={setPaypalUiError}
                              onCancel={() => {
                                setPaypalUiError(null);
                                setPaymentHint(null);
                              }}
                              disabled={checkoutBlocked || stockPending}
                            />
                            <p className="text-[11px] leading-relaxed text-slate-500">
                              After PayPal succeeds you&apos;ll continue to order confirmation with your Salvya reference.
                            </p>
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                          <PaymentWizardTile
                            selected={paySelection === "cod"}
                            onSelect={() => selectPayment("cod")}
                            title="Cash on delivery"
                            description="Pay the courier in cash when your parcel arrives in Morocco."
                            badge={
                              <span className="inline-flex items-center rounded-md bg-slate-900 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                                COD
                              </span>
                            }
                          />
                          <PaymentWizardTile
                            selected={paySelection === "paypal_wallet"}
                            onSelect={() => selectPayment("paypal_wallet")}
                            title="PayPal account"
                            description="Use your PayPal balance or linked bank account."
                            badge={<PayPalMarkImg className="h-7" />}
                          />
                          <PaymentWizardTile
                            selected={paySelection === "paypal_card"}
                            onSelect={() => selectPayment("paypal_card")}
                            title="Bank card"
                            description="Visa or Mastercard — no PayPal account required."
                            badge={<CardBrandRow />}
                          />
                        </div>

                        {showPayPalUi ? (
                          <div className="space-y-3 rounded-2xl border border-slate-200/90 bg-slate-50/50 p-4">
                            <p className="text-[12px] font-medium text-slate-800">
                              {paySelection === "paypal_card" ? "Card checkout (PayPal guest)" : "PayPal account checkout"}
                            </p>
                            <p className="text-[12px] leading-relaxed text-slate-600">
                              PayPal order: <span className="font-mono font-semibold">{paypalValue}</span>{" "}
                              <span className="font-mono font-semibold">{paypalCurrency}</span>
                              {/\bDH\b|\bMAD\b/i.test(priceLabel) ? (
                                <span className="text-slate-500">
                                  {" "}
                                  — cart <span className="font-medium text-slate-800">{priceLabel}</span>; PayPal uses USD in
                                  Sandbox.
                                </span>
                              ) : (
                                <span> — from {priceLabel}</span>
                              )}
                            </p>
                            <PayPalHostedButtons
                              clientId={paypalClientId}
                              currencyCode={paypalCurrency}
                              value={paypalValue}
                              funding={paySelection === "paypal_card" ? "card" : "paypal"}
                              createOrder={createPayPalOrder}
                              onApproved={onPayPalApproved}
                              onError={setPaypalUiError}
                              onCancel={() => {
                                setPaypalUiError(null);
                                setPaymentHint(null);
                              }}
                              disabled={checkoutBlocked || stockPending}
                            />
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 px-4 py-3 text-[12px] leading-relaxed text-slate-600">
                            No online payment needed for COD. Tap <span className="font-medium text-slate-800">Continue</span>{" "}
                            to review your order on the confirmation screen.
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="space-y-4 px-5 py-6 sm:px-6 sm:py-7">
                    <TrustStrip />

                    {paymentHint ? (
                      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-950" role="status">
                        {paymentHint}
                      </p>
                    ) : null}
                    {stockReserveError ? (
                      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-950" role="alert">
                        {stockReserveError}
                      </p>
                    ) : null}
                    {paypalUiError ? (
                      <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-950" role="alert">
                        {paypalUiError}
                      </p>
                    ) : null}
                    {paypalComplete && paypalRequired ? (
                      <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-medium text-emerald-950" role="status">
                        PayPal payment received — you can continue to confirmation.
                      </p>
                    ) : null}

                    {stockPending ? (
                      <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] text-slate-700" role="status">
                        Securing your size for checkout…
                      </p>
                    ) : null}
                    {checkoutBlocked ? (
                      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] font-medium text-amber-950">
                        {stockReserveError ??
                          "This item is sold out — payment and confirmation are unavailable."}
                      </p>
                    ) : null}
                    <motion.button
                      type="button"
                      onClick={goToConfirm}
                      disabled={continueDisabled}
                      className="flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#2D6BFF] to-[#2557d6] text-[15px] font-semibold text-white shadow-[0_10px_32px_-10px_rgba(45,107,255,0.55)] transition-[transform,box-shadow] hover:shadow-[0_14px_40px_-10px_rgba(45,107,255,0.58)] disabled:cursor-not-allowed disabled:opacity-45"
                      whileTap={continueDisabled ? undefined : { scale: 0.99 }}
                    >
                      <IconCreditCard className="size-5 shrink-0 text-white/95" />
                      {continueLabel}
                      <span aria-hidden className="text-lg font-normal opacity-90">
                        →
                      </span>
                    </motion.button>
                    <p className="text-center text-[11px] leading-relaxed text-slate-400">
                      {paypalClientId.trim() ? (
                        <>PayPal secured checkout. COD skips the PayPal window.</>
                      ) : (
                        <>
                          Add <span className="font-mono text-[10px]">NEXT_PUBLIC_PAYPAL_CLIENT_ID</span> to{" "}
                          <span className="font-mono text-[10px]">salvya.local.env</span> and restart dev for live buttons.
                        </>
                      )}
                    </p>
                  </div>
                </>
              ) : (
                <div className="px-5 py-10 text-center text-[14px] text-slate-500 sm:px-6">Returning to information step…</div>
              )}
            </div>
          </div>

          {bag ? (
            <BagCheckoutOrderSummary
              lines={bag.summaryLines}
              subtotalLabel={bag.subtotalLabel}
              discountLabel={pricing.discountLabel}
              totalLabel={pricing.totalLabel}
              footer={
                <div className="mt-3 space-y-3">
                  {detailsPath && pathname ? (
                    <CheckoutCouponField
                      priceLabel={effectivePriceLabel}
                      recapQty={effectiveQty}
                      pathname={pathname}
                      productId={contentId}
                      artistSlug={bag.summaryLines[0]?.artistSlug ?? null}
                      applied={coupon?.ok ? coupon : null}
                      onApplied={persistCoupon}
                    />
                  ) : null}
                </div>
              }
            />
          ) : (
          <ProductCheckoutOrderSummary
            displayTitle={displayTitle}
            recapColorLabel={recapColorLabel}
            recapSize={recapSize}
            kindLabel={kindLabel}
            recapQty={recapQty}
            priceLabel={priceLabel}
            productImageSrc={productImageSrc}
            deliveryHint={deliveryHint}
            discountLabel={pricing.discountLabel}
            totalLabel={pricing.totalLabel}
            footer={
              <div className="mt-3 space-y-3">
                {detailsPath && pathname ? (
                  <CheckoutCouponField
                    priceLabel={priceLabel}
                    recapQty={recapQty}
                    pathname={pathname}
                    productId={contentId}
                    artistSlug={checkoutMeta?.artistSlug ?? null}
                    applied={coupon?.ok ? coupon : null}
                    onApplied={persistCoupon}
                  />
                ) : null}
                <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-[11px] leading-snug text-slate-600">
                  <p>
                    <span className="text-slate-500">Next · </span>
                    <span className="font-medium text-slate-800">{CHECKOUT_NEXT_STEP_PAGE}</span>
                  </p>
                  <div className="flex items-center justify-between gap-2 border-t border-slate-100/80 pt-2">
                    <span className="text-slate-500">Pay with</span>
                    <CardBrandRow className="scale-90" />
                  </div>
                </div>
              </div>
            }
          />
          )}
        </div>
      </motion.main>
    </div>
  );
}
