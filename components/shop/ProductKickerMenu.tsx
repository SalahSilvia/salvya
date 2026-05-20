"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { IconShoppingBag } from "@/components/shop/product-dock-icons";
import { useBag } from "@/components/cart/BagProvider";
import { getAnalyticsTracker } from "@/lib/analytics/tracker";
import { makeProductId } from "@/lib/member/likes-storage";

type Props = {
  artistSlug: string;
  artistName: string;
  displayTitle: string;
  backHref: string;
  itemSlug: string;
  productKind: "hoodie" | "tshirt";
};

function IconBookmark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M6 4.75A1.75 1.75 0 017.75 3h8.5A1.75 1.75 0 0118 4.75v15.45l-5.25-3.5L7.5 20.2V4.75z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconLink({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M10 13a5 5 0 010-7l1-1a5 5 0 017 7l-1 1M14 11a5 5 0 010 7l-1 1a5 5 0 01-7-7l1-1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconShare({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M8.5 10.5L15 7m0 10l-6.5-3.5M18 5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM9 12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm9 7a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconShop({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M4 10V20h16V10M2 6h20v4H2V6zm4 0V4a2 2 0 012-2h8a2 2 0 012 2v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconArrowBack({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconRuler({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M4 20L20 4M8 4h2v2M12 4h2v2M16 4h2v2M20 8v2M20 12v2M20 16v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconShirt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M6 8l3-4h6l3 4v14H6V8zm6-4v3M9 21V12h6v9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconHelp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M9.5 9a2.5 2.5 0 115 0c0 2-2.5 2.5-2.5 4.5M12 17h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconExternal({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M14 4h6v6M10 14L20 4M8 20h10a2 2 0 002-2V10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MenuGroupLabel({ children }: { children: string }) {
  return (
    <p className="px-3 pb-1.5 pt-2.5 text-[10px] font-semibold uppercase tracking-normal text-white/32 first:pt-1.5">{children}</p>
  );
}

function MenuDivider() {
  return <div className="my-1 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" role="separator" />;
}

type RowButtonProps = {
  icon: ReactNode;
  label: string;
  description?: string;
  onClick: () => void;
  tone?: "default" | "accent" | "saved";
};

function MenuRowButton({ icon, label, description, onClick, tone = "default" }: RowButtonProps) {
  const toneClass =
    tone === "saved"
      ? "text-rose-100/95 hover:bg-rose-500/12"
      : tone === "accent"
        ? "text-white/92 hover:bg-white/[0.08]"
        : "text-white/88 hover:bg-white/[0.06]";

  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-lg px-2.5 py-2 text-left transition-colors ${toneClass}`}
    >
      <span className="mt-0.5 shrink-0 text-white/45 [&>svg]:h-[1.125rem] [&>svg]:w-[1.125rem]">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-medium leading-tight">{label}</span>
        {description ? <span className="mt-0.5 block text-[11px] leading-snug text-white/38">{description}</span> : null}
      </span>
    </button>
  );
}

type RowLinkProps = {
  icon: ReactNode;
  label: string;
  description?: string;
  href: string;
  onNavigate: () => void;
};

function MenuRowLink({ icon, label, description, href, onNavigate }: RowLinkProps) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onNavigate}
      className="flex w-full items-start gap-3 rounded-lg px-2.5 py-2 text-left text-white/88 transition-colors hover:bg-white/[0.06]"
    >
      <span className="mt-0.5 shrink-0 text-white/45 [&>svg]:h-[1.125rem] [&>svg]:w-[1.125rem]">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-medium leading-tight">{label}</span>
        {description ? <span className="mt-0.5 block text-[11px] leading-snug text-white/38">{description}</span> : null}
      </span>
    </Link>
  );
}

export function ProductKickerMenu({
  artistSlug,
  artistName,
  displayTitle,
  backHref,
  itemSlug,
  productKind,
}: Props) {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const { totalQty: bagTotal } = useBag();
  const [feedback, setFeedback] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const fbTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuId = useId();

  const showFeedback = useCallback((msg: string, ms = 2800) => {
    if (fbTimer.current) clearTimeout(fbTimer.current);
    setFeedback(msg);
    fbTimer.current = setTimeout(() => setFeedback(null), ms);
  }, []);

  useEffect(() => () => {
    if (fbTimer.current) clearTimeout(fbTimer.current);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      const first = panelRef.current?.querySelector<HTMLElement>('[role="menuitem"]');
      first?.focus();
    }, 0);
    return () => window.clearTimeout(t);
  }, [open]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(typeof window !== "undefined" ? window.location.href : "");
      showFeedback("Product link copied.");
      close();
    } catch {
      showFeedback("Copy the URL from the address bar.", 3500);
    }
  }, [close, showFeedback]);

  const nativeShare = useCallback(async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const productId = makeProductId(artistSlug, productKind === "tshirt" ? "tee" : "hoodie", itemSlug);
    if (navigator.share) {
      try {
        await navigator.share({ title: displayTitle, text: `${artistName} — Salvya`, url });
        getAnalyticsTracker().trackShareProduct(pathname, productId, artistSlug, { channel: "native_share" });
        close();
      } catch {
        /* dismissed */
      }
    } else {
      void copyLink();
    }
  }, [artistName, artistSlug, close, copyLink, displayTitle, itemSlug, pathname, productKind]);

  const toggleSave = useCallback(() => {
    setSaved((prev) => {
      const next = !prev;
      showFeedback(next ? "Saved for later (preview)." : "Removed from saved.");
      return next;
    });
    close();
  }, [close, showFeedback]);

  const scrollToId = useCallback(
    (id: string, label: string) => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        showFeedback(`Jumped to ${label}.`, 1800);
      } else {
        showFeedback("Section not found on this preview.", 2200);
      }
      close();
    },
    [close, showFeedback],
  );

  const openInNewTab = useCallback(() => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (url) window.open(url, "_blank", "noopener,noreferrer");
    showFeedback("Opened in a new tab.");
    close();
  }, [close, showFeedback]);

  const shortTitle =
    displayTitle.length > 36 ? `${displayTitle.slice(0, 34).trimEnd()}…` : displayTitle;

  return (
    <div className="relative shrink-0" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        id={`${menuId}-trigger`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? `${menuId}-panel` : undefined}
        aria-label="Product quick menu"
        onClick={() => setOpen((o) => !o)}
        className={`group relative flex h-10 w-10 items-center justify-center rounded-xl border text-white/80 shadow-sm backdrop-blur-sm transition-[color,background-color,border-color,box-shadow,transform] hover:border-white/25 hover:bg-white/[0.06] hover:text-white active:scale-[0.97] ${
          open
            ? "border-white/28 bg-zinc-800/90 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]"
            : "border-white/[0.12] bg-zinc-900/70"
        }`}
      >
        <span className="flex gap-[3px]" aria-hidden>
          <span
            className={`h-1 w-1 rounded-full bg-current transition-transform duration-200 ${open ? "translate-y-0.5" : "group-hover:-translate-y-px"}`}
          />
          <span className="h-1 w-1 rounded-full bg-current opacity-90" />
          <span
            className={`h-1 w-1 rounded-full bg-current transition-transform duration-200 ${open ? "-translate-y-0.5" : "group-hover:translate-y-px"}`}
          />
        </span>
      </button>

      <div
        ref={panelRef}
        id={`${menuId}-panel`}
        role="menu"
        aria-labelledby={`${menuId}-title`}
        inert={!open}
        className={`absolute right-0 z-[60] mt-2 w-[min(18.5rem,calc(100vw-2.5rem))] origin-top-right overflow-hidden rounded-2xl border border-white/[0.1] bg-zinc-950/98 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.9),inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur-xl transition-[opacity,transform,visibility] duration-200 ease-out ${
          open
            ? "visible scale-100 opacity-100"
            : "pointer-events-none invisible scale-[0.97] opacity-0"
        }`}
      >
        <div className="border-b border-white/[0.08] bg-white/[0.03] px-3.5 py-3">
          <p id={`${menuId}-title`} className="text-[10px] font-semibold uppercase tracking-normal text-white/40">
            Quick menu
          </p>
          <p className="mt-1 line-clamp-2 text-[13px] font-semibold leading-snug text-white/85">{shortTitle}</p>
        </div>

        <div
          className="max-h-[min(70vh,26rem)] overflow-y-auto overscroll-contain px-1.5 py-1.5 [scrollbar-color:rgba(255,255,255,0.14)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/15 hover:[&::-webkit-scrollbar-thumb]:bg-white/25"
        >
          <MenuGroupLabel>Save &amp; share</MenuGroupLabel>
          <MenuRowButton
            icon={<IconBookmark />}
            label={saved ? "Saved for later" : "Save for later"}
            description="Preview list on this device"
            onClick={toggleSave}
            tone={saved ? "saved" : "default"}
          />
          <MenuRowButton
            icon={<IconLink />}
            label="Copy product link"
            description="Paste anywhere"
            onClick={() => void copyLink()}
            tone="accent"
          />
          <MenuRowButton icon={<IconShare />} label="Share" description="System sheet or copy link" onClick={() => void nativeShare()} />

          <MenuDivider />
          <MenuGroupLabel>Bag</MenuGroupLabel>
          <MenuRowLink
            icon={<IconShoppingBag />}
            label={bagTotal > 0 ? `Your bag (${bagTotal})` : "Your bag"}
            description={bagTotal > 0 ? "Items ready for checkout" : "Add pieces from the product bar"}
            href="/preview-bag"
            onNavigate={close}
          />

          <MenuDivider />
          <MenuGroupLabel>Browse</MenuGroupLabel>
          <MenuRowLink
            icon={<IconShop />}
            label={`${artistName} shop`}
            description="Capsule & drops"
            href={`/artist/${artistSlug}`}
            onNavigate={close}
          />
          <MenuRowLink icon={<IconArrowBack />} label="Back to shop" description="Leave this piece" href={backHref} onNavigate={close} />

          <MenuDivider />
          <MenuGroupLabel>On this page</MenuGroupLabel>
          <MenuRowButton
            icon={<IconRuler />}
            label="Size chart"
            description="Flat measurements"
            onClick={() => scrollToId("size-heading", "Size chart")}
          />
          <MenuRowButton
            icon={<IconShirt />}
            label="Fit & fabric"
            description="Cut, weight, care"
            onClick={() => scrollToId("fit-heading", "Fit & fabric")}
          />
          <MenuRowButton icon={<IconHelp />} label="FAQ" description="Returns, care, timing" onClick={() => scrollToId("faq-heading", "FAQ")} />

          <MenuDivider />
          <MenuGroupLabel>More</MenuGroupLabel>
          <MenuRowButton
            icon={<IconExternal />}
            label="Open in new tab"
            description="Keep this listing handy"
            onClick={openInNewTab}
          />
        </div>
      </div>

      {feedback ? (
        <p
          className="pointer-events-none absolute right-0 top-[calc(100%+0.35rem)] z-[55] max-w-[16rem] rounded-xl border border-white/[0.1] bg-black/88 px-3 py-2 text-[11px] leading-snug text-white/80 shadow-xl backdrop-blur-md"
          role="status"
        >
          {feedback}
        </p>
      ) : null}
    </div>
  );
}
