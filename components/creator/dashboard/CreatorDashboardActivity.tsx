"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { CreatorRecentActivityItem } from "@/lib/creator/monetization-types";
import { creatorCardSurface, creatorCtaButton, creatorEyebrow, creatorSectionTitle } from "@/lib/theme/creator-accent";

function activityLabel(eventType: "click" | "order"): string {
  return eventType === "order" ? "Order attributed" : "Link click";
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Date.now() - d.getTime() < 86_400_000) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function CreatorDashboardActivity({ items }: { items: CreatorRecentActivityItem[] }) {
  const reduceMotion = useReducedMotion();

  return (
    <section className={`rounded-2xl p-5 sm:p-6 ${creatorCardSurface}`}>
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div>
          <p className={creatorEyebrow}>Feed</p>
          <h2 className={`mt-1 ${creatorSectionTitle}`}>Recent activity</h2>
        </div>
        <Link
          href="/creator/links"
          className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[12px] font-semibold text-fuchsia-300/90 transition hover:bg-white/[0.07]"
        >
          All →
        </Link>
      </div>

      {!items.length ? (
        <div className="mt-5 rounded-2xl border border-dashed border-violet-500/20 bg-violet-500/[0.04] px-6 py-14 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/25 to-fuchsia-500/15 text-violet-200 ring-1 ring-white/10">
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden>
              <path
                d="M10 13a3 3 0 100-6 3 3 0 000 6zm8 2l4 2-4 2v-4z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="mt-5 text-[16px] font-semibold text-white/85">No activity yet</p>
          <p className="mx-auto mt-2 max-w-xs text-[13px] leading-relaxed text-white/40">
            Share a promo link — clicks and orders appear here in real time.
          </p>
          <Link
            href="/creator/products"
            className={`mt-6 inline-flex min-h-10 items-center justify-center rounded-xl px-5 text-[13px] font-semibold text-white ${creatorCtaButton}`}
          >
            Browse products
          </Link>
        </div>
      ) : (
        <ul className="relative mt-2">
          <div
            aria-hidden
            className="absolute bottom-2 left-[19px] top-2 w-px bg-gradient-to-b from-violet-500/50 via-fuchsia-500/30 to-transparent"
          />
          {items.map((item, index) => (
            <motion.li
              key={item.id}
              initial={reduceMotion ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04, duration: 0.35 }}
              className="relative flex items-center gap-3 py-3.5 pl-1"
            >
              <div
                className={`relative z-[1] flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 ${
                  item.eventType === "order"
                    ? "bg-emerald-500/15 text-emerald-200 ring-emerald-400/25"
                    : "bg-violet-500/15 text-violet-200 ring-violet-400/25"
                }`}
              >
                {item.eventType === "order" ? (
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
                    <path
                      d="M6 6h15l-1.5 9h-12L6 6zm0 0L5 3H2M9 20a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
                    <path
                      d="M15 3h6v6M14 10l7-7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <div className="min-w-0 flex-1 rounded-xl border border-transparent px-2 py-1 transition-colors hover:border-white/[0.06] hover:bg-white/[0.02]">
                <p className="truncate text-[14px] font-semibold text-white/92">{item.productTitle}</p>
                <p className="mt-0.5 text-[12px] text-white/38">
                  {activityLabel(item.eventType)}
                  {item.trackingCode ? (
                    <>
                      {" · "}
                      <span className="font-mono text-white/48">{item.trackingCode}</span>
                    </>
                  ) : null}
                </p>
              </div>
              <time className="shrink-0 rounded-md bg-white/[0.04] px-2 py-1 text-[11px] font-medium tabular-nums text-white/35">
                {formatWhen(item.createdAt)}
              </time>
            </motion.li>
          ))}
        </ul>
      )}
    </section>
  );
}
