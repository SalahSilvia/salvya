"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { SalvyaLogoImage } from "@/components/brand/SalvyaLogoImage";
import { useBag } from "@/components/cart/BagProvider";
import { MenuDock } from "./MenuDock";
import { useSupabaseUser } from "@/components/member/useSupabaseUser";
import { MenuPrimaryList } from "./MenuPrimaryList";
import { MenuSubView } from "./MenuSubView";
import { GUEST_MENU_SECTIONS, MENU_SECTIONS } from "./menu-primary";
import type { MenuView } from "./menu-views";
import { airEaseOut, airSpring } from "./menu-motion";

type Props = {
  triggerClassName: string;
};

const grainSvg =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const menuSurface =
  "pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_-10%,rgba(37,99,235,0.028),transparent_55%),radial-gradient(90%_60%_at_100%_0%,rgba(15,23,42,0.02),transparent_50%)]";

const menuMesh =
  "pointer-events-none absolute inset-0 opacity-40 mix-blend-multiply [mask-image:radial-gradient(80%_65%_at_50%_0%,black,transparent)]";

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block h-[14px] w-5" aria-hidden>
      <motion.span
        className="absolute left-0 right-0 top-0 h-[1.5px] rounded-full bg-current"
        animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
      <motion.span
        className="absolute left-0 right-0 top-[6px] h-[1.5px] rounded-full bg-current"
        animate={open ? { opacity: 0, scaleX: 0.2 } : { opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.18 }}
      />
      <motion.span
        className="absolute bottom-0 left-0 right-0 h-[1.5px] rounded-full bg-current"
        animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    </span>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} width="22" height="22" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    </svg>
  );
}

function LinkCopyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" className={className} fill="none" aria-hidden>
      <path
        d="M14 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2M10 8h8a2 2 0 012 2v8a2 2 0 01-2 2h-8a2 2 0 01-2-2v-8a2 2 0 012-2z"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MenuOverlay({ triggerClassName }: Props) {
  const { user } = useSupabaseUser();
  const isGuest = !user;
  const menuSections = isGuest ? GUEST_MENU_SECTIONS : MENU_SECTIONS;
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [bagTotal, setBagTotal] = useState(0);
  const [view, setView] = useState<MenuView>("main");
  const menuId = useId();
  const [linkCopied, setLinkCopied] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (view !== "main") setView("main");
        else close();
        return;
      }
      if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const t = e.target as HTMLElement | null;
        if (t?.closest?.("input, textarea, [contenteditable=true]")) return;
        if (view !== "main") return;
        e.preventDefault();
        window.setTimeout(() => document.getElementById("menu-quick-find-input")?.focus(), 0);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, view]);

  useEffect(() => {
    if (!open) return;
    setLinkCopied(false);
  }, [open]);

  const copyPageLink = useCallback(async () => {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2200);
    } catch {
      setLinkCopied(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (open) return;
    const t = window.setTimeout(() => setView("main"), 500);
    return () => window.clearTimeout(t);
  }, [open]);

  const layer =
    mounted && typeof document !== "undefined" ? (
      <AnimatePresence>
        {open ? (
          <motion.div
            key="air-menu"
            id={menuId}
            role="dialog"
            aria-modal="true"
            aria-label="Salvya navigation"
            className="fixed inset-0 z-[200] flex flex-col bg-white text-neutral-950"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.987 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.984 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.36, ease: airEaseOut }}
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white via-[#fcfcfd] to-[#f7f9fc]" aria-hidden />
            <div className={menuSurface} aria-hidden />
            <div
              className={menuMesh}
              aria-hidden
              style={{
                backgroundImage:
                  "radial-gradient(50%_40%_at_15%_0%, rgba(59,130,246,0.06), transparent), radial-gradient(45%_35%_at_95%_5%, rgba(125,211,252,0.05), transparent)",
              }}
            />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.02] mix-blend-multiply"
              style={{ backgroundImage: grainSvg, backgroundSize: "200px 200px" }}
              aria-hidden
            />

            <motion.div
              className="relative flex min-h-0 flex-1 flex-col"
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduceMotion ? { duration: 0 } : { ...airSpring, delay: 0.02 }}
            >
              <header className="flex shrink-0 items-center gap-3 border-b border-neutral-100 bg-white px-5 pb-4 pt-[max(0.75rem,env(safe-area-inset-top))] sm:gap-4 sm:px-8 lg:px-12">
                <motion.div
                  className="min-w-0 flex-1"
                  initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={reduceMotion ? { duration: 0 } : { ...airSpring, delay: 0.05 }}
                >
                  <Link
                    href={isGuest ? "/shop" : "/"}
                    prefetch={false}
                    onClick={close}
                    className="inline-flex max-w-[min(100%,200px)] items-center rounded-lg outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-neutral-900/20 focus-visible:ring-offset-2"
                  >
                    <SalvyaLogoImage
                      variant="dark"
                      alt="Salvya"
                      fallback="word"
                      className="h-10 w-auto max-w-[min(100%,220px)] object-contain object-left sm:h-11"
                      fallbackClassName="text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl"
                    />
                  </Link>
                </motion.div>
                <div className="flex shrink-0 items-center gap-2">
                  <motion.button
                    type="button"
                    onClick={() => void copyPageLink()}
                    className="relative flex h-11 items-center justify-center gap-1.5 rounded-full border border-neutral-200/90 bg-white px-3 text-[12px] font-semibold text-neutral-600 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[transform,background-color] hover:bg-blue-50/60 hover:text-blue-900 sm:min-w-[5.5rem] sm:px-3.5"
                    aria-label={linkCopied ? "Link copied" : "Copy page link"}
                    aria-live="polite"
                    whileHover={reduceMotion ? undefined : { scale: 1.05 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.94 }}
                    transition={airSpring}
                  >
                    <LinkCopyIcon className="shrink-0 text-neutral-600" />
                    <span className="hidden sm:inline">{linkCopied ? "Copied" : "Copy link"}</span>
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={close}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-neutral-200/90 bg-white text-neutral-600 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[transform,background-color,box-shadow] hover:bg-neutral-50"
                    aria-label="Close"
                    whileHover={reduceMotion ? undefined : { scale: 1.06 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.94 }}
                    transition={airSpring}
                  >
                    <CloseIcon />
                  </motion.button>
                </div>
              </header>

              {view !== "main" ? (
                <div className="relative h-1 w-full shrink-0 overflow-hidden bg-neutral-100" aria-hidden>
                  <motion.div
                    key={view}
                    className="absolute inset-y-0 left-0 w-[42%] max-w-xs bg-gradient-to-r from-blue-700 via-blue-500 to-sky-400"
                    initial={reduceMotion ? false : { x: "-110%" }}
                    animate={{ x: "0%" }}
                    transition={reduceMotion ? { duration: 0 } : { duration: 0.45, ease: airEaseOut }}
                  />
                </div>
              ) : null}

              <div className="relative flex min-h-0 flex-1 flex-col">
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-smooth bg-transparent px-4 pb-32 pt-4 [-ms-overflow-style:none] [scrollbar-width:none] sm:px-7 sm:pb-36 sm:pt-5 lg:px-12 [&::-webkit-scrollbar]:hidden">
                  <div className="mx-auto w-full max-w-xl">
                    <AnimatePresence mode="wait" initial={false}>
                      {view === "main" ? (
                        <motion.div
                          key="air-main"
                          initial={reduceMotion ? false : { opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={reduceMotion ? undefined : { opacity: 0, x: -10 }}
                          transition={reduceMotion ? { duration: 0 } : { duration: 0.32, ease: airEaseOut }}
                        >
                          <MenuPrimaryList
                            onClose={close}
                            onOpenSubview={(v) => setView(v)}
                            reduceMotion={reduceMotion}
                            sections={menuSections}
                            showDiscoverPanel={!isGuest}
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          key={`air-sub-${view}`}
                          initial={reduceMotion ? false : { opacity: 0, x: 16 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={reduceMotion ? undefined : { opacity: 0, x: 12 }}
                          transition={reduceMotion ? { duration: 0 } : { duration: 0.32, ease: airEaseOut }}
                        >
                          <MenuSubView view={view} onBack={() => setView("main")} onClose={close} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <MenuDock bagTotal={bagTotal} onClose={close} reduceMotion={reduceMotion} />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    ) : null;

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? menuId : undefined}
        aria-label={open ? "Close menu" : "Open menu"}
        className={`${triggerClassName} touch-manipulation active:scale-[0.96]`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="flex items-center gap-2">
          <SalvyaLogoImage
            variant="light"
            alt=""
            fallback="monogram"
            className="h-6 w-6 shrink-0 rounded-md object-contain opacity-95 sm:h-7 sm:w-7"
            fallbackClassName="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/12 text-[11px] font-bold text-current sm:h-7 sm:w-7 sm:text-xs"
          />
          <MenuIcon open={open} />
          <span className="text-xl font-extralight leading-none tracking-tight text-white/85 sm:text-2xl">Menu</span>
        </span>
      </button>

      {layer ? createPortal(layer, document.body) : null}
    </div>
  );
}
