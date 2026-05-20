"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { ArtistStatusTag } from "@/lib/site-data";
import { IconCreditCard, IconShoppingBag } from "@/components/shop/product-dock-icons";
import { useBag } from "@/components/cart/BagProvider";
import { ProductBagSelections } from "@/components/shop/ProductBagSelections";
import { cartLinesForProduct } from "@/lib/cart/product-bag";
import { CART_MAX_QTY_PER_LINE } from "@/lib/cart/types";
import { trackAddToCart } from "@/lib/analytics/meta-pixel";
import { getAnalyticsTracker } from "@/lib/analytics/tracker";
import { makeProductId } from "@/lib/member/likes-storage";
import { ProductReviewsSection } from "@/components/shop/ProductReviewsSection";

const SIZES = ["XS", "S", "M", "L", "XL", "2XL"] as const;
const MAX_QTY = CART_MAX_QTY_PER_LINE;

const COLORS = [
  { id: "ink", label: "Ink", swatch: "bg-zinc-800 ring-1 ring-white/10", inStock: true },
  { id: "bone", label: "Bone", swatch: "bg-stone-300 ring-1 ring-black/10", inStock: false },
  { id: "twilight", label: "Twilight", swatch: "bg-[#2a3f8c] ring-1 ring-white/15", inStock: false },
] as const;

const GIFT_NOTE_MAX = 280;

function GiftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 8v13M8.5 8C7 8 5.5 6.8 5.5 5.2 5.5 3.9 6.6 3 8 3c1.1 0 2 .6 2.5 1.5.5-.9 1.4-1.5 2.5-1.5 1.4 0 2.5 1 2.5 2.2C15.5 6.8 14 8 12.5 8H8.5z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 8h16v4H4V8z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M12 8v13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

const GIFT_STARTERS = ["Happy birthday —", "Congrats on the drop —", "From all of us —"] as const;

function GiftFeature({ icon, title, detail }: { icon: ReactNode; title: string; detail: string }) {
  return (
    <div className="flex gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-[#2D6BFF]/12 text-[#9eb4ff]">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[12px] font-semibold text-white/88">{title}</p>
        <p className="mt-0.5 text-[11px] leading-snug text-white/42">{detail}</p>
      </div>
    </div>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FieldLabel({ children }: { children: string }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-normal text-white/38">{children}</p>
  );
}

export type BuyPanelColorOption = {
  id: string;
  label: string;
  swatch: string;
  swatchStyle?: CSSProperties;
  inStock: boolean;
};

export type BuyPanelExtras = {
  soldOut?: boolean;
  sizeOptions?: readonly string[];
  colorOptions?: readonly BuyPanelColorOption[];
  selectedColorId?: string;
  onColorChange?: (colorId: string) => void;
  selectedSize?: string;
  onSizeChange?: (size: string) => void;
  variantId?: string;
  sizeInStock?: (size: string) => boolean;
};

type Props = {
  artistSlug: string;
  itemSlug: string;
  displayTitle: string;
  priceLabel: string;
  productKind: "hoodie" | "tshirt";
  artistStatusTag: ArtistStatusTag;
  artistName: string;
  checkoutHref: string;
  /** Inline in flow. Sticky bar sits above mobile main nav; desktop keeps inline actions. */
  actionLayout?: "inline" | "fixed-footer" | "sticky-above-nav";
  galleryHint?: ReactNode;
  /** When false, reviews render elsewhere on the PDP (e.g. below FAQ). */
  showReviews?: boolean;
} & BuyPanelExtras;

/** Mobile bottom tab bar clearance — keep in sync with GlobalMainNav mobile pad. */
const MOBILE_MAIN_NAV_CLEARANCE = "calc(5.25rem + env(safe-area-inset-bottom))";

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ProductBuyPanel({
  artistSlug,
  itemSlug,
  displayTitle,
  priceLabel,
  productKind,
  artistStatusTag,
  artistName,
  checkoutHref,
  soldOut = false,
  sizeOptions,
  colorOptions,
  selectedColorId,
  onColorChange,
  selectedSize,
  onSizeChange,
  variantId,
  sizeInStock,
  actionLayout = "inline",
  galleryHint,
  showReviews = true,
}: Props) {
  const stickyAboveNav = actionLayout === "sticky-above-nav";
  const inlineActions = actionLayout === "inline" || stickyAboveNav;
  const fixedMobileBar = actionLayout === "fixed-footer" || stickyAboveNav;
  const sizes = useMemo(
    () => (sizeOptions?.length ? [...sizeOptions] : [...SIZES]),
    [sizeOptions],
  );
  const colors = useMemo(
    () => (colorOptions?.length ? [...colorOptions] : [...COLORS]),
    [colorOptions],
  );
  const defaultSize = sizes.includes("M") ? "M" : sizes[0] ?? "M";
  const defaultColorId = colors.find((c) => c.inStock)?.id ?? colors[0]?.id ?? "ink";
  const colorControlled = selectedColorId !== undefined && onColorChange !== undefined;
  const sizeControlled = selectedSize !== undefined && onSizeChange !== undefined;

  const [internalSize, setInternalSize] = useState(defaultSize);
  const size = sizeControlled ? selectedSize : internalSize;
  const setSize = sizeControlled ? onSizeChange : setInternalSize;
  const [qty, setQty] = useState(1);
  const [internalColorId, setInternalColorId] = useState(defaultColorId);
  const colorId = colorControlled ? selectedColorId : internalColorId;
  const setColorId = colorControlled ? onColorChange : setInternalColorId;
  const [toast, setToast] = useState<string | null>(null);
  const [giftOpen, setGiftOpen] = useState(false);
  const [giftNote, setGiftNote] = useState("");
  const reduceMotion = useReducedMotion();
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifyMsg, setNotifyMsg] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);
  const { addLine, removeLine, totalQty, lines, isSignedIn, synced } = useBag();
  const pathname = usePathname() ?? "/";
  const productBagLines = useMemo(
    () => cartLinesForProduct(lines, artistSlug, itemSlug, productKind),
    [lines, artistSlug, itemSlug, productKind],
  );
  const kindLine = productKind === "hoodie" ? "Oversize hoodie block" : "Oversize tee block";
  const colorLabel = colors.find((c) => c.id === colorId)?.label ?? colorId;

  const firstInStockColorId = useMemo(
    () => colors.find((c) => c.inStock)?.id ?? colors[0]?.id ?? "ink",
    [colors],
  );

  useEffect(() => {
    if (!sizes.includes(size)) setSize(defaultSize);
  }, [size, sizes, defaultSize]);

  useEffect(() => {
    const current = colors.find((c) => c.id === colorId);
    if (current && !current.inStock) setColorId(firstInStockColorId);
  }, [colorId, colors, firstInStockColorId]);

  useEffect(() => {
    if (!justAdded) return;
    const t = window.setTimeout(() => setJustAdded(false), 2200);
    return () => window.clearTimeout(t);
  }, [justAdded]);

  const availability = useMemo(() => {
    if (soldOut) return { text: "Sold out — join the notify list below", tone: "muted" as const };
    if (artistStatusTag === "COMING SOON") return { text: "Not available yet", tone: "muted" as const };
    if (artistStatusTag === "LIMITED DROP") return { text: "Limited run — may not restock", tone: "amber" as const };
    return { text: "Ships with Salvya when checkout opens", tone: "blue" as const };
  }, [artistStatusTag, soldOut]);

  const bumpQty = useCallback((d: -1 | 1) => {
    setQty((q) => Math.min(MAX_QTY, Math.max(1, q + d)));
    setToast(null);
  }, []);

  const flash = useCallback((msg: string, ms = 4000) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), ms);
  }, []);

  const addAnotherVariant = useCallback(() => {
    setQty(1);
    setJustAdded(false);
    flash("Choose another size or color, then tap Add to bag again.");
    document.getElementById("pdp-variant-picker")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [flash]);

  const addToBag = useCallback(() => {
    const n = addLine({
      artistSlug,
      itemSlug,
      artistName,
      productKind,
      displayTitle,
      priceLabel,
      colorId,
      colorLabel,
      size,
      qty: 1,
      giftNote,
      checkoutHref,
      separateLine: true,
      ...(variantId?.trim() ? { variantId: variantId.trim() } : {}),
    });
    setQty(1);
    const contentId = makeProductId(artistSlug, productKind === "tshirt" ? "tee" : "hoodie", itemSlug);
    void trackAddToCart({
      contentId,
      contentName: displayTitle,
      priceLabel,
      quantity: qty,
    });
    getAnalyticsTracker().trackAddToCart(pathname, contentId, artistSlug, {
      qty,
      size,
      color_id: colorId,
    });
    const gift = giftNote.trim() ? " Gift note saved with this line." : "";
    const syncHint = isSignedIn
      ? synced
        ? " Synced to your account."
        : " Saved to your bag."
      : " Sign in to keep your bag across devices.";
    flash(
      `Added ${size} · ${colorLabel}.${gift} ${n} ${n === 1 ? "item" : "items"} in your bag — add another variant or open your bag.${syncHint}`,
    );
    setJustAdded(true);
  }, [
    addLine,
    artistName,
    artistSlug,
    checkoutHref,
    colorId,
    colorLabel,
    displayTitle,
    flash,
    giftNote,
    isSignedIn,
    itemSlug,
    pathname,
    priceLabel,
    productKind,
    qty,
    synced,
    size,
    variantId,
  ]);

  const checkoutUrl = useMemo(() => {
    const params = new URLSearchParams({
      qty: String(qty),
      size,
      color: colorId,
    });
    if (variantId?.trim()) params.set("variant", variantId.trim());
    return `${checkoutHref}?${params.toString()}`;
  }, [checkoutHref, colorId, qty, size, variantId]);

  const contentId = useMemo(
    () => makeProductId(artistSlug, productKind === "tshirt" ? "tee" : "hoodie", itemSlug),
    [artistSlug, productKind, itemSlug],
  );

  const submitNotify = useCallback(() => {
    const v = notifyEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      setNotifyMsg("Enter a valid email.");
      window.setTimeout(() => setNotifyMsg(null), 3000);
      return;
    }
    setNotifyMsg("You are on the preview list for this piece.");
    getAnalyticsTracker().trackNotificationSignup(pathname, contentId, artistSlug, {
      color_id: colorId,
      notify_for: "restock",
    });
    window.setTimeout(() => setNotifyMsg(null), 4000);
  }, [notifyEmail, pathname, contentId, artistSlug, colorId]);

  const availClass =
    availability.tone === "amber"
      ? "border-amber-400/25 bg-amber-500/[0.08] text-amber-100/90"
      : availability.tone === "blue"
        ? "border-[#2D6BFF]/25 bg-[#2D6BFF]/10 text-[#c5d4ff]"
        : "border-white/[0.08] bg-white/[0.04] text-white/55";

  return (
    <>
      <div className="space-y-9">
        <span
          className={`inline-flex max-w-full rounded-full border px-3.5 py-1.5 text-[11px] font-medium leading-snug sm:text-[12px] ${availClass}`}
        >
          {availability.text}
        </span>

        <div id="pdp-variant-picker" className="space-y-9 scroll-mt-28">
            <div>
              <div className="flex flex-nowrap items-center justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5">
                  <span className="shrink-0 text-[10px] font-semibold uppercase tracking-normal text-white/35">
                    Color
                  </span>
                  <div className="flex min-w-0 flex-nowrap items-center gap-1.5" role="group" aria-label="Choose color">
                    {colors.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        title={c.inStock ? c.label : `${c.label} — out of stock`}
                        disabled={!c.inStock}
                        onClick={() => {
                          if (!c.inStock) return;
                          setColorId(c.id);
                          setToast(null);
                        }}
                        className={`relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full transition-[transform,opacity,box-shadow] ${
                          !c.inStock
                            ? "cursor-not-allowed opacity-45 ring-1 ring-red-500/35"
                            : colorId === c.id
                              ? "scale-105 ring-2 ring-white/45 ring-offset-1 ring-offset-[#09090d]"
                              : "opacity-75 ring-1 ring-white/12 hover:opacity-100"
                        }`}
                        aria-pressed={colorId === c.id}
                        aria-disabled={!c.inStock}
                        aria-label={c.inStock ? c.label : `${c.label}, out of stock`}
                      >
                        <span
                          className={`size-4 rounded-full sm:size-[1.125rem] ${c.swatch}`}
                          style={"swatchStyle" in c ? c.swatchStyle : undefined}
                          aria-hidden
                        />
                        {!c.inStock ? (
                          <svg
                            className="pointer-events-none absolute inset-0 text-red-500"
                            viewBox="0 0 28 28"
                            fill="none"
                            aria-hidden
                          >
                            <line
                              x1="5"
                              y1="23"
                              x2="23"
                              y2="5"
                              stroke="currentColor"
                              strokeWidth="2.25"
                              strokeLinecap="round"
                            />
                          </svg>
                        ) : null}
                      </button>
                    ))}
                  </div>
                  <span className="hidden min-w-0 truncate text-[11px] text-white/45 sm:block">{colorLabel}</span>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-normal text-white/35">Qty</span>
                  <div className="inline-flex h-8 items-center gap-0.5 rounded-full border border-white/[0.1] bg-black/35 px-0.5 ring-1 ring-inset ring-white/[0.04]">
                    <button
                      type="button"
                      onClick={() => bumpQty(-1)}
                      disabled={qty <= 1}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-[15px] text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white disabled:opacity-25"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="min-w-[1.5rem] px-0.5 text-center text-[13px] font-semibold tabular-nums text-white">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => bumpQty(1)}
                      disabled={qty >= MAX_QTY}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-[15px] text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white disabled:opacity-25"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-white/30">Each tap adds one piece — adjust quantity in your bag.</p>
            </div>

          <div>
            <div className="mb-3 flex flex-wrap items-end justify-between gap-x-3 gap-y-2">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <FieldLabel>Size</FieldLabel>
                <Link
                  href="/size-guide"
                  prefetch={false}
                  className="text-[11px] font-semibold text-[#8fa8e8] underline decoration-[#2D6BFF]/35 underline-offset-2 transition-colors hover:text-[#b4c4f5] hover:decoration-[#5b8cff]/50"
                >
                  Size guide
                </Link>
              </div>
              <span className="pb-0.5 text-[11px] text-white/32">{kindLine}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 sm:max-w-lg" role="group" aria-label="Choose size">
              {sizes.map((s) => {
                const inStock = sizeInStock ? sizeInStock(s) : true;
                return (
                <button
                  key={s}
                  type="button"
                  disabled={!inStock}
                  onClick={() => {
                    if (!inStock) return;
                    setSize(s);
                    setToast(null);
                  }}
                  className={`flex h-11 items-center justify-center rounded-lg text-[13px] font-semibold transition-colors ${
                    !inStock
                      ? "cursor-not-allowed bg-white/[0.02] text-white/25 ring-1 ring-inset ring-white/[0.04]"
                      : size === s
                      ? "bg-[#2D6BFF] text-white shadow-[0_8px_24px_-12px_rgba(45,107,255,0.55)]"
                      : "bg-white/[0.04] text-white/55 ring-1 ring-inset ring-white/[0.06] hover:bg-white/[0.07] hover:text-white/85"
                  }`}
                  aria-pressed={size === s}
                  aria-disabled={!inStock}
                >
                  {s}
                </button>
              );
              })}
            </div>
          </div>

          <ProductBagSelections
            lines={productBagLines}
            totalBagQty={totalQty}
            onAddAnother={addAnotherVariant}
            onRemoveLine={removeLine}
          />
        </div>

          <div
            className={`relative overflow-hidden rounded-[1.25rem] border transition-[border-color,box-shadow] duration-300 ${
              giftOpen
                ? "border-[#2D6BFF]/35 shadow-[0_28px_64px_-28px_rgba(45,107,255,0.45),inset_0_1px_0_rgba(255,255,255,0.1)]"
                : "border-white/[0.1] shadow-[0_24px_56px_-32px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.07)]"
            } bg-[linear-gradient(152deg,rgba(45,107,255,0.16)_0%,rgba(14,14,20,0.98)_38%,rgba(7,7,11,1)_100%)]`}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.35]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 12% 0%, rgba(255,214,170,0.14), transparent 42%), radial-gradient(circle at 88% 18%, rgba(45,107,255,0.22), transparent 40%)",
              }}
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -right-px top-8 bottom-8 w-px bg-gradient-to-b from-transparent via-[#2D6BFF]/50 to-transparent"
              aria-hidden
            />

            <button
              type="button"
              id="gift-trigger"
              aria-expanded={giftOpen}
              aria-controls="gift-note-panel"
              onClick={() => setGiftOpen((o) => !o)}
              className="relative z-[1] flex w-full items-start gap-3.5 px-4 py-4 text-left transition-colors hover:bg-white/[0.025] sm:gap-4 sm:px-5 sm:py-5"
            >
              <span
                className={`relative flex h-[3.25rem] w-[3.25rem] shrink-0 items-center justify-center rounded-2xl border text-[#e8efff] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] transition-[border-color,transform] duration-300 ${
                  giftOpen
                    ? "scale-[1.02] border-[#5b8cff]/45 bg-gradient-to-br from-[#2D6BFF]/35 via-[#1e3a8a]/30 to-[#0f172a]/80"
                    : "border-white/[0.12] bg-gradient-to-br from-[#2D6BFF]/22 via-white/[0.04] to-black/40"
                }`}
              >
                <GiftIcon className="h-[1.35rem] w-[1.35rem]" />
                {giftNote.trim() ? (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-emerald-300/40 bg-emerald-500 text-[10px] font-bold text-white shadow-[0_0_12px_rgba(52,211,153,0.45)]">
                    ✓
                  </span>
                ) : null}
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[15px] font-semibold tracking-[-0.02em] text-white">Send as a gift</span>
                  <span className="rounded-full border border-[#2D6BFF]/30 bg-[#2D6BFF]/14 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#b8c9ff]">
                    Included
                  </span>
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-white/48">
                  Personal note on the packing slip. Prices stay hidden from the recipient.
                </p>
                {giftNote.trim() && !giftOpen ? (
                  <p className="mt-2 line-clamp-2 rounded-lg border border-white/[0.08] bg-black/30 px-2.5 py-2 text-[12px] italic leading-snug text-white/62">
                    &ldquo;{giftNote.trim()}&rdquo;
                  </p>
                ) : null}
              </div>
              <span
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-black/35 text-white/55 transition-[transform,background-color,border-color] duration-200 ${
                  giftOpen ? "rotate-180 border-[#2D6BFF]/30 bg-[#2D6BFF]/12 text-[#b8c9ff]" : ""
                }`}
                aria-hidden
              >
                <ChevronDownIcon className="h-[1.125rem] w-[1.125rem]" />
              </span>
            </button>

            <AnimatePresence initial={false}>
              {giftOpen ? (
                <motion.div
                  id="gift-note-panel"
                  key="gift-panel"
                  initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="relative z-[1] overflow-hidden"
                >
                  <div className="border-t border-white/[0.08] bg-black/20 px-4 pb-4 pt-3.5 sm:px-5 sm:pb-5">
                    <div className="mb-3 grid gap-2 sm:grid-cols-3">
                      <GiftFeature
                        icon={
                          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
                            <path
                              d="M4 10l4 4 8-8"
                              stroke="currentColor"
                              strokeWidth="1.75"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        }
                        title="Hide prices"
                        detail="Receipt totals stay off the slip."
                      />
                      <GiftFeature
                        icon={
                          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
                            <path
                              d="M10 3v14M6 7h8M6 7a2 2 0 1 0 4 0 2 2 0 1 0 4 0"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                            />
                          </svg>
                        }
                        title="Your words"
                        detail="Printed with the Salvya wrap lane."
                      />
                      <GiftFeature
                        icon={
                          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
                            <path
                              d="M3 7h14v10H3V7zM10 7V3M7 3h6"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        }
                        title="Ships to them"
                        detail="Use their address at checkout."
                      />
                    </div>

                    <div className="mb-2 flex items-end justify-between gap-2">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-normal text-white/38">
                          Gift message
                        </p>
                        <p className="mt-1 text-[12px] text-white/45">Saved with this line in your preview bag.</p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 tabular-nums text-[11px] font-medium ${
                          giftNote.length >= GIFT_NOTE_MAX - 20
                            ? "bg-amber-500/15 text-amber-100/85"
                            : "bg-white/[0.05] text-white/38"
                        }`}
                      >
                        {giftNote.length}/{GIFT_NOTE_MAX}
                      </span>
                    </div>

                    <textarea
                      rows={4}
                      value={giftNote}
                      maxLength={GIFT_NOTE_MAX}
                      onChange={(e) => setGiftNote(e.target.value.slice(0, GIFT_NOTE_MAX))}
                      placeholder="Write something they will smile at when they open the box…"
                      className="w-full resize-none rounded-xl border border-white/[0.1] bg-[#07070b]/90 px-3.5 py-3 text-[13px] leading-relaxed text-white/92 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] placeholder:text-white/28 focus:border-[#2D6BFF]/40 focus:outline-none focus:ring-2 focus:ring-[#2D6BFF]/20"
                    />

                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {GIFT_STARTERS.map((starter) => (
                        <button
                          key={starter}
                          type="button"
                          onClick={() =>
                            setGiftNote((prev) => {
                              const next = prev.trim() ? `${prev.trim()} ${starter}` : starter;
                              return next.slice(0, GIFT_NOTE_MAX);
                            })
                          }
                          className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-white/50 transition-colors hover:border-[#2D6BFF]/25 hover:bg-[#2D6BFF]/10 hover:text-[#c5d4ff]"
                        >
                          {starter.replace(/ —$/, "")}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="mt-10 space-y-5 rounded-2xl border border-white/[0.09] bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent p-5 shadow-[0_24px_48px_-28px_rgba(0,0,0,0.75)] sm:p-6">
          {toast ? (
            <p className="rounded-lg border border-white/[0.06] bg-white/[0.04] px-3 py-2.5 text-[13px] leading-relaxed text-white/80" role="status">
              {toast}
            </p>
          ) : null}

          <div className={toast ? "border-t border-white/[0.07] pt-4" : ""}>
            <p className="text-[10px] font-semibold uppercase tracking-normal text-white/35">Restock</p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="email"
                value={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.value)}
                placeholder="Email"
                autoComplete="email"
                className="min-h-[42px] flex-1 rounded-lg border border-white/[0.1] bg-black/35 px-3 text-[13px] text-white/88 placeholder:text-white/28 focus:border-[#2D6BFF]/35 focus:outline-none focus:ring-1 focus:ring-[#2D6BFF]/25"
              />
              <button
                type="button"
                onClick={submitNotify}
                className="min-h-[42px] shrink-0 rounded-lg bg-white/[0.08] px-4 text-[13px] font-semibold text-white/90 transition-colors hover:bg-white/[0.12]"
              >
                Notify
              </button>
            </div>
            {notifyMsg ? (
              <p className="mt-2 text-[12px] text-white/45" role="status">
                {notifyMsg}
              </p>
            ) : null}
          </div>

          <p className="text-[12px] leading-relaxed text-white/38">
            Secure Salvya checkout, tracked delivery, and care tags on {artistName} drops when fulfillment is live.
          </p>

          <details className="group border-t border-white/[0.07] pt-4">
            <summary className="cursor-pointer list-none text-[13px] font-medium text-white/55 [&::-webkit-details-marker]:hidden">
              Shipping, returns & care
            </summary>
            <div className="mt-3 space-y-2.5 text-[12px] leading-relaxed text-white/38">
              <p>Rates and delivery windows are confirmed at checkout.</p>
              <p>Returns follow your order email. Limited runs may differ on the live listing.</p>
              <p>Follow the garment label — this page is a visual preview.</p>
            </div>
          </details>
            {inlineActions ? (
              <div
                className={`flex-col gap-2.5 border-t border-white/[0.07] pt-5 sm:flex-row ${
                  stickyAboveNav ? "hidden md:flex" : "flex"
                }`}
              >
                <button
                  type="button"
                  onClick={addToBag}
                  disabled={soldOut}
                  className={`flex min-h-[48px] min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border text-[14px] font-semibold shadow-sm transition-[transform,background-color,border-color,color] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45 ${
                    justAdded
                      ? "border-emerald-400/35 bg-emerald-500/15 text-emerald-50"
                      : "border-white/[0.1] bg-zinc-900/85 text-white/88 hover:border-white/[0.16] hover:bg-zinc-800/90"
                  }`}
                >
                  {justAdded ? (
                    <>
                      <CheckIcon className="size-[1.125rem] shrink-0 sm:size-5" />
                      Added to bag
                    </>
                  ) : (
                    <>
                      <IconShoppingBag className="size-[1.125rem] shrink-0 opacity-90 sm:size-5" />
                      Add this variant
                    </>
                  )}
                </button>
                <Link
                  href={checkoutUrl}
                  prefetch={false}
                  aria-disabled={soldOut}
                  className={`flex min-h-[48px] min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-[#2D6BFF] text-[14px] font-semibold text-white shadow-[0_10px_32px_-12px_rgba(45,107,255,0.55)] transition-[transform,box-shadow] hover:shadow-[0_14px_36px_-10px_rgba(45,107,255,0.62)] active:scale-[0.99] ${soldOut ? "pointer-events-none opacity-45" : ""}`}
                >
                  <IconCreditCard className="size-[1.125rem] shrink-0 sm:size-5" />
                  Buy now
                </Link>
              </div>
            ) : null}
          </div>

          {galleryHint ? (
            <div className="rounded-xl border border-white/[0.06] bg-black/20 px-4 py-4 text-[13px] leading-[1.65] text-white/48 sm:px-5 sm:text-[14px] sm:leading-relaxed">
              {galleryHint}
            </div>
          ) : null}

          {showReviews ? (
            <div className={inlineActions ? "scroll-mb-6 pb-2" : undefined}>
              <ProductReviewsSection
                layout="embedded"
                artistSlug={artistSlug}
                itemSlug={itemSlug}
                productKind={productKind}
                displayTitle={displayTitle}
              />
            </div>
          ) : null}
      </div>

      {fixedMobileBar ? (
        <>
      <div
        className={`fixed left-0 right-0 z-[115] border-t border-white/[0.08] bg-[#0c0c10]/95 pt-2.5 shadow-[0_-12px_40px_-12px_rgba(0,0,0,0.75)] backdrop-blur-xl supports-[backdrop-filter]:bg-[#0c0c10]/88 md:hidden pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] ${
          stickyAboveNav
            ? "pb-[max(0.5rem,env(safe-area-inset-bottom))]"
            : "pb-[max(0.65rem,env(safe-area-inset-bottom))]"
        }`}
        style={stickyAboveNav ? { bottom: MOBILE_MAIN_NAV_CLEARANCE } : { bottom: 0 }}
      >
        <div className="mx-auto flex w-full max-w-3xl flex-row flex-nowrap items-stretch gap-2.5">
          <button
            type="button"
            onClick={addToBag}
            disabled={soldOut}
            className={`flex min-h-[48px] min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border text-[14px] font-semibold shadow-sm transition-[transform,background-color,border-color,color] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45 ${
              justAdded
                ? "border-emerald-400/35 bg-emerald-500/15 text-emerald-50"
                : "border-white/[0.1] bg-zinc-900/85 text-white/88 hover:border-white/[0.16] hover:bg-zinc-800/90"
            }`}
          >
            {justAdded ? (
              <>
                <CheckIcon className="size-[1.125rem] shrink-0 sm:size-5" />
                Added to bag
              </>
            ) : (
              <>
                <IconShoppingBag className="size-[1.125rem] shrink-0 opacity-90 sm:size-5" />
                Add this variant
              </>
            )}
          </button>
          <Link
            href={checkoutUrl}
            prefetch={false}
            aria-disabled={soldOut}
            className={`flex min-h-[48px] min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-[#2D6BFF] text-[14px] font-semibold text-white shadow-[0_10px_32px_-12px_rgba(45,107,255,0.55)] active:scale-[0.99] ${soldOut ? "pointer-events-none opacity-45" : ""}`}
          >
            <IconCreditCard className="size-[1.125rem] shrink-0 sm:size-5" />
            Buy now
          </Link>
        </div>
      </div>
        </>
      ) : null}
    </>
  );
}
