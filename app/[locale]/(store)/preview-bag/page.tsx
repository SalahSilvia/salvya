"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { useBag } from "@/components/cart/BagProvider";
import { IconCreditCard } from "@/components/shop/product-dock-icons";
import { productPageHrefForLine } from "@/lib/cart/line-id";
import { startBagCheckout } from "@/lib/cart/bag-checkout-queue";
import { artists } from "@/lib/site-data";

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden width={18} height={18}>
      <path
        d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 002 1.75h6a2 2 0 002-1.75l1-12M9 7V5.75A1.75 1.75 0 0110.75 4h2.5A1.75 1.75 0 0115 5.75V7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BagIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden>
      <defs>
        <linearGradient id="pb-bag-grad" x1="24" y1="28" x2="96" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2D6BFF" stopOpacity="0.35" />
          <stop offset="1" stopColor="#6366f1" stopOpacity="0.12" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="52" fill="url(#pb-bag-grad)" />
      <path
        d="M44 48V42a16 16 0 0132 0v6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="text-white/25"
      />
      <path
        d="M34 48h52l-4 48a6 6 0 01-6 5.5H44a6 6 0 01-6-5.5L34 48z"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinejoin="round"
        className="text-white/20"
      />
    </svg>
  );
}

function Chip({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium tabular-nums text-white/65">
      {children}
    </span>
  );
}

const listParentStatic = { hidden: { opacity: 1 }, show: { opacity: 1, transition: { duration: 0 } } };
const listItemStatic = {
  hidden: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0, transition: { duration: 0 } },
};

const listParentAnimated = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

const listItemAnimated = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 420, damping: 32 } },
};

export default function PreviewBagPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { lines, totalQty, isSignedIn, synced, removeLine, updateLineQty, clearBag } = useBag();

  const startCheckout = useCallback(() => {
    const href = startBagCheckout(lines);
    if (href) router.push(href);
  }, [lines, router]);

  const featuredShop = useMemo(
    () => artists.find((a) => a.statusTag !== "COMING SOON"),
    [],
  );

  const total = totalQty;
  const lineCount = lines.length;

  const bagBadge = isSignedIn
    ? synced
      ? "Your bag · synced"
      : "Your bag"
    : "Your bag";

  const bagIntro = isSignedIn
    ? synced
      ? "Lines you added from product pages — saved to your Salvya account and this device. Open checkout when you are ready; nothing is reserved until you finish a flow."
      : "Lines you added from product pages — saved on this device. Sign in with cloud sync enabled to keep your bag across devices."
    : "Lines you added from product pages. Sign in to save your bag to your Salvya account and use it on any device.";

  const parentVariants = reduceMotion ? listParentStatic : listParentAnimated;
  const itemVariants = reduceMotion ? listItemStatic : listItemAnimated;

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-[#050508] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-[25%] top-0 h-[min(28rem,90vw)] w-[min(28rem,90vw)] rounded-full bg-[#2D6BFF]/[0.18] blur-[100px]" />
        <div className="absolute -right-[20%] top-[35%] h-[min(24rem,80vw)] w-[min(24rem,80vw)] rounded-full bg-violet-600/[0.14] blur-[90px]" />
        <div className="absolute bottom-0 left-1/2 h-[min(20rem,70vw)] w-[min(20rem,70vw)] -translate-x-1/2 translate-y-1/3 rounded-full bg-emerald-500/[0.08] blur-[80px]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,8,0)_0%,#050508_55%,#050508_100%)]" />
      </div>

      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#050508]/75 pt-[env(safe-area-inset-top)] backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-14 max-w-xl items-center justify-between gap-3 px-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
          <Link
            href="/"
            className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-[13px] font-medium text-white/80 transition-colors hover:border-white/[0.14] hover:bg-white/[0.07] hover:text-white"
          >
            <span className="text-[15px] leading-none opacity-80" aria-hidden>
              ←
            </span>
            Home
          </Link>
          <span className="rounded-full border border-[#2D6BFF]/25 bg-[#2D6BFF]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#b8c9ff]">
            {bagBadge}
          </span>
        </div>
      </header>

      <main
        className={`relative z-[1] mx-auto max-w-xl px-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-8 sm:pt-10 ${
          lines.length > 0 ? "pb-[calc(7.5rem+env(safe-area-inset-bottom))]" : "pb-28"
        }`}
      >
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-[1.65rem] font-semibold leading-tight tracking-[-0.04em] sm:text-[1.85rem]">Your bag</h1>
          <p className="mt-2 max-w-md text-[14px] leading-relaxed text-white/48">{bagIntro}</p>
        </motion.div>

        {lines.length === 0 ? (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12 overflow-hidden rounded-[1.35rem] border border-white/[0.09] bg-gradient-to-b from-white/[0.07] via-white/[0.02] to-transparent p-8 text-center shadow-[0_24px_64px_-32px_rgba(0,0,0,0.85)] sm:p-10"
          >
            <div className="mx-auto mb-5 w-[7.5rem] text-white/30">
              <BagIllustration className="h-full w-full" />
            </div>
            <p className="text-[16px] font-semibold text-white/88">Nothing in your bag yet</p>
            <p className="mx-auto mt-2 max-w-[22rem] text-[13px] leading-relaxed text-white/42">
              On any piece, pick size and color, tap <span className="font-medium text-white/65">Add this variant</span>,
              then add another size or color before checkout.
            </p>
            <div className="mt-8 flex flex-col items-stretch gap-2.5 sm:flex-row sm:justify-center">
              <Link
                href="/"
                className="inline-flex min-h-[46px] items-center justify-center rounded-xl bg-[#2D6BFF] px-5 text-[14px] font-semibold text-white shadow-[0_12px_36px_-14px_rgba(45,107,255,0.55)] transition-[transform,box-shadow] hover:shadow-[0_16px_40px_-12px_rgba(45,107,255,0.6)] active:scale-[0.99]"
              >
                Browse Salvya
              </Link>
              {featuredShop ? (
                <Link
                  href={`/artist/${featuredShop.slug}`}
                  prefetch={false}
                  className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.04] px-5 text-[14px] font-semibold text-white/80 transition-colors hover:border-white/[0.18] hover:bg-white/[0.07] hover:text-white"
                >
                  {featuredShop.name} shop
                </Link>
              ) : null}
            </div>
          </motion.div>
        ) : (
          <>
            <div className="mt-8 flex flex-wrap items-end justify-between gap-3 border-b border-white/[0.06] pb-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-white/38">Summary</p>
                <p className="mt-1 text-[15px] font-medium tabular-nums text-white/85">
                  {lineCount} {lineCount === 1 ? "line" : "lines"} · {total} {total === 1 ? "piece" : "pieces"}
                </p>
              </div>
              {lineCount > 1 ? (
                <button
                  type="button"
                  onClick={() => clearBag()}
                  className="text-[12px] font-semibold text-white/40 underline-offset-4 transition-colors hover:text-rose-300/90 hover:underline"
                >
                  Clear all
                </button>
              ) : null}
            </div>

            <motion.ul
              className="mt-5 space-y-4"
              variants={parentVariants}
              initial="hidden"
              animate="show"
            >
              {lines.map((line) => (
                <motion.li
                  key={line.lineId}
                  variants={itemVariants}
                  className="group relative overflow-hidden rounded-[1.25rem] border border-white/[0.1] bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent shadow-[0_20px_50px_-28px_rgba(0,0,0,0.88)]"
                >
                  <div
                    className="pointer-events-none absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[#2D6BFF] via-[#5b8cff] to-[#1d4ed8] opacity-90"
                    aria-hidden
                  />
                  <div className="relative pl-5 pr-4 pt-4 pb-4 sm:pl-6 sm:pr-5 sm:pt-5 sm:pb-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="pr-2 text-[16px] font-semibold leading-snug tracking-[-0.02em] text-white/92">
                          {line.displayTitle}
                        </p>
                        <p className="mt-1.5 text-[12px] text-white/42">
                          {line.artistName}
                          <span className="text-white/25"> · </span>
                          {line.productKind === "tshirt" ? "T-shirt" : "Hoodie"}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Chip>{line.colorLabel}</Chip>
                          <Chip>{`Size ${line.size}`}</Chip>
                          <div className="inline-flex items-center gap-1 rounded-lg border border-white/[0.1] bg-black/30 px-1">
                            <button
                              type="button"
                              onClick={() => updateLineQty(line.lineId, line.qty - 1)}
                              disabled={line.qty <= 1}
                              className="flex h-7 w-7 items-center justify-center rounded-md text-white/60 hover:bg-white/10 disabled:opacity-30"
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>
                            <span className="min-w-[1.25rem] text-center text-[12px] font-semibold tabular-nums text-white">
                              {line.qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateLineQty(line.lineId, line.qty + 1)}
                              disabled={line.qty >= 5}
                              className="flex h-7 w-7 items-center justify-center rounded-md text-white/60 hover:bg-white/10 disabled:opacity-30"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        {line.giftNote ? (
                          <div className="mt-3 rounded-xl border border-[#2D6BFF]/22 bg-gradient-to-br from-[#2D6BFF]/12 to-[#0a0a10] px-3 py-2.5">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9eb4ff]">Gift message</p>
                            <p className="mt-1 line-clamp-3 text-[12px] leading-relaxed text-white/82">{line.giftNote}</p>
                          </div>
                        ) : null}
                        <p className="mt-3 text-[14px] font-semibold tabular-nums text-white/75">{line.priceLabel}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLine(line.lineId)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-black/25 text-white/45 transition-colors hover:border-rose-400/30 hover:bg-rose-500/15 hover:text-rose-200/95"
                        aria-label={`Remove ${line.displayTitle} from bag`}
                      >
                        <TrashIcon />
                      </button>
                    </div>

                    <div className="mt-4">
                      <Link
                        href={productPageHrefForLine(line)}
                        prefetch={false}
                        className="inline-flex min-h-[42px] w-full items-center justify-center rounded-xl border border-dashed border-[#2D6BFF]/35 bg-[#2D6BFF]/8 px-4 text-[13px] font-semibold text-[#c5d4ff] transition-colors hover:border-[#2D6BFF]/50 hover:bg-[#2D6BFF]/14"
                      >
                        + Another size or color
                      </Link>
                    </div>
                  </div>
                </motion.li>
              ))}
            </motion.ul>

            <p className="mt-8 text-center text-[12px] leading-relaxed text-white/36" aria-live="polite">
              {bagBadge} · {lineCount} {lineCount === 1 ? "variant" : "variants"} · {total}{" "}
              {total === 1 ? "piece" : "pieces"}
              {lineCount > 1 ? " · One checkout walks through each variant in order." : null}
            </p>
          </>
        )}

        <p className="mt-12 border-t border-white/[0.06] pt-8 text-center text-[12px] text-white/32">
          <Link href="/" className="font-medium text-[#8fa8e8] underline-offset-4 transition-colors hover:text-[#b8c9ff] hover:underline">
            Salvya home
          </Link>
        </p>
      </main>

      {lines.length > 0 ? (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed left-0 right-0 z-[115] border-t border-white/[0.1] bg-[#0c0c10]/95 px-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_-12px_rgba(0,0,0,0.75)] backdrop-blur-xl supports-[backdrop-filter]:bg-[#0c0c10]/88 max-md:bottom-[calc(6.25rem+env(safe-area-inset-bottom))] md:bottom-0"
        >
          <div className="mx-auto flex max-w-xl flex-col gap-2">
            <button
              type="button"
              onClick={startCheckout}
              className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-[#2D6BFF] text-[15px] font-semibold text-white shadow-[0_10px_32px_-12px_rgba(45,107,255,0.55)] transition-[transform,box-shadow] active:scale-[0.99] hover:shadow-[0_14px_36px_-10px_rgba(45,107,255,0.62)]"
            >
              <IconCreditCard className="size-5 shrink-0" />
              Checkout · {lineCount} {lineCount === 1 ? "variant" : "variants"}
            </button>
            <p className="text-center text-[11px] leading-relaxed text-white/38">
              Secure Salvya checkout for everything in your bag.
            </p>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}
