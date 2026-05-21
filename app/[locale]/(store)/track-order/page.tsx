"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import type { CustomerOrder, OrderFulfillmentStatus } from "@/lib/orders/types";
import { carrierLabel } from "@/lib/admin/shipping-carriers";
import { useOrderStatusLabels } from "@/lib/i18n/use-order-status-labels";
import { trackOrderByEmail } from "@/lib/orders/fetch-orders-client";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AuthScenery } from "@/components/auth/AuthScenery";
import { AuthTopBar } from "@/components/auth/AuthTopBar";
import { brandLogoLight } from "@/lib/site-data";
import { loginHref } from "@/lib/auth/login-href";

const ease = [0.22, 1, 0.36, 1] as const;

const cardShell =
  "relative w-full max-w-[460px] overflow-hidden rounded-[2rem] border border-white/[0.09] bg-zinc-900/35 p-[1px] shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_32px_64px_-24px_rgba(0,0,0,0.75),0_0_120px_-40px_rgba(45,107,255,0.32)] backdrop-blur-3xl";

const innerGlow =
  "pointer-events-none absolute -left-1/2 top-0 h-[340px] w-[200%] bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.12),transparent_55%)] opacity-55";

const inputWrap = "relative mt-2";

const inputClass =
  "w-full rounded-2xl border border-white/[0.1] bg-white/[0.05] py-3.5 pl-12 pr-4 text-[15px] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] outline-none transition-[border-color,box-shadow,background-color] placeholder:text-zinc-500 focus:border-[#2D6BFF]/45 focus:bg-white/[0.07] focus:ring-2 focus:ring-[#2D6BFF]/22";

function SubmitSpinner() {
  return (
    <span className="flex items-center justify-center gap-1" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-white"
          animate={{ y: [0, -5, 0], opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.12, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}

function IconTruckHero({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} width={28} height={28} aria-hidden>
      <rect x="1" y="4" width="14" height="10" rx="1.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M15 9h3.5l3.5 3.5V14H15V9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="6.5" cy="17.5" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.5" cy="17.5" r="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconHash({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} width={18} height={18} aria-hidden>
      <path
        d="M10 4L8 20M16 4l-2 16M4 10h16M2 14h16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMail({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} width={18} height={18} aria-hidden>
      <path
        d="M4 6h16v12H4V6zm0 0l8 6 8-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconLock({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} width={16} height={16} aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}


function fulfillmentStepIndex(status: OrderFulfillmentStatus): number {
  if (status === "preparing") return 1;
  if (status === "shipped") return 2;
  if (status === "delivered") return 3;
  return 0;
}

export default function TrackOrderPage() {
  const t = useTranslations("trackOrder");
  const tMenu = useTranslations("menu");
  const tFooter = useTranslations("footer");
  const tCommon = useTranslations("common");
  const { headline: fulfillmentHeadline } = useOrderStatusLabels();
  const reduceMotion = useReducedMotion();
  const searchParams = useSearchParams();

  const journeySteps = useMemo(
    () =>
      [
        { key: "ordered", label: t("stepOrdered"), desc: t("stepOrderedDesc") },
        { key: "prep", label: t("stepPreparing"), desc: t("stepPreparingDesc") },
        { key: "ship", label: t("stepShipped"), desc: t("stepShippedDesc") },
        { key: "done", label: t("stepDelivered"), desc: t("stepDeliveredDesc") },
      ] as const,
    [t],
  );
  const orderId = useId();
  const emailId = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tracked, setTracked] = useState<CustomerOrder | null>(null);
  const [defaultOrder, setDefaultOrder] = useState("");
  const [defaultEmail, setDefaultEmail] = useState("");

  const lookupOrder = useCallback(async (orderRaw: string, email: string) => {
    setError(null);
    setTracked(null);
    const result = await trackOrderByEmail(orderRaw, email);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setTracked(result.order);
  }, []);

  useEffect(() => {
    const order = searchParams.get("order")?.trim() ?? "";
    const email = searchParams.get("email")?.trim() ?? "";
    if (order) setDefaultOrder(order);
    if (email) setDefaultEmail(email);
    if (order && email.includes("@")) {
      void lookupOrder(order, email);
    }
  }, [lookupOrder, searchParams]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const order = String(fd.get("orderId") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    if (!order) {
      setError(t("errors.orderNumber"));
      return;
    }
    if (!email || !email.includes("@")) {
      setError(t("errors.email"));
      return;
    }
    setBusy(true);
    await lookupOrder(order, email);
    setBusy(false);
  }

  return (
    <AuthScenery>
      <AuthTopBar backHref="/" backLabel={t("backHome")} pill={t("trackingPill")} />

      <main className="flex min-h-dvh flex-col items-center justify-center px-[max(1rem,env(safe-area-inset-left))] pb-[max(2.5rem,env(safe-area-inset-bottom))] pr-[max(1rem,env(safe-area-inset-right))] pt-[calc(4.5rem+env(safe-area-inset-top))]">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 26, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, ease }}
          className={cardShell}
        >
          <div className={innerGlow} aria-hidden />
          <div
            className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
            aria-hidden
          />

          <div className="relative rounded-[1.94rem] bg-gradient-to-b from-zinc-900/92 to-zinc-950/96 px-7 py-9 sm:px-10 sm:py-10">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.05] px-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                <Image src={brandLogoLight} alt="Salvya" width={112} height={32} className="h-[26px] w-auto" priority />
              </div>

              <div className="mt-7 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl border border-[#2D6BFF]/35 bg-gradient-to-br from-[#2D6BFF]/25 via-indigo-500/15 to-cyan-500/10 text-[#b8c9ff] shadow-[0_12px_40px_-16px_rgba(45,107,255,0.45)]">
                <IconTruckHero className="h-8 w-8" />
              </div>

              <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.32em] text-zinc-500">{t("orderStatus")}</p>
              <h1 className="mt-2 max-w-[20rem] text-balance text-[1.9rem] font-semibold leading-[1.08] tracking-[-0.05em] text-white sm:text-[2.15rem]">
                {t("title")}
              </h1>
              <p className="mt-3 max-w-[24rem] text-[14px] leading-relaxed text-zinc-400 sm:text-[15px]">
                {t("descriptionLong")}
              </p>
            </div>

            {/* Journey preview */}
            <div className="mt-9 rounded-2xl border border-white/[0.06] bg-black/25 px-4 py-5 sm:px-5">
              <p className="mb-4 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                {tracked ? t("journeyYours") : t("journeyTypical")}
              </p>
              <div className="relative flex justify-between gap-1">
                <div
                  className="absolute left-[12%] right-[12%] top-[11px] h-[2px] rounded-full bg-gradient-to-r from-white/10 via-white/20 to-white/10"
                  aria-hidden
                />
                {journeySteps.map((step, i) => {
                  const activeIdx = tracked ? fulfillmentStepIndex(tracked.fulfillmentStatus) : 0;
                  const active = i <= activeIdx;
                  return (
                    <div key={step.key} className="relative z-[1] flex min-w-0 flex-1 flex-col items-center text-center">
                      <span
                        className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
                          active
                            ? "border-[#2D6BFF]/50 bg-[#2D6BFF]/25 text-white shadow-[0_0_20px_-4px_rgba(45,107,255,0.5)]"
                            : "border-white/10 bg-zinc-900/80 text-zinc-500"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span className="mt-2 block text-[11px] font-semibold text-zinc-300">{step.label}</span>
                      <span className="mt-0.5 hidden text-[10px] text-zinc-500 sm:block">{step.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <form onSubmit={onSubmit} className="mt-9 space-y-5" noValidate>
              <div>
                <label htmlFor={orderId} className="text-[12px] font-semibold text-zinc-400">
                  {t("orderNumber")} <span className="text-rose-400/90">*</span>
                </label>
                <div className={inputWrap}>
                  <span className="pointer-events-none absolute left-4 top-1/2 z-[1] -translate-y-1/2 text-zinc-500">
                    <IconHash />
                  </span>
                  <input
                    id={orderId}
                    name="orderId"
                    type="text"
                    autoComplete="off"
                    placeholder={t("orderPlaceholder")}
                    defaultValue={defaultOrder}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor={emailId} className="text-[12px] font-semibold text-zinc-400">
                  {t("email")} <span className="text-rose-400/90">*</span>
                </label>
                <div className={inputWrap}>
                  <span className="pointer-events-none absolute left-4 top-1/2 z-[1] -translate-y-1/2 text-zinc-500">
                    <IconMail />
                  </span>
                  <input
                    id={emailId}
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder={t("emailPlaceholder")}
                    defaultValue={defaultEmail}
                    className={inputClass}
                  />
                </div>
              </div>

              {error ? (
                <motion.p
                  initial={reduceMotion ? false : { opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-rose-500/30 bg-rose-950/40 px-4 py-3.5 text-[13px] leading-relaxed text-rose-100/95"
                  role="alert"
                >
                  {error}
                </motion.p>
              ) : null}

              <AnimatePresence initial={false}>
                {tracked ? (
                  <motion.div
                    key="tracked"
                    role="status"
                    initial={reduceMotion ? false : { opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                    transition={{ duration: 0.32, ease }}
                    className="rounded-2xl border border-emerald-400/28 bg-gradient-to-br from-emerald-500/12 to-emerald-950/40 px-4 py-4"
                  >
                    <p className="font-mono text-[12px] font-semibold text-emerald-100/95">{tracked.orderNumber}</p>
                    <p className="mt-2 text-[13px] font-semibold text-white">{fulfillmentHeadline(tracked.fulfillmentStatus)}</p>
                    <p className="mt-2 text-[13px] leading-relaxed text-emerald-50/90">
                      {tracked.lineItem.qty}× {tracked.lineItem.displayTitle} · {tracked.lineItem.colorLabel} ·{" "}
                      {tracked.lineItem.size}
                    </p>
                    <p className="mt-1 text-[12px] text-emerald-100/70">
                      {t("placed", {
                        date: new Date(tracked.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" }),
                      })}
                    </p>
                    {tracked.shipping.trackingNumber ? (
                      <div className="mt-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-100/60">Tracking</p>
                        <p className="mt-1 font-mono text-[12px] text-white">{tracked.shipping.trackingNumber}</p>
                        {tracked.shipping.carrier ? (
                          <p className="mt-1 text-[11px] text-emerald-100/75">{carrierLabel(tracked.shipping.carrier)}</p>
                        ) : null}
                        {tracked.shipping.trackingUrl ? (
                          <a
                            href={tracked.shipping.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex text-[12px] font-semibold text-[#9eb4ff] hover:underline"
                          >
                            {t("carrierTracking")}
                          </a>
                        ) : null}
                      </div>
                    ) : null}
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={busy}
                whileTap={reduceMotion || busy ? undefined : { scale: 0.985 }}
                className="relative mt-2 flex min-h-[52px] w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-[#2D6BFF] via-[#4f7cff] to-cyan-500 text-[15px] font-semibold text-white shadow-[0_18px_44px_-14px_rgba(45,107,255,0.55),inset_0_1px_0_rgba(255,255,255,0.2)] transition-[box-shadow,opacity] hover:shadow-[0_22px_48px_-12px_rgba(45,212,191,0.25)] disabled:pointer-events-none disabled:opacity-[0.65]"
              >
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-transparent to-white/12" aria-hidden />
                <span className="relative flex items-center gap-2.5">
                  {busy && !reduceMotion ? <SubmitSpinner /> : null}
                  {busy ? t("submitting") : t("submit")}
                </span>
              </motion.button>
            </form>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-white/[0.06] pt-6 text-[12px] text-zinc-500">
              <span className="inline-flex items-center gap-2">
                <IconLock className="text-emerald-400/80" />
                {t("secureLookup")}
              </span>
            </div>

            <p className="mt-6 text-center text-[12px] leading-relaxed text-zinc-500">
              {t.rich("helpInbox", {
                signIn: (chunks) => (
                  <Link
                    href={loginHref("/track-order")}
                    prefetch={false}
                    className="font-semibold text-indigo-300/95 hover:text-indigo-200"
                  >
                    {chunks}
                  </Link>
                ),
              })}
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-[12px] font-semibold">
              <Link href="/about" prefetch={false} className="text-zinc-500 transition-colors hover:text-zinc-300">
                {tMenu("ourStory")}
              </Link>
              <span className="text-zinc-700" aria-hidden>
                ·
              </span>
              <Link href="/terms" prefetch={false} className="text-zinc-500 transition-colors hover:text-zinc-300">
                {tMenu("terms")}
              </Link>
              <span className="text-zinc-700" aria-hidden>
                ·
              </span>
              <Link href="/shipping" prefetch={false} className="text-zinc-500 transition-colors hover:text-zinc-300">
                {tFooter("shipping")}
              </Link>
              <span className="text-zinc-700" aria-hidden>
                ·
              </span>
              <Link href="/size-guide" prefetch={false} className="text-zinc-500 transition-colors hover:text-zinc-300">
                {tFooter("sizeGuide")}
              </Link>
              <span className="text-zinc-700" aria-hidden>
                ·
              </span>
              <Link href="/payment" prefetch={false} className="text-zinc-500 transition-colors hover:text-zinc-300">
                {tMenu("payment")}
              </Link>
              <span className="text-zinc-700" aria-hidden>
                ·
              </span>
              <Link href="/returns" prefetch={false} className="text-zinc-500 transition-colors hover:text-zinc-300">
                {tFooter("returns")}
              </Link>
              <span className="text-zinc-700" aria-hidden>
                ·
              </span>
              <Link href="/cookies" prefetch={false} className="text-zinc-500 transition-colors hover:text-zinc-300">
                {tMenu("cookies")}
              </Link>
              <span className="text-zinc-700" aria-hidden>
                ·
              </span>
              <Link href="/cookies/settings" prefetch={false} className="text-zinc-500 transition-colors hover:text-zinc-300">
                {tMenu("cookieSettings")}
              </Link>
              <span className="text-zinc-700" aria-hidden>
                ·
              </span>
              <Link href="/terms#recovery" prefetch={false} className="text-zinc-500 transition-colors hover:text-zinc-300">
                Account help
              </Link>
              <span className="text-zinc-700" aria-hidden>
                ·
              </span>
              <Link href="/account/profile" prefetch={false} className="text-zinc-500 transition-colors hover:text-zinc-300">
                {t("signInLink")}
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
    </AuthScenery>
  );
}
