"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { CheckoutDetailsSessionV1 } from "@/lib/checkout-preview-session";
import { formatCheckoutPaymentLine } from "@/lib/checkout-preview-session";
import { checkoutCountryLabel } from "@/lib/checkout-country";
import type { OrderPaymentStatus } from "@/lib/orders/types";
import { SalvyaErrorPage } from "@/components/errors/SalvyaErrorPage";
import { CheckoutLoadingPanel } from "@/components/shop/CheckoutLoadingPanel";
import { CheckoutStepGraphic, TrustStrip } from "@/components/shop/product-checkout-shared";
import { useTranslations } from "next-intl";
import { useCheckoutLabels } from "@/lib/i18n/use-checkout-labels";

const serif = "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export function CheckoutConfirmShell({
  returnHref,
  bag,
  children,
}: {
  returnHref: string;
  bag?: boolean;
  children: ReactNode;
}) {
  const { t } = useCheckoutLabels();

  return (
    <motion.div className="relative min-h-dvh w-full overflow-x-hidden bg-[#f4f6fb] text-slate-900">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <motion.div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.14)_1px,transparent_0)] [background-size:22px_22px] opacity-70" />
        <motion.div className="absolute -right-28 top-0 h-[26rem] w-[26rem] rounded-full bg-[#2D6BFF]/[0.08] blur-3xl" />
        <motion.div className="absolute -left-20 bottom-0 h-[20rem] w-[20rem] rounded-full bg-emerald-400/10 blur-3xl" />
      </div>

      <motion.header
        className="relative z-[1] border-b border-slate-200/80 bg-white/85 shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-xl"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
          <motion.div className="flex w-full flex-wrap items-center justify-between gap-3 sm:w-auto sm:justify-start">
            <motion.div className="flex flex-wrap items-center gap-2">
              <Link
                href={returnHref}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                <span aria-hidden className="text-[15px] leading-none text-slate-500">
                  ←
                </span>
                {bag ? t("backToBag") : t("backToProduct")}
              </Link>
              <span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-800 sm:inline-flex">
                {t("step3Confirmation")}
              </span>
            </motion.div>
            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-normal text-slate-500 sm:hidden">
              {t("stepDoneShort")}
            </span>
          </motion.div>
          <CheckoutStepGraphic activeStep={3} />
        </motion.div>
      </motion.header>

      <motion.main
        className="relative z-[1] mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 280, delay: 0.05 }}
      >
        {children}
      </motion.main>
    </motion.div>
  );
}

function ThankYouCheckmark({ reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <motion.div
      className="relative mx-auto flex h-[4.5rem] w-[4.5rem] items-center justify-center sm:h-20 sm:w-20"
      initial={reduceMotion ? false : { scale: 0.75, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", damping: 14, stiffness: 260 }}
    >
      <motion.div
        className="absolute inset-0 rounded-full bg-emerald-400/25 blur-xl"
        aria-hidden
        animate={reduceMotion ? false : { scale: [1, 1.06, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div className="relative flex h-full w-full items-center justify-center rounded-full border border-emerald-200 bg-gradient-to-b from-emerald-50 to-white shadow-[0_12px_36px_-14px_rgba(16,185,129,0.45)] ring-4 ring-emerald-500/10">
        <motion.svg viewBox="0 0 48 48" className="h-9 w-9 text-emerald-600 sm:h-10 sm:w-10" fill="none" initial="hidden" animate="visible">
          <motion.path
            d="M14 24.5l7 7 13-14"
            stroke="currentColor"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={{
              hidden: { pathLength: 0, opacity: 0 },
              visible: {
                pathLength: 1,
                opacity: 1,
                transition: { pathLength: { delay: 0.15, duration: 0.45 }, opacity: { delay: 0.15, duration: 0.15 } },
              },
            }}
          />
        </motion.svg>
      </motion.div>
    </motion.div>
  );
}

function CopyOrderButton({ orderRef }: { orderRef: string }) {
  const { tCommon } = useCheckoutLabels();
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(orderRef).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2200);
        });
      }}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
    >
      {copied ? (
        <>
          <span className="text-emerald-600" aria-hidden>
            ✓
          </span>
          {tCommon("copied")}
        </>
      ) : (
        <>
          <svg className="h-3.5 w-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.6" />
            <path d="M6 15H5a2 2 0 01-2-2V5a2 2 0 012-2h8a2 2 0 012 2v1" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          {tCommon("copy")}
        </>
      )}
    </button>
  );
}

function DeliveryTimeline({ reduceMotion }: { reduceMotion: boolean | null }) {
  const { t } = useCheckoutLabels();
  const steps = [
    { label: t("timelineConfirmed"), sub: t("timelineConfirmed"), done: true },
    { label: t("timelinePreparing"), sub: t("timelinePreparing"), done: false },
    { label: t("timelineShipped"), sub: t("timelineShipped"), done: false },
  ];
  return (
    <div className="mt-8 border-t border-slate-100 pt-6">
      <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{t("timelineWhatNext")}</p>
      <div className="relative flex justify-between gap-2">
        <div className="absolute left-[16%] right-[16%] top-4 h-px bg-slate-200" aria-hidden />
        {steps.map((s, i) => (
          <motion.div
            key={s.label}
            className="relative z-[1] flex min-w-0 flex-1 flex-col items-center text-center"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : 0.15 + i * 0.07 }}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold shadow-sm ring-4 ring-white ${
                s.done ? "bg-emerald-500 text-white" : "border border-slate-200 bg-white text-slate-400"
              }`}
            >
              {s.done ? "✓" : i + 1}
            </span>
            <p className="mt-2 text-[11px] font-semibold text-slate-900">{s.label}</p>
            <p className="mt-0.5 text-[10px] leading-snug text-slate-500">{s.sub}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function CheckoutConfirmLoading({ verifyingPayPal }: { verifyingPayPal?: boolean }) {
  const { t } = useCheckoutLabels();
  return (
    <CheckoutLoadingPanel
      verifying={verifyingPayPal}
      kicker={verifyingPayPal ? t("securingPayment") : t("placingOrder")}
      title={verifyingPayPal ? t("verifyingPayPal") : t("almostThere")}
      description={verifyingPayPal ? t("paypalVerifyNote") : t("placingOrder")}
    />
  );
}

export function CheckoutConfirmError({
  session,
  orderError,
  orderErrorCode,
  paymentHref,
  onRetry,
}: {
  session: CheckoutDetailsSessionV1;
  orderError: string;
  orderErrorCode?: string;
  paymentHref: string;
  onRetry: () => void;
}) {
  const { t, tCommon } = useCheckoutLabels();
  const paypalHint = session.paymentMethod === "paypal" ? t("paypalVerifyNote") : undefined;

  return (
    <SalvyaErrorPage
      embedded
      variant="checkout"
      code={session.paymentMethod === "paypal" ? "PayPal" : tCommon("brand")}
      title={session.paymentMethod === "paypal" ? t("paymentVerifyFailed") : t("confirmFailed")}
      description={orderError}
      hint={paypalHint}
      onRetry={onRetry}
      extraActions={
        <>
          <Link
            href={paymentHref}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/[0.14] bg-white/[0.08] px-5 text-[13px] font-semibold text-white/90 hover:bg-white/[0.12]"
          >
            {t("backToPayment")}
          </Link>
          {orderErrorCode === "duplicate_payment" ? (
            <Link
              href="/track-order"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/[0.1] px-5 text-[13px] font-semibold text-white/70 hover:text-white"
            >
              {t("trackYourOrder")}
            </Link>
          ) : null}
        </>
      }
    />
  );
}

export function CheckoutConfirmSuccess({
  reduceMotion,
  greet,
  artistName,
  paymentNote,
  orderRef,
  session,
  displayTitle,
  recapLine,
  priceLabel,
  productKind,
  productImageSrc,
  trackHref,
  returnHref,
  detailsHref,
  bag,
}: {
  reduceMotion: boolean | null;
  greet: string;
  artistName: string;
  paymentNote: string;
  orderRef: string;
  session: CheckoutDetailsSessionV1;
  displayTitle: string;
  recapLine: string;
  priceLabel: string;
  productKind: "hoodie" | "tshirt";
  productImageSrc: string;
  trackHref: string;
  returnHref: string;
  detailsHref: string;
  bag?: boolean;
}) {
  const { t, tProduct } = useCheckoutLabels();
  const tTrack = useTranslations("trackOrder");

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start xl:grid-cols-[minmax(0,1fr)_21rem]">
      <motion.div
        className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_24px_60px_-28px_rgba(15,23,42,0.18)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-[#2D6BFF] to-emerald-400" aria-hidden />
        <div className="border-b border-slate-100 bg-gradient-to-b from-emerald-50/80 to-white px-5 py-8 text-center sm:px-8 sm:py-10">
          <ThankYouCheckmark reduceMotion={reduceMotion} />
          <motion.div
            className="mt-6"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
            initial="hidden"
            animate="show"
          >
            <motion.p
              className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700"
              variants={fadeUp}
              transition={{ duration: 0.4 }}
            >
              {t("orderConfirmed")}
            </motion.p>
            <motion.h1
              className="mt-2 text-[1.75rem] font-semibold leading-[1.15] tracking-tight text-slate-900 sm:text-[2.15rem]"
              style={{ fontFamily: serif }}
              variants={fadeUp}
              transition={{ duration: 0.4 }}
            >
              {greet === "there" ? t("allSet") : `${t("allSet").replace(/\.$/, "")}, ${greet}.`}
            </motion.h1>
            <motion.p className="mx-auto mt-4 max-w-md text-[14px] leading-relaxed text-slate-600 sm:text-[15px]" variants={fadeUp}>
              {t("thankYouEmail", { artist: artistName, email: session.buyerEmail })}
            </motion.p>
          </motion.div>
        </div>

        <div className="px-5 py-6 sm:px-8 sm:py-7">
          <DeliveryTimeline reduceMotion={reduceMotion} />

          <motion.div
            className="mt-8 flex flex-col gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Link
              href={trackHref}
              className="inline-flex min-h-[52px] flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-[#2D6BFF] to-[#2557d6] text-[15px] font-semibold text-white shadow-[0_10px_32px_-10px_rgba(45,107,255,0.55)] transition-transform hover:brightness-105 active:scale-[0.99] sm:flex-[1.2]"
            >
              {t("trackYourOrder")}
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-[52px] flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white text-[15px] font-semibold text-slate-800 shadow-sm hover:bg-slate-50 active:scale-[0.99]"
            >
              {t("backHome")}
            </Link>
          </motion.div>

          <p className="mt-6 text-center text-[12px] text-slate-500">
            {t("editShipping")}{" "}
            <Link href={detailsHref} className="font-medium text-[#2D6BFF] underline decoration-[#2D6BFF]/25 underline-offset-2">
              {t("editInformation")}
            </Link>
          </p>
        </div>
        <TrustStrip />
      </motion.div>

      <motion.aside
        className="lg:sticky lg:top-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.45 }}
      >
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06),0_16px_48px_-24px_rgba(15,23,42,0.14)]">
          <motion.div className="border-b border-slate-100 bg-slate-50/90 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">{t("receiptTitle")}</p>
          </motion.div>
          <div className="p-4 sm:p-5">
            <div className="flex gap-3">
              <div className="relative h-[5.25rem] w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm">
                {productImageSrc ? (
                  <Image src={productImageSrc} alt={displayTitle} fill className="object-cover object-center" sizes="64px" unoptimized />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] text-slate-400">{t("noImage")}</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="inline-flex rounded-full bg-slate-900 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                  {productKind === "hoodie" ? tProduct("hoodie") : tProduct("tshirt")}
                </span>
                <p className="mt-1.5 line-clamp-2 text-[14px] font-semibold leading-snug text-slate-900">{displayTitle}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-slate-500">{recapLine}</p>
              </div>
            </div>

            <dl className="mt-5 space-y-2.5 border-t border-slate-100 pt-4 text-[12px]">
              <motion.div className="flex justify-between gap-3">
                <dt className="text-slate-500">{t("recapShipTo")}</dt>
                <dd className="text-right font-medium text-slate-900">{checkoutCountryLabel(session.buyerCountry)}</dd>
              </motion.div>
              <motion.div className="flex justify-between gap-3">
                <dt className="text-slate-500">{t("payment")}</dt>
                <dd className="text-right font-medium text-slate-900">{formatCheckoutPaymentLine(session)}</dd>
              </motion.div>
              <motion.div className="flex justify-between gap-3 border-t border-dashed border-slate-100 pt-2.5">
                <dt className="font-medium text-slate-700">{t("total")}</dt>
                <dd className="font-semibold tabular-nums text-slate-900">{priceLabel}</dd>
              </motion.div>
            </dl>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">{tTrack("orderNumber")}</p>
              <motion.div className="mt-2 flex items-center justify-between gap-2">
                <span className="font-mono text-[13px] font-semibold text-slate-900">{orderRef}</span>
                <CopyOrderButton orderRef={orderRef} />
              </motion.div>
              <p className="mt-3 text-[11px] leading-relaxed text-slate-600">{paymentNote}</p>
            </div>

            <Link
              href={returnHref}
              className="mt-4 flex min-h-[44px] w-full items-center justify-center rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              {bag ? t("continueShopping") : t("viewProductAgain")}
            </Link>
          </div>
        </div>
      </motion.aside>
    </div>
  );
}
