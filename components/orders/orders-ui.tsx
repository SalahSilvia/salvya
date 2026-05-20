"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { fulfillmentStatusLabel } from "@/lib/orders/display";
import type { OrderFulfillmentStatus } from "@/lib/orders/types";

export const ORDERS_EASE = [0.22, 1, 0.36, 1] as const;

export function OrdersAmbient() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute -right-[8%] top-[-5%] h-[min(20rem,60vw)] w-[min(20rem,60vw)] rounded-full bg-[#2D6BFF]/[0.14] blur-[90px]" />
      <div className="absolute -left-[20%] bottom-[15%] h-[min(14rem,45vw)] w-[min(14rem,45vw)] rounded-full bg-indigo-500/[0.08] blur-[80px]" />
      <div className="grain-overlay absolute inset-0 opacity-[0.04]" />
    </div>
  );
}

export function OrdersPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#050508] text-white">
      <OrdersAmbient />
      {children}
    </div>
  );
}

export function OrdersStickyHeader({ children }: { children: ReactNode }) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#050508]/90 px-5 pb-4 pt-[max(1.1rem,env(safe-area-inset-top))] backdrop-blur-2xl backdrop-saturate-150 sm:px-6">
      {children}
    </header>
  );
}

export function OrdersHero({
  title,
  subtitle,
  kicker = "Account",
}: {
  title: string;
  subtitle: string;
  kicker?: string;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className="relative overflow-hidden rounded-[1.25rem] border border-white/[0.1] bg-gradient-to-br from-[#2D6BFF]/[0.22] via-[#0c0c14]/90 to-[#050508] p-[1px] shadow-[inset_0_1px_0_rgba(255,255,255,0.09),0_20px_50px_-30px_rgba(45,107,255,0.35)]"
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: ORDERS_EASE }}
    >
      <div className="relative rounded-[1.2rem] bg-[#0a0a10]/80 px-4 py-4 backdrop-blur-sm sm:px-5 sm:py-5">
        <div className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-[#2D6BFF]/25 blur-2xl" aria-hidden />
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9eb6ff]/90">{kicker}</p>
          <h1 className="mt-1.5 text-[clamp(1.45rem,5vw,1.65rem)] font-semibold leading-[1.08] tracking-[-0.045em] text-white">
            {title}
          </h1>
          <p className="mt-2 max-w-[18rem] text-[13px] leading-relaxed text-white/48">{subtitle}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function OrdersSegmentedControl<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string; count?: number }[];
}) {
  return (
    <div
      className="mt-4 flex gap-1 rounded-[1.1rem] border border-white/[0.08] bg-white/[0.03] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
      role="tablist"
    >
      {options.map((opt) => {
        const selected = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(opt.id)}
            className={`relative min-h-[44px] flex-1 rounded-[0.85rem] text-[13px] font-semibold tracking-[-0.01em] transition-all duration-200 ${
              selected
                ? "bg-white text-slate-900 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.35)]"
                : "text-white/48 hover:text-white/72"
            }`}
          >
            {opt.label}
            {opt.count !== undefined && opt.count > 0 ? (
              <span
                className={`ml-1.5 inline-flex min-h-[1.1rem] min-w-[1.1rem] items-center justify-center rounded-md px-1 text-[10px] font-bold tabular-nums ${
                  selected ? "bg-slate-100 text-slate-600" : "bg-white/[0.08] text-white/50"
                }`}
              >
                {opt.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

const JOURNEY = ["Ordered", "Prep", "Shipped", "Delivered"] as const;

function journeyIndex(status: OrderFulfillmentStatus): number {
  if (status === "preparing") return 1;
  if (status === "shipped") return 2;
  if (status === "delivered") return 3;
  return 0;
}

export function OrderJourneyBar({
  status,
  variant = "dark",
}: {
  status: OrderFulfillmentStatus;
  variant?: "light" | "dark";
}) {
  const current = journeyIndex(status);
  const light = variant === "light";
  return (
    <div className="mt-3.5 flex items-center gap-1" aria-label={`Progress: ${fulfillmentStatusLabel(status)}`}>
      {JOURNEY.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
            <div className="relative flex w-full max-w-[2.75rem] items-center justify-center">
              <span
                className={`h-[3px] w-full rounded-full ${
                  done || active
                    ? light
                      ? "bg-[#2D6BFF]"
                      : "bg-[#2D6BFF]/90"
                    : light
                      ? "bg-slate-200"
                      : "bg-white/[0.1]"
                }`}
              />
              {active ? (
                <span
                  className={`absolute h-2 w-2 rounded-full ${light ? "bg-[#2D6BFF] ring-2 ring-white" : "bg-[#5b8fff] ring-2 ring-[#0a0a10]"}`}
                />
              ) : null}
            </div>
            <span
              className={`truncate text-[8px] font-semibold uppercase tracking-wide ${
                active
                  ? light
                    ? "text-[#2D6BFF]"
                    : "text-[#8fa8e8]"
                  : done
                    ? light
                      ? "text-slate-400"
                      : "text-white/35"
                    : light
                      ? "text-slate-300"
                      : "text-white/22"
              }`}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function PackageThumb({
  src,
  variant = "dark",
  size = "md",
}: {
  src?: string;
  variant?: "light" | "dark";
  size?: "md" | "lg";
}) {
  const dim = size === "lg" ? "h-16 w-16" : "h-[3.5rem] w-[3.5rem]";
  return (
    <div
      className={`relative ${dim} shrink-0 overflow-hidden rounded-[0.85rem] border ${
        variant === "light" ? "border-slate-200/90 bg-slate-50" : "border-white/[0.1] bg-white/[0.04]"
      }`}
    >
      {src ? (
        <Image src={src} alt="" fill className="object-cover" sizes="64px" unoptimized />
      ) : (
        <span
          className={`flex h-full w-full items-center justify-center ${
            variant === "light" ? "text-slate-300" : "text-white/20"
          }`}
        >
          <PackageIcon className={size === "lg" ? "h-7 w-7" : "h-6 w-6"} />
        </span>
      )}
    </div>
  );
}

export function PackageIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M3 8.5 12 4l9 4.5-9 4.5ZM12 13v7M3 8.5V16l9 5 9-5V8.5"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PaymentBadge({
  method,
  variant = "dark",
}: {
  method: "cod" | "paypal";
  variant?: "light" | "dark";
}) {
  const label = method === "cod" ? "COD" : "PayPal";
  return (
    <span
      className={`shrink-0 rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] ${
        variant === "light"
          ? method === "cod"
            ? "bg-amber-50 text-amber-800 ring-1 ring-amber-200/80"
            : "bg-sky-50 text-sky-800 ring-1 ring-sky-200/80"
          : method === "cod"
            ? "bg-amber-500/15 text-amber-200/90 ring-1 ring-amber-400/20"
            : "bg-sky-500/15 text-sky-200/90 ring-1 ring-sky-400/20"
      }`}
    >
      {label}
    </span>
  );
}

export function OrdersCard({
  children,
  variant = "elevated",
  className = "",
}: {
  children: ReactNode;
  variant?: "elevated" | "glass" | "invoice";
  className?: string;
}) {
  const base =
    variant === "invoice"
      ? "overflow-hidden rounded-[1.15rem] border border-slate-200/95 bg-white text-slate-900 shadow-[0_12px_40px_-16px_rgba(15,23,42,0.2)]"
      : variant === "elevated"
        ? "rounded-[1.15rem] border border-white/[0.09] bg-gradient-to-br from-white/[0.07] to-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
        : "rounded-[1.15rem] border border-white/[0.08] bg-white/[0.04]";
  return <section className={`${base} ${className}`}>{children}</section>;
}

export function OrdersSectionLabel({ children }: { children: ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/38">{children}</p>;
}

export function OrdersEmpty({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <OrdersCard variant="glass" className="px-6 py-14 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.05] text-white/35">
        <PackageIcon className="h-7 w-7" />
      </span>
      <p className="mt-5 text-[17px] font-semibold tracking-[-0.02em] text-white/88">{title}</p>
      <p className="mx-auto mt-2 max-w-[17rem] text-[13px] leading-relaxed text-white/40">{description}</p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-8 inline-flex min-h-[48px] items-center justify-center rounded-xl bg-gradient-to-r from-[#2D6BFF] to-[#2557d6] px-7 text-[14px] font-semibold text-white shadow-[0_14px_36px_-14px_rgba(45,107,255,0.55)] transition-transform active:scale-[0.99]"
        >
          {actionLabel}
        </Link>
      ) : null}
    </OrdersCard>
  );
}

export function OrdersSkeletonList({ rows = 3 }: { rows?: number }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-3 p-0">
      {Array.from({ length: rows }, (_, i) => (
        <li
          key={i}
          className="h-[7.25rem] animate-pulse rounded-[1.15rem] border border-white/[0.06] bg-gradient-to-r from-white/[0.05] via-white/[0.03] to-white/[0.05]"
        />
      ))}
    </ul>
  );
}

export function ChevronRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function OrdersErrorBanner({ message }: { message: string }) {
  return (
    <p className="rounded-[1rem] border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-[14px] leading-relaxed text-rose-100">
      {message}
    </p>
  );
}

export function OrdersPolicyFootnote() {
  return (
    <OrdersCard variant="glass" className="px-4 py-3.5 text-[11px] leading-relaxed text-white/35">
      <p className="font-semibold text-white/50">Cancellation policy</p>
      <p className="mt-1.5">
        International PayPal: within 24h before production. Morocco COD: anytime before delivery. No online refund after
        delivery —{" "}
        <Link href="/returns" className="font-semibold text-[#8fa8e8] hover:text-[#b8c9ff]">
          Morocco returns
        </Link>
        .
      </p>
    </OrdersCard>
  );
}
