"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { IconCreditCard } from "@/components/shop/product-dock-icons";
import { ProductCheckoutOrderSummary } from "@/components/shop/ProductCheckoutOrderSummary";
import { CardBrandRow, CheckoutStepGraphic, TrustStrip } from "@/components/shop/product-checkout-shared";
import { saveCheckoutDetailsSession } from "@/lib/checkout-preview-session";
import { CHECKOUT_COUNTRY_MOROCCO, CHECKOUT_COUNTRY_OPTIONS } from "@/lib/checkout-country";
import { customerAddressToCheckoutShipping } from "@/lib/checkout/address-fields";
import { useSupabaseUser } from "@/components/member/useSupabaseUser";
import type { CustomerAddress } from "@/lib/addresses/types";
import { trackInitiateCheckout } from "@/lib/analytics/meta-pixel";
import { getAnalyticsTracker } from "@/lib/analytics/tracker";
import { makeProductId } from "@/lib/member/likes-storage";
import { useTranslations } from "next-intl";
import { useCheckoutLabels } from "@/lib/i18n/use-checkout-labels";
import type { OrderLineItem } from "@/lib/orders/types";

function FieldLabel({ children, optional }: { children: string; optional?: boolean }) {
  const tCommon = useTranslations("common");
  return (
    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-normal text-slate-500">
      {children}
      {optional ? (
        <span className="ml-1.5 font-normal normal-case tracking-normal text-slate-400">({tCommon("optional")})</span>
      ) : null}
    </p>
  );
}

function SectionTitle({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="mb-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#2D6BFF]">{eyebrow}</p>
      <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
      <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">{subtitle}</p>
    </div>
  );
}

function phoneValid(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 8;
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ProductCheckoutPageProps = {
  artistName: string;
  displayTitle: string;
  priceLabel: string;
  productKind: "hoodie" | "tshirt";
  kindLabel: string;
  returnHref: string;
  recapQty: number;
  recapSize: string;
  recapColorLabel: string;
  productImageSrc: string;
  previewQueryString: string;
  soldOut?: boolean;
  /** Authoritative catalog price (minor units, base currency). */
  priceCents?: number;
  /** Server-computed PayPal charge — do not derive client-side for payment. */
  serverPayPalAmount?: { currency_code: string; value: string };
  /** Authoritative variant row for inventory + pricing. */
  variantId: string;
  /** Multi-line bag checkout payload when checkout runs from preview-bag. */
  bag?: {
    summaryLines: OrderLineItem[];
    subtotalLabel: string;
    subtotalCents: number;
    primaryLineItem: OrderLineItem;
  };
};

export function ProductCheckoutPage({
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
}: ProductCheckoutPageProps) {
  const { t, tAuth, tCommon } = useCheckoutLabels();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useSupabaseUser();
  const prefillUserId = useRef<string | null>(null);

  const checkoutMeta = useMemo(() => {
    const m = pathname?.match(/^\/artist\/([^/]+)\/(item|tshirt)\/([^/]+)\/checkout$/);
    if (!m) return null;
    return {
      artistSlug: m[1]!,
      itemSlug: m[3]!,
      productKind: m[2] === "tshirt" ? ("tshirt" as const) : ("hoodie" as const),
    };
  }, [pathname]);

  useEffect(() => {
    if (!checkoutMeta || !pathname) return;
    const contentId = makeProductId(
      checkoutMeta.artistSlug,
      checkoutMeta.productKind === "tshirt" ? "tee" : "hoodie",
      checkoutMeta.itemSlug,
    );
    const dedupeKey = `salvya_fbq_initiate_v1:${pathname}:${recapQty}:${contentId}`;
    try {
      if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(dedupeKey)) return;
      sessionStorage.setItem(dedupeKey, "1");
    } catch {
      /* private mode */
    }
    void trackInitiateCheckout({
      priceLabel,
      recapQty,
      contentId,
      contentName: displayTitle,
    });
    getAnalyticsTracker().trackBeginCheckout(pathname || "/", contentId, checkoutMeta.artistSlug, {
      recap_qty: recapQty,
    });
  }, [checkoutMeta, pathname, recapQty, priceLabel, displayTitle]);

  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerCountry, setBuyerCountry] = useState("MA");
  const [buyerCity, setBuyerCity] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const [savedAddresses, setSavedAddresses] = useState<CustomerAddress[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState<"saved" | "manual">("manual");
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id || prefillUserId.current === user.id) return;
    prefillUserId.current = user.id;
    setBuyerEmail((e) => (e.trim() ? e : user.email ?? ""));
    const meta = user.user_metadata as Record<string, unknown> | undefined;
    const full =
      typeof meta?.full_name === "string"
        ? meta.full_name
        : typeof meta?.name === "string"
          ? meta.name
          : typeof meta?.display_name === "string"
            ? meta.display_name
            : "";
    setBuyerName((n) => (n.trim() ? n : full.trim()));
    const phone =
      typeof meta?.phone === "string"
        ? meta.phone
        : typeof meta?.phone_number === "string"
          ? meta.phone_number
          : "";
    setBuyerPhone((p) => (p.trim() ? p : phone.trim()));
  }, [user]);

  useEffect(() => {
    if (!user?.id) {
      setSavedAddresses([]);
      setAddressesLoading(false);
      setDeliveryMode("manual");
      setSelectedAddressId(null);
      return;
    }

    let cancelled = false;
    (async () => {
      setAddressesLoading(true);
      try {
        const res = await fetch("/api/addresses", { credentials: "same-origin" });
        const data = (await res.json()) as { addresses?: CustomerAddress[] };
        if (cancelled) return;
        const list = Array.isArray(data.addresses) ? data.addresses : [];
        setSavedAddresses(list);
        if (list.length > 0) {
          const pick = list.find((a) => a.isDefault) ?? list[0];
          setDeliveryMode("saved");
          setSelectedAddressId(pick.id);
          const f = customerAddressToCheckoutShipping(pick);
          setBuyerName(f.buyerName);
          setBuyerPhone(f.buyerPhone);
          setBuyerCountry(f.buyerCountry);
          setBuyerCity(f.buyerCity);
          setBuyerAddress(f.buyerAddress);
        }
      } catch {
        if (!cancelled) setSavedAddresses([]);
      } finally {
        if (!cancelled) setAddressesLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    if (deliveryMode !== "saved" || !selectedAddressId) return;
    const addr = savedAddresses.find((a) => a.id === selectedAddressId);
    if (!addr) return;
    const f = customerAddressToCheckoutShipping(addr);
    setBuyerName(f.buyerName);
    setBuyerPhone(f.buyerPhone);
    setBuyerCountry(f.buyerCountry);
    setBuyerCity(f.buyerCity);
    setBuyerAddress(f.buyerAddress);
  }, [deliveryMode, selectedAddressId, savedAddresses]);

  const shippingLocked =
    Boolean(user?.id) && deliveryMode === "saved" && savedAddresses.length > 0 && Boolean(selectedAddressId);

  const trackShippingSelected = useCallback(
    (extra: { buyer_country: string; delivery_mode: "saved" | "manual"; saved_address_id?: string | null }) => {
      if (!checkoutMeta || !pathname) return;
      const contentId = makeProductId(
        checkoutMeta.artistSlug,
        checkoutMeta.productKind === "tshirt" ? "tee" : "hoodie",
        checkoutMeta.itemSlug,
      );
      getAnalyticsTracker().trackShippingSelected(pathname, contentId, checkoutMeta.artistSlug, extra);
    },
    [checkoutMeta, pathname],
  );

  useEffect(() => {
    if (!formError || !checkoutMeta || !pathname) return;
    const contentId = makeProductId(
      checkoutMeta.artistSlug,
      checkoutMeta.productKind === "tshirt" ? "tee" : "hoodie",
      checkoutMeta.itemSlug,
    );
    getAnalyticsTracker().trackCheckoutError(pathname, contentId, checkoutMeta.artistSlug, {
      step: "details",
      message: formError.slice(0, 240),
    });
  }, [formError, checkoutMeta, pathname]);

  const isMorocco = buyerCountry === CHECKOUT_COUNTRY_MOROCCO;
  const deliveryHint = useMemo(
    () => (isMorocco ? t("deliveryHintMorocco") : t("deliveryHintIntl")),
    [isMorocco, t],
  );

  const submit = useCallback(() => {
    if (soldOut) {
      setFormError(t("errors.soldOut"));
      return;
    }
    setFormError(null);
    const name = buyerName.trim();
    if (!name) {
      setFormError(t("errors.fullName"));
      return;
    }
    const phone = buyerPhone.trim();
    if (!phoneValid(phone)) {
      setFormError(t("errors.phone"));
      return;
    }
    const em = buyerEmail.trim();
    if (!em || !emailRe.test(em)) {
      setFormError(t("errors.email"));
      return;
    }
    const city = buyerCity.trim();
    const addr = buyerAddress.trim();

    if (!pathname?.endsWith("/checkout")) {
      setFormError(t("errors.storage"));
      return;
    }

    const savedAddr =
      deliveryMode === "saved" && selectedAddressId
        ? savedAddresses.find((a) => a.id === selectedAddressId)
        : undefined;

    if (deliveryMode === "saved" && savedAddresses.length > 0 && !savedAddr) {
      setFormError(t("errors.addressPath"));
      return;
    }

    const shippingFields = savedAddr
      ? customerAddressToCheckoutShipping(savedAddr)
      : {
          buyerName: name,
          buyerPhone: phone,
          buyerCountry,
          buyerCity: city,
          buyerAddress: addr,
        };

    const ok = saveCheckoutDetailsSession(pathname, {
      ...shippingFields,
      buyerEmail: em,
      ...(savedAddr ? { savedAddressId: savedAddr.id } : {}),
    });
    if (!ok) {
      setFormError(t("errors.storage"));
      return;
    }

    const q = previewQueryString.trim();
    const paymentHref = `${pathname}/payment${q ? `?${q}` : ""}`;
    router.push(paymentHref);
  }, [
    buyerAddress,
    buyerCity,
    buyerCountry,
    buyerEmail,
    buyerName,
    buyerPhone,
    deliveryMode,
    pathname,
    previewQueryString,
    router,
    savedAddresses,
    selectedAddressId,
    soldOut,
    t,
  ]);

  const inputClass =
    "min-h-[48px] w-full rounded-xl border border-slate-200/95 bg-white px-3.5 text-[15px] text-slate-900 shadow-sm placeholder:text-slate-400 transition-[border-color,box-shadow] focus:border-[#2D6BFF]/55 focus:outline-none focus:ring-2 focus:ring-[#2D6BFF]/18 disabled:bg-slate-50 disabled:text-slate-600";

  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden bg-[#f4f6fb] text-slate-900">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.14)_1px,transparent_0)] [background-size:22px_22px] opacity-70" />
        <div className="absolute -right-32 top-0 h-[28rem] w-[28rem] rounded-full bg-[#2D6BFF]/[0.07] blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-[22rem] w-[22rem] rounded-full bg-indigo-400/10 blur-3xl" />
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
                {t("backToProduct")}
              </Link>
              <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-600 sm:inline-flex">
                {t("stepInfo")}
              </span>
            </div>
            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-normal text-slate-500 sm:hidden">
              {t("checkout")}
            </span>
          </div>
          <CheckoutStepGraphic activeStep={1} />
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
            <div className="mb-6 hidden sm:block">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{t("wizardKicker")}</p>
              <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900 sm:text-[1.7rem]">
                {t("shippingAndContact")}
              </h1>
              {soldOut ? (
                <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] font-medium text-amber-950">
                  {t("soldOutClosed")}
                </p>
              ) : null}
              <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-slate-600">
                {t("introShipping", { kind: kindLabel })}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <CardBrandRow />
                <span className="text-[11px] text-slate-500">{t("cardsViaPayPal")}</span>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_24px_60px_-28px_rgba(15,23,42,0.18)]">
              <div className="h-1 w-full bg-gradient-to-r from-[#2D6BFF] via-indigo-400 to-[#2D6BFF]" aria-hidden />
              <div className="border-b border-slate-100 px-5 py-5 sm:px-6 sm:py-6">
                <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:hidden">{t("shippingAndContact")}</h1>
                <p className="mt-1 text-[13px] text-slate-500 sm:hidden">
                  {kindLabel} · {productKind === "hoodie" ? t("oversizeHoodie") : t("oversizeTee")} · {artistName}
                </p>
                <p className="mt-3 hidden text-[13px] text-slate-500 sm:block">
                  {kindLabel} · {productKind === "hoodie" ? t("oversizeHoodie") : t("oversizeTee")}
                </p>
              </div>

              {isMorocco ? (
                <div className="mx-5 mt-4 rounded-xl border border-emerald-200/90 bg-gradient-to-r from-emerald-50/90 to-white px-4 py-3 text-[13px] text-emerald-950 sm:mx-6">
                  <p className="font-semibold leading-relaxed text-emerald-950">{t("moroccoPaymentNote")}</p>
                </div>
              ) : (
                <div className="mx-5 mt-4 rounded-xl border border-amber-200/90 bg-gradient-to-r from-amber-50/95 to-white px-4 py-3 text-[13px] text-amber-950 sm:mx-6">
                  <p className="leading-relaxed text-amber-950">{t("internationalNote")}</p>
                </div>
              )}

              {formError ? (
                <div role="alert" className="mx-5 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800 sm:mx-6">
                  {formError}
                </div>
              ) : null}

              {user?.id ? (
                <div className="mx-5 mt-4 space-y-3 rounded-xl border border-slate-100 bg-slate-50/90 px-4 py-4 sm:mx-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{t("deliverySource")}</p>
                  {addressesLoading ? (
                    <p className="text-[13px] text-slate-500">{t("loadingAddresses")}</p>
                  ) : savedAddresses.length > 0 ? (
                    <>
                      <div className="flex flex-col gap-2">
                        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
                          <input
                            type="radio"
                            name="deliveryMode"
                            className="mt-1"
                            checked={deliveryMode === "saved"}
                            onChange={() => {
                              setDeliveryMode("saved");
                              const pick = savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0];
                              setSelectedAddressId(pick?.id ?? null);
                              trackShippingSelected({
                                buyer_country: pick ? customerAddressToCheckoutShipping(pick).buyerCountry : buyerCountry,
                                delivery_mode: "saved",
                                saved_address_id: pick?.id ?? null,
                              });
                            }}
                          />
                          <span className="min-w-0">
                            <span className="block text-[14px] font-semibold text-slate-900">{t("savedAddress")}</span>
                            <span className="mt-0.5 block text-[12px] leading-snug text-slate-500">{t("savedAddressHint")}</span>
                          </span>
                        </label>
                        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
                          <input
                            type="radio"
                            name="deliveryMode"
                            className="mt-1"
                            checked={deliveryMode === "manual"}
                            onChange={() => {
                              setDeliveryMode("manual");
                              setSelectedAddressId(null);
                              trackShippingSelected({ buyer_country: buyerCountry, delivery_mode: "manual" });
                            }}
                          />
                          <span className="min-w-0">
                            <span className="block text-[14px] font-semibold text-slate-900">{t("newAddressForOrder")}</span>
                            <span className="mt-0.5 block text-[12px] leading-snug text-slate-500">{t("manualAddressHint")}</span>
                          </span>
                        </label>
                      </div>

                      {deliveryMode === "saved" ? (
                        <div className="space-y-2">
                          {savedAddresses.map((a) => (
                            <label
                              key={a.id}
                              className={`flex cursor-pointer gap-3 rounded-xl border px-3 py-3 text-[13px] shadow-sm ${
                                selectedAddressId === a.id
                                  ? "border-[#2D6BFF]/50 bg-[#2D6BFF]/[0.06]"
                                  : "border-slate-200 bg-white"
                              }`}
                            >
                              <input
                                type="radio"
                                name="savedAddress"
                                className="mt-1"
                                checked={selectedAddressId === a.id}
                                onChange={() => {
                                  setSelectedAddressId(a.id);
                                  const f = customerAddressToCheckoutShipping(a);
                                  trackShippingSelected({
                                    buyer_country: f.buyerCountry,
                                    delivery_mode: "saved",
                                    saved_address_id: a.id,
                                  });
                                }}
                              />
                              <span className="min-w-0">
                                <span className="flex flex-wrap items-center gap-2">
                                  <span className="font-semibold text-slate-900">{a.fullName}</span>
                                  {a.isDefault ? (
                                    <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                                      {tCommon("default")}
                                    </span>
                                  ) : null}
                                </span>
                                <span className="mt-1 block text-[12px] leading-snug text-slate-600">
                                  {[a.addressLine1, a.city, a.country].filter(Boolean).join(" · ")}
                                </span>
                              </span>
                            </label>
                          ))}
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <p className="text-[13px] leading-relaxed text-slate-600">{t("noSavedAddresses")}</p>
                  )}
                </div>
              ) : null}

              <form
                className="space-y-8 px-5 py-6 sm:px-6 sm:py-8"
                onSubmit={(e) => {
                  e.preventDefault();
                  submit();
                }}
              >
                <section>
                  <SectionTitle
                    eyebrow={t("stepContact")}
                    title={t("stepContact")}
                    subtitle={t("contactSubtitle")}
                  />
                  <div className="space-y-4">
                    <div>
                      <FieldLabel>{t("fullName")}</FieldLabel>
                      <input
                        type="text"
                        name="name"
                        autoComplete="name"
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        placeholder={t("fullNamePlaceholder")}
                        disabled={shippingLocked}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <FieldLabel>{t("mobilePhone")}</FieldLabel>
                      <input
                        type="tel"
                        name="tel"
                        autoComplete="tel"
                        inputMode="tel"
                        value={buyerPhone}
                        onChange={(e) => setBuyerPhone(e.target.value)}
                        placeholder={isMorocco ? t("phonePlaceholderMa") : t("phonePlaceholderIntl")}
                        disabled={shippingLocked}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <FieldLabel>{tAuth("email")}</FieldLabel>
                      <input
                        type="email"
                        name="email"
                        autoComplete="email"
                        value={buyerEmail}
                        onChange={(e) => setBuyerEmail(e.target.value)}
                        placeholder={t("emailPlaceholder")}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </section>

                <section>
                  <SectionTitle
                    eyebrow={t("deliveryAddress")}
                    title={t("deliveryAddress")}
                    subtitle={t("deliverySubtitle")}
                  />
                  <div className="space-y-4">
                    <div>
                      <FieldLabel>{t("countryRegion")}</FieldLabel>
                      <select
                        name="country"
                        autoComplete="country"
                        value={buyerCountry}
                        onChange={(e) => {
                          const next = e.target.value;
                          setBuyerCountry(next);
                          trackShippingSelected({ buyer_country: next, delivery_mode: deliveryMode });
                        }}
                        disabled={shippingLocked}
                        className={`${inputClass} appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-10`}
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                        }}
                      >
                        {CHECKOUT_COUNTRY_OPTIONS.map((opt) => (
                          <option key={opt.code} value={opt.code}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <FieldLabel optional>{t("city")}</FieldLabel>
                      <input
                        type="text"
                        name="city"
                        autoComplete="address-level2"
                        value={buyerCity}
                        onChange={(e) => setBuyerCity(e.target.value)}
                        placeholder={isMorocco ? t("cityPlaceholderMa") : t("cityPlaceholderIntl")}
                        disabled={shippingLocked}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <FieldLabel optional>{t("streetDetails")}</FieldLabel>
                      <textarea
                        name="street"
                        rows={3}
                        autoComplete="street-address"
                        value={buyerAddress}
                        onChange={(e) => setBuyerAddress(e.target.value)}
                        placeholder={isMorocco ? t("streetPlaceholderMa") : t("streetPlaceholderIntl")}
                        disabled={shippingLocked}
                        className={`${inputClass} min-h-[5.75rem] resize-none py-3 leading-relaxed`}
                      />
                    </div>
                    {shippingLocked ? (
                      <p className="text-[12px] leading-relaxed text-slate-500">{t("editAddressHint")}</p>
                    ) : null}
                  </div>
                </section>

                <TrustStrip />

                <motion.button
                  type="submit"
                  disabled={soldOut}
                  className="flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#2D6BFF] to-[#2557d6] text-[15px] font-semibold text-white shadow-[0_10px_32px_-10px_rgba(45,107,255,0.55)] transition-[transform,box-shadow] hover:shadow-[0_14px_40px_-10px_rgba(45,107,255,0.58)] disabled:cursor-not-allowed disabled:opacity-45"
                  whileTap={soldOut ? undefined : { scale: 0.99 }}
                >
                  <IconCreditCard className="size-5 shrink-0 text-white/95" />
                  {t("continueToPayment")}
                  <span aria-hidden className="text-lg font-normal opacity-90">
                    →
                  </span>
                </motion.button>
                <p className="text-center text-[11px] leading-relaxed text-slate-400">{t("previewNoCharge")}</p>
              </form>
            </div>
          </div>

          <ProductCheckoutOrderSummary
            displayTitle={displayTitle}
            recapColorLabel={recapColorLabel}
            recapSize={recapSize}
            kindLabel={kindLabel}
            recapQty={recapQty}
            priceLabel={priceLabel}
            productImageSrc={productImageSrc}
            deliveryHint={deliveryHint}
            footer={
              <div className="mt-3 space-y-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-[11px] leading-snug text-slate-600">
                <p>
                  <span className="font-medium text-slate-800">{t("payment")}</span>
                </p>
                <div className="flex items-center justify-between gap-2 border-t border-slate-100/80 pt-2">
                  <span className="text-slate-500">{tCommon("secure")}</span>
                  <CardBrandRow className="scale-90" />
                </div>
              </div>
            }
          />
        </div>
      </motion.main>
    </div>
  );
}
