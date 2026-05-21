"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { ProductCheckoutPageProps } from "@/components/shop/ProductCheckoutPage";
import { checkoutCountryLabel, isKnownCheckoutCountry } from "@/lib/checkout-country";
import { checkoutSessionExpiryMessage, isCheckoutSessionExpired } from "@/lib/checkout/session-guard";
import {
  ensureCheckoutPlacementKey,
  formatCheckoutPaymentLine,
  mergeCheckoutDetailsPatch,
  readCheckoutDetailsSession,
  type CheckoutDetailsSessionV1,
} from "@/lib/checkout-preview-session";
import { placeCustomerOrder } from "@/lib/orders/place-order-client";
import type { OrderPaymentStatus } from "@/lib/orders/types";
import { analyticsValueFromPriceLabel } from "@/lib/analytics/currency-value";
import { trackPurchase } from "@/lib/analytics/meta-pixel";
import { getAnalyticsTracker } from "@/lib/analytics/tracker";
import { tryClaimMetaPurchaseFire } from "@/lib/analytics/purchase-dedupe";
import { makeProductId } from "@/lib/member/likes-storage";
import { notifyOrderPlaced } from "@/lib/notifications/automation";
import { readCreatorReferralFromDocument } from "@/lib/creator/referral-cookie";
import { useCheckoutLabels } from "@/lib/i18n/use-checkout-labels";

const serif = "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif";

function firstNameFromFull(full: string): string {
  const t = full.trim();
  if (!t) return "there";
  return t.split(/\s+/)[0] ?? "there";
}

function paymentStatusNote(
  t: ReturnType<typeof useCheckoutLabels>["t"],
  method: "cod" | "paypal" | undefined,
  paymentStatus?: OrderPaymentStatus,
): string {
  if (method === "cod") return t("codNote");
  if (paymentStatus === "paid") return t("paidNote");
  if (method === "paypal") return t("verifyingPayPal");
  return t("orderConfirmed");
}

const COLOR_IDS = ["ink", "bone", "twilight"] as const;

const fadeUp = {
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
};

function AmbientOrbs({ active }: { active: boolean }) {
  return (
    <>
      <motion.div
        className="absolute -left-[20%] top-[8%] h-[min(42rem,90vw)] w-[min(42rem,90vw)] rounded-full bg-[#2D6BFF]/[0.22] blur-[100px]"
        aria-hidden
        animate={active ? { x: [0, 28, 0], y: [0, 18, 0], scale: [1, 1.05, 1] } : false}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-[18%] bottom-[5%] h-[min(36rem,85vw)] w-[min(36rem,85vw)] rounded-full bg-violet-600/[0.18] blur-[95px]"
        aria-hidden
        animate={active ? { x: [0, -22, 0], y: [0, -26, 0], scale: [1, 1.08, 1] } : false}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute left-1/2 top-[45%] h-[min(28rem,70vw)] w-[min(28rem,70vw)] -translate-x-1/2 rounded-full bg-emerald-500/[0.12] blur-[85px]"
        aria-hidden
        animate={active ? { opacity: [0.35, 0.55, 0.35], scale: [0.95, 1.02, 0.95] } : false}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
}

function FloatingParticles({ active }: { active: boolean }) {
  const specs = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        left: `${(i * 37 + 11) % 100}%`,
        top: `${(i * 53 + 7) % 92}%`,
        size: 1 + (i % 3),
        duration: 10 + (i % 9),
        delay: (i % 8) * 0.35,
        opacity: 0.12 + (i % 5) * 0.05,
      })),
    [],
  );
  if (!active) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {specs.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-white"
          style={{ left: p.left, top: p.top, width: p.size, height: p.size, opacity: p.opacity }}
          animate={{ y: [0, -14, 0], opacity: [p.opacity, p.opacity * 1.8, p.opacity] }}
          transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
        />
      ))}
    </div>
  );
}

function ConfettiBurst({ active }: { active: boolean }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => {
        const angle = (i / 16) * Math.PI * 2 + 0.2;
        const dist = 72 + (i % 5) * 14;
        const colors = ["#2D6BFF", "#34d399", "#a78bfa", "#fbbf24", "#38bdf8", "#fb7185"];
        return { angle, dist, color: colors[i % colors.length], delay: 0.42 + i * 0.025, w: 3 + (i % 3), h: 5 + (i % 4) };
      }),
    [],
  );
  if (!active) return null;
  return (
    <div className="pointer-events-none absolute left-1/2 top-[5.5rem] z-[1] -translate-x-1/2" aria-hidden>
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className="absolute left-0 top-0 rounded-[2px] shadow-sm"
          style={{
            width: p.w,
            height: p.h,
            backgroundColor: p.color,
            marginLeft: -p.w / 2,
            marginTop: -p.h / 2,
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
          animate={{
            x: Math.cos(p.angle) * p.dist,
            y: Math.sin(p.angle) * p.dist - 28,
            opacity: 0,
            scale: 0.35,
            rotate: i % 2 ? 160 : -140,
          }}
          transition={{ duration: 1.15, delay: p.delay, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
    </div>
  );
}

function ThankYouCheckmark() {
  return (
    <motion.div
      className="relative z-[2] mx-auto flex h-28 w-28 items-center justify-center"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", damping: 13, stiffness: 240, delay: 0.06 }}
    >
      <motion.div
        className="absolute inset-[-6px] rounded-full border border-emerald-400/25"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: [0.85, 1.12, 1], opacity: [0, 0.9, 0] }}
        transition={{ duration: 1.4, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden
      />
      <div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400/35 via-[#2D6BFF]/22 to-violet-500/25 blur-2xl"
        aria-hidden
      />
      <div className="relative flex h-[4.75rem] w-[4.75rem] items-center justify-center rounded-full border border-emerald-400/45 bg-gradient-to-b from-emerald-500/25 to-emerald-950/30 shadow-[0_0_0_1px_rgba(255,255,255,0.1)_inset,0_24px_60px_-18px_rgba(16,185,129,0.5)]">
        <motion.svg
          viewBox="0 0 48 48"
          className="h-12 w-12 text-emerald-200"
          fill="none"
          initial="hidden"
          animate="visible"
        >
          <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
          <motion.path
            d="M14 24.5l7 7 13-14"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={{
              hidden: { pathLength: 0, opacity: 0 },
              visible: {
                pathLength: 1,
                opacity: 1,
                transition: {
                  pathLength: { delay: 0.32, duration: 0.48, ease: [0.22, 1, 0.36, 1] },
                  opacity: { delay: 0.32, duration: 0.2 },
                },
              },
            }}
          />
        </motion.svg>
      </div>
    </motion.div>
  );
}

function TimelineIcon({ type }: { type: "check" | "box" | "truck" }) {
  if (type === "check")
    return (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  if (type === "box")
    return (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 3l8 4v6c0 4-3 8-8 9-5-1-8-5-8-9V7l8-4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M12 12V3M4 7l8 5 8-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M14 18V6a2 2 0 00-2-2H4v12h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M14 18h6l-3-3m0 0l3-3m-3 3h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DeliveryTimeline({ reduceMotion }: { reduceMotion: boolean | null }) {
  const { t } = useCheckoutLabels();
  const steps = [
    { label: t("timelineConfirmed"), sub: t("timelineConfirmed"), icon: "check" as const },
    { label: t("timelinePreparing"), sub: t("timelinePreparing"), icon: "box" as const },
    { label: t("timelineShipped"), sub: t("timelineShipped"), icon: "truck" as const },
  ];
  return (
    <div className="mt-6 border-t border-white/[0.08] pt-5">
      <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-normal text-white/40">{t("timelineWhatNext")}</p>
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
        {steps.map((s, i) => (
          <motion.div
            key={s.label}
            className="flex aspect-square min-h-0 flex-col items-center justify-center gap-1 rounded-xl border border-white/[0.1] bg-gradient-to-b from-white/[0.08] to-white/[0.02] px-1.5 py-2 text-center shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] sm:gap-1.5 sm:rounded-2xl sm:px-2 sm:py-2.5"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : 0.4 + i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/25 sm:h-8 sm:w-8 sm:rounded-xl">
              <TimelineIcon type={s.icon} />
            </div>
            <p className="text-[10px] font-semibold leading-tight text-white sm:text-[11px]">{s.label}</p>
            <p className="line-clamp-2 text-[9px] leading-snug text-white/45 sm:text-[10px]">{s.sub}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function TrustChips() {
  const { t } = useCheckoutLabels();
  const items = [
    { label: t("buyPanel.trustLine"), icon: "lock" as const },
    { label: t("shippingLabel"), icon: "truck" as const },
    { label: t("wizardKicker"), icon: "star" as const },
  ];
  return (
    <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
      {items.map((t) => (
        <span
          key={t.label}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.05] px-3 py-1.5 text-[11px] font-medium text-white/55 backdrop-blur-sm"
        >
          {t.icon === "lock" ? (
            <svg className="h-3.5 w-3.5 text-emerald-300/90" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M7 11V8a5 5 0 0110 0v3M6 11h12v9H6V11z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : t.icon === "truck" ? (
            <svg className="h-3.5 w-3.5 text-sky-300/90" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M14 18V6a2 2 0 00-2-2H4v12h8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              <path d="M14 18h6l-3-3m0 0l3-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          ) : (
            <svg className="h-3.5 w-3.5 text-amber-200/90" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 2l2.6 7.4h7.8l-6.3 4.6 2.4 7.4L12 16.9 5.5 21.4 8 14 1.6 9.4H9.4L12 2z" />
            </svg>
          )}
          {t.label}
        </span>
      ))}
    </div>
  );
}

function LoadingHero({ verifyingPayPal }: { verifyingPayPal?: boolean }) {
  const { t } = useCheckoutLabels();
  return (
    <div className="mx-auto w-full max-w-lg space-y-6 px-2 text-center">
      <motion.div
        className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-white/[0.06]"
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="text-3xl" aria-hidden>
          {verifyingPayPal ? "🔒" : "✦"}
        </span>
      </motion.div>
      <div className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
          {verifyingPayPal ? t("securingPayment") : t("placingOrder")}
        </p>
        <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
          {verifyingPayPal ? t("verifyingPayPal") : t("almostThere")}
        </h2>
        <p className="mx-auto max-w-sm text-[13px] leading-relaxed text-white/55">
          {verifyingPayPal ? t("paypalVerifyNote") : t("placingOrder")}
        </p>
      </div>
    </div>
  );
}

export function ProductCheckoutConfirmPage({
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
  variantId,
  bag,
}: ProductCheckoutPageProps) {
  const { t, tCommon, tProduct } = useCheckoutLabels();
  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const detailsPath = useMemo(() => {
    if (!pathname?.endsWith("/checkout/confirm")) return null;
    return pathname.slice(0, -"/confirm".length);
  }, [pathname]);

  const q = previewQueryString.trim();
  const qs = q ? `?${q}` : "";

  const detailsHref = useMemo(() => (detailsPath ? `${detailsPath}${qs}` : "#"), [detailsPath, qs]);

  const paymentHref = useMemo(
    () => (detailsPath ? `${detailsPath}/payment${qs}` : "#"),
    [detailsPath, qs],
  );

  const isBagCheckout = Boolean(bag?.primaryLineItem);

  const checkoutMeta = useMemo(() => {
    const m = pathname?.match(/^\/artist\/([^/]+)\/(item|tshirt)\/([^/]+)\/checkout\/confirm$/);
    if (!m) return null;
    return {
      artistSlug: m[1]!,
      itemSlug: m[3]!,
      productKind: m[2] === "tshirt" ? ("tshirt" as const) : ("hoodie" as const),
    };
  }, [pathname]);

  const recapColorId = useMemo(() => {
    const raw = new URLSearchParams(previewQueryString).get("color") ?? "ink";
    return (COLOR_IDS as readonly string[]).includes(raw) ? raw : "ink";
  }, [previewQueryString]);

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<CheckoutDetailsSessionV1 | null>(null);
  const [placingOrder, setPlacingOrder] = useState(true);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<OrderPaymentStatus | undefined>(undefined);
  const [orderErrorCode, setOrderErrorCode] = useState<string | undefined>(undefined);
  const placeStarted = useRef(false);

  useEffect(() => {
    if (!orderError || !checkoutMeta || !pathname) return;
    const contentId = makeProductId(
      checkoutMeta.artistSlug,
      checkoutMeta.productKind === "tshirt" ? "tee" : "hoodie",
      checkoutMeta.itemSlug,
    );
    getAnalyticsTracker().trackCheckoutError(pathname, contentId, checkoutMeta.artistSlug, {
      step: "confirm",
      message: orderError.slice(0, 240),
    });
  }, [orderError, checkoutMeta, pathname]);

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
    if (!isKnownCheckoutCountry(data.buyerCountry)) {
      router.replace(detailsHref);
      return;
    }
    if (isCheckoutSessionExpired(data.savedAt)) {
      router.replace(detailsHref);
      return;
    }
    if (!data.paymentMethod) {
      router.replace(paymentHref);
      return;
    }
    if (data.paymentMethod === "paypal" && !data.paypalOrderId?.trim()) {
      router.replace(paymentHref);
      return;
    }
    setSession(data);
    if (data.orderNumber) {
      setOrderNumber(data.orderNumber);
      setPlacingOrder(false);
    }
  }, [detailsHref, detailsPath, paymentHref, router]);

  useEffect(() => {
    if (!session || !detailsPath || placeStarted.current) return;
    if (!isBagCheckout && !checkoutMeta) return;
    if (session.orderNumber) {
      setOrderNumber(session.orderNumber);
      return;
    }

    placeStarted.current = true;
    let cancelled = false;

    (async () => {
      setPlacingOrder(true);
      setOrderError(null);

      if (isCheckoutSessionExpired(session.savedAt)) {
        if (!cancelled) {
          setOrderError(checkoutSessionExpiryMessage());
          setPlacingOrder(false);
          placeStarted.current = false;
        }
        return;
      }

      const placementKey = session.placementKey?.trim() || ensureCheckoutPlacementKey(detailsPath);
      if (!placementKey) {
        if (!cancelled) {
          setOrderError(t("confirmFailed"));
          setPlacingOrder(false);
          placeStarted.current = false;
        }
        return;
      }

      const payment =
        session.paymentMethod === "cod"
          ? { method: "cod" as const }
          : {
              method: "paypal" as const,
              instrument: session.paymentInstrument,
              paypalOrderId: session.paypalOrderId,
              paypalCaptureId: session.paypalCaptureId,
            };

      const savedId = session.savedAddressId?.trim();
      const creatorRef = readCreatorReferralFromDocument();
      const lineItem = isBagCheckout
        ? bag!.primaryLineItem
        : {
            artistSlug: checkoutMeta!.artistSlug,
            itemSlug: checkoutMeta!.itemSlug,
            productKind: checkoutMeta!.productKind,
            variantId,
            displayTitle,
            priceLabel,
            kindLabel,
            qty: recapQty,
            size: recapSize,
            colorId: recapColorId,
            colorLabel: recapColorLabel,
            productImageSrc: productImageSrc || undefined,
          };
      const result = await placeCustomerOrder({
        placementKey,
        checkoutPath: detailsPath,
        lineItem,
        shipping: {
          buyerName: session.buyerName,
          buyerPhone: session.buyerPhone,
          buyerEmail: session.buyerEmail,
          buyerCountry: session.buyerCountry,
          buyerCity: session.buyerCity,
          buyerAddress: session.buyerAddress,
        },
        payment,
        ...(session.discountCents ? { discountCents: session.discountCents } : {}),
        ...(session.couponCode ? { couponCode: session.couponCode } : {}),
        checkoutSavedAt: session.savedAt,
        ...(savedId ? { shippingAddressId: savedId } : {}),
        ...(creatorRef?.code ? { creatorTrackingCode: creatorRef.code } : {}),
      });

      if (cancelled) return;

      if (!result.ok) {
        setOrderError(result.error);
        setOrderErrorCode(result.code);
        setPlacingOrder(false);
        placeStarted.current = false;
        return;
      }

      mergeCheckoutDetailsPatch(detailsPath, { orderNumber: result.order.orderNumber, placementKey });
      setOrderNumber(result.order.orderNumber);
      setPaymentStatus(result.order.paymentStatus);
      notifyOrderPlaced(result.order.orderNumber);
      setPlacingOrder(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [
    bag,
    checkoutMeta,
    detailsPath,
    displayTitle,
    isBagCheckout,
    kindLabel,
    priceLabel,
    productImageSrc,
    recapColorId,
    recapColorLabel,
    recapQty,
    recapSize,
    session,
    variantId,
    t,
  ]);

  useEffect(() => {
    if (!orderNumber || orderError || !session || !checkoutMeta) return;
    if (!tryClaimMetaPurchaseFire(orderNumber)) return;
    const { value, currency } = analyticsValueFromPriceLabel(priceLabel, recapQty);
    const likedType = checkoutMeta.productKind === "tshirt" ? "tee" : "hoodie";
    const contentId = makeProductId(checkoutMeta.artistSlug, likedType, checkoutMeta.itemSlug);
    const unit = recapQty > 0 ? Math.round((value / recapQty) * 100) / 100 : value;
    void trackPurchase({
      orderNumber,
      value,
      currency,
      contents: [{ id: contentId, quantity: recapQty, item_price: unit, title: displayTitle }],
      eventId: `salvya_order_${orderNumber}`,
    });
    getAnalyticsTracker().trackPurchase(pathname || "/", contentId, checkoutMeta.artistSlug, {
      order_number: orderNumber,
      recap_qty: recapQty,
      value,
      currency,
      payment_status: paymentStatus ?? null,
    });
  }, [orderNumber, orderError, session, checkoutMeta, priceLabel, recapQty, displayTitle, pathname, paymentStatus]);

  const recapLine = `${recapQty}× ${displayTitle} · ${recapColorLabel} · ${recapSize} · ${kindLabel}`;
  const greet = session ? firstNameFromFull(session.buyerName) : "there";
  const orderRef = orderNumber ?? "";
  const verifyingPayPal = placingOrder && session?.paymentMethod === "paypal";

  const motionOn = !reduceMotion;

  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden bg-[#030408] text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_130%_90%_at_50%_-15%,rgba(45,107,255,0.42),transparent_58%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,0,0,0)_0%,#030408_65%)]" />
        <AmbientOrbs active={motionOn} />
        <FloatingParticles active={motionOn} />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2032%2032%22%20width%3D%2232%22%20height%3D%2232%22%20fill%3D%22none%22%20stroke%3D%22rgba(255%2C255%2C255%2C0.035)%22%3E%3Cpath%20d%3D%22M0%20.5h32M.5%200v32%22%2F%3E%3C%2Fsvg%3E')] opacity-70" />
      </div>

      <header className="relative z-20 border-b border-white/[0.07] bg-black/30 px-4 py-4 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <Link
            href="/"
            className="group relative text-[14px] font-semibold tracking-tight text-white transition-colors hover:text-white"
          >
            <span className="relative z-[1]">{tCommon("brand")}</span>
            <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gradient-to-r from-[#5b8cff] to-emerald-400 transition-all duration-300 group-hover:w-full" />
          </Link>
          <div className="flex items-center gap-2">
            {orderRef ? (
              <span className="hidden rounded-full border border-white/[0.1] bg-white/[0.06] px-2.5 py-1 font-mono text-[10px] text-white/50 sm:inline">{orderRef}</span>
            ) : null}
            {orderRef ? (
              <span className="rounded-full border border-emerald-400/35 bg-gradient-to-r from-emerald-500/20 to-[#2D6BFF]/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-normal text-emerald-100/95 shadow-[0_0_20px_-4px_rgba(52,211,153,0.45)]">
                {t("orderPlaced")}
              </span>
            ) : verifyingPayPal ? (
              <span className="rounded-full border border-sky-400/35 bg-sky-500/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-normal text-sky-100/95">
                {t("verifyingPaymentBadge")}
              </span>
            ) : null}
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex min-h-[calc(100dvh-4.5rem)] max-w-3xl flex-col justify-center px-4 py-10 sm:px-6 sm:py-14">
        {loading || placingOrder ? (
          <LoadingHero verifyingPayPal={verifyingPayPal} />
        ) : orderError && session ? (
          <motion.div
            className="mx-auto w-full max-w-lg rounded-2xl border border-rose-500/30 bg-rose-950/40 px-6 py-8 text-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-[15px] font-semibold text-rose-100">
              {session.paymentMethod === "paypal" ? t("paymentVerifyFailed") : t("confirmFailed")}
            </p>
            <p className="mt-3 text-[13px] leading-relaxed text-rose-100/85">{orderError}</p>
            {session.paymentMethod === "paypal" ? (
              <p className="mt-2 text-[12px] leading-relaxed text-rose-100/70">{t("paypalVerifyNote")}</p>
            ) : null}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href={paymentHref}
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-white px-5 text-[14px] font-semibold text-slate-950"
              >
                {t("backToPayment")}
              </Link>
              {orderErrorCode === "duplicate_payment" ? (
                <Link
                  href="/track-order"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-white/25 bg-white/10 px-5 text-[14px] font-semibold text-white"
                >
                  {t("trackYourOrder")}
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  placeStarted.current = false;
                  setOrderError(null);
                  setOrderErrorCode(undefined);
                  setPlacingOrder(true);
                  const fresh = detailsPath ? readCheckoutDetailsSession(detailsPath) : null;
                  if (fresh) setSession({ ...fresh });
                }}
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-white/25 px-5 text-[14px] font-semibold text-white"
              >
                {tCommon("tryAgain")}
              </button>
            </div>
          </motion.div>
        ) : session && orderRef ? (
          <div className="relative mx-auto w-full max-w-lg">
            <ConfettiBurst active={motionOn} />

            <motion.div
              className="relative overflow-hidden rounded-[1.85rem] p-[1px] sm:rounded-[2.1rem]"
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className="absolute inset-[-40%] opacity-70 blur-2xl"
                style={{
                  background: "conic-gradient(from 180deg at 50% 50%, rgba(45,107,255,0.5), rgba(52,211,153,0.35), rgba(167,139,250,0.4), rgba(45,107,255,0.5))",
                }}
                animate={motionOn ? { rotate: [0, 360] } : false}
                transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
                aria-hidden
              />
              <div className="relative overflow-hidden rounded-[1.8rem] border border-white/[0.14] bg-[#0a0c14]/80 shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset,0_40px_100px_-30px_rgba(0,0,0,0.85)] backdrop-blur-2xl sm:rounded-[2.05rem]">
                {motionOn ? (
                  <motion.div
                    className="pointer-events-none absolute -inset-1 bg-gradient-to-r from-transparent via-white/[0.09] to-transparent"
                    style={{ transform: "skewX(-18deg)" }}
                    initial={{ x: "-120%" }}
                    animate={{ x: "120%" }}
                    transition={{ duration: 2.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    aria-hidden
                  />
                ) : null}

                <div className="relative px-6 pb-8 pt-8 sm:px-10 sm:pb-10 sm:pt-9">
                  <ThankYouCheckmark />

                  <motion.div
                    className="relative z-[2] mt-7 text-center"
                    variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09 } } }}
                    initial="hidden"
                    animate="show"
                  >
                    <motion.p
                      className="text-[11px] font-semibold uppercase tracking-normal text-[#8eb4ff]"
                      variants={fadeUp}
                      transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {t("orderConfirmed")}
                    </motion.p>
                    <motion.h1
                      className="mt-3 bg-gradient-to-br from-white via-white to-white/75 bg-clip-text text-[1.9rem] font-semibold leading-[1.12] tracking-tight text-transparent sm:text-[2.45rem]"
                      style={{
                        fontFamily: serif,
                        textShadow: "0 0 80px rgba(255,255,255,0.12)",
                      }}
                      variants={fadeUp}
                      transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {greet === "there" ? t("allSet") : `${t("allSet").replace(/\.$/, "")}, ${greet}.`}
                    </motion.h1>
                    <motion.p
                      className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-white/75 sm:text-[1.06rem]"
                      variants={fadeUp}
                      transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {t("thankYouEmail", { artist: artistName, email: session.buyerEmail })}
                    </motion.p>
                    <motion.p
                      className="mx-auto mt-4 max-w-md rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-[12px] leading-relaxed text-white/55"
                      variants={fadeUp}
                      transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {paymentStatusNote(t, session.paymentMethod, paymentStatus)}{" "}
                      <span className="font-mono text-white/70">{orderRef}</span>
                    </motion.p>
                  </motion.div>

                  <motion.div
                    className="relative z-[2] mt-8 flex gap-4 overflow-hidden rounded-2xl border border-white/[0.1] bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset] sm:p-5"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.28, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="absolute right-3 top-3 rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-medium uppercase tracking-normal text-white/40">
                      {productKind === "hoodie" ? tProduct("hoodie") : tProduct("tshirt")}
                    </div>
                    <div className="relative h-[5.75rem] w-[4.5rem] shrink-0 overflow-hidden rounded-xl border border-white/15 bg-black/40 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.8)] ring-1 ring-white/10">
                      {productImageSrc ? (
                        <Image
                          src={productImageSrc}
                          alt={displayTitle}
                          fill
                          className="object-cover object-center"
                          sizes="80px"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] text-white/35">{t("noImage")}</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 pr-12">
                      <p className="line-clamp-2 text-[14px] font-semibold leading-snug text-white sm:text-[15px]">{displayTitle}</p>
                      <p className="mt-2 text-[12px] leading-relaxed text-white/48">{recapLine}</p>
                      <p className="mt-1 text-[11px] text-white/40">
                        {t("recapShipTo")} · {checkoutCountryLabel(session.buyerCountry)}
                      </p>
                      <p className="mt-2 text-[11px] leading-relaxed text-white/55">
                        {t("payment")} · {formatCheckoutPaymentLine(session)}
                      </p>
                      <div className="mt-3 flex flex-wrap items-baseline gap-2">
                        <span className="text-[13px] font-semibold tabular-nums text-emerald-200/95">{priceLabel}</span>
                        {orderRef ? (
                          <span className="font-mono text-[11px] text-white/35">{orderRef}</span>
                        ) : null}
                      </div>
                    </div>
                  </motion.div>

                  <DeliveryTimeline reduceMotion={reduceMotion} />

                  <TrustChips />

                  <motion.div
                    className="relative z-[2] mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.45 }}
                  >
                    <Link
                      href={`/track-order?order=${encodeURIComponent(orderRef)}&email=${encodeURIComponent(session.buyerEmail)}`}
                      className="group relative inline-flex min-h-[52px] flex-1 items-center justify-center overflow-hidden rounded-xl bg-white px-6 text-[15px] font-semibold text-slate-950 shadow-[0_14px_44px_-14px_rgba(255,255,255,0.45)] transition-[transform,box-shadow] hover:shadow-[0_18px_50px_-12px_rgba(255,255,255,0.55)] active:scale-[0.99] sm:flex-initial sm:min-w-[12.5rem]"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                      <span className="relative">{t("trackYourOrder")}</span>
                    </Link>
                    <Link
                      href="/"
                      className="inline-flex min-h-[52px] flex-1 items-center justify-center rounded-xl border border-white/25 bg-white/[0.06] px-6 text-[15px] font-semibold text-white/92 backdrop-blur-sm transition-[border-color,background-color] hover:border-white/40 hover:bg-white/[0.1] active:scale-[0.99] sm:flex-initial sm:min-w-[12.5rem]"
                    >
                      {t("backHome")}
                    </Link>
                    <Link
                      href={returnHref}
                      className="inline-flex min-h-[52px] flex-1 items-center justify-center rounded-xl border border-white/20 bg-transparent px-6 text-[14px] font-semibold text-white/75 hover:text-white sm:flex-initial"
                    >
                      {bag ? t("backToBag") : t("backToProduct")}
                    </Link>
                  </motion.div>

                  <p className="relative z-[2] mt-7 text-center text-[11px] text-white/32">
                    <Link
                      href={detailsHref}
                      className="text-white/55 underline decoration-white/15 underline-offset-2 transition-colors hover:text-white/85"
                    >
                      {t("editInformation")}
                    </Link>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          <p className="text-center text-[15px] text-white/50">{t("returningToCheckout")}</p>
        )}
      </main>
    </div>
  );
}
