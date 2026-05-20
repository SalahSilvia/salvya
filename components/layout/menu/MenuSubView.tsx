"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import type { MenuView } from "./menu-views";
import { SUBVIEW_LINKS } from "./menu-views";
import { SubviewLinkGlyph } from "./menu-glyphs";
import { MenuAuthFooter } from "./MenuAuthFooter";
import { airSpring, chipStagger } from "./menu-motion";

type Props = {
  view: Exclude<MenuView, "main">;
  onBack: () => void;
  onClose: () => void;
  renderFooter?: (ctx: { onClose: () => void; reduceMotion: boolean | null }) => React.ReactNode;
  /** Hide creator programme policy links for guests in the policies subview. */
  customerMenu?: boolean;
  surface?: "light" | "dark";
};

function SubviewSearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" className={className} fill="none" aria-hidden>
      <path
        d="M10.5 17a6.5 6.5 0 100-13 6.5 6.5 0 000 13ZM15.5 15.5L20 20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MenuSubView({ view, onBack, onClose, renderFooter, customerMenu, surface = "light" }: Props) {
  const reduceMotion = useReducedMotion();
  const dark = surface === "dark";
  const config = useMemo(() => {
    const base = SUBVIEW_LINKS[view];
    if (customerMenu && view === "policies") {
      return {
        ...base,
        links: base.links.filter((l) => l.href !== "/terms/creator"),
      };
    }
    return base;
  }, [view, customerMenu]);
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return config.links;
    return config.links.filter(
      (link) => link.label.toLowerCase().includes(s) || link.href.toLowerCase().includes(s),
    );
  }, [config.links, q]);

  const rowClass = dark
    ? "group relative flex w-full items-center justify-start gap-3 overflow-hidden rounded-xl px-2.5 py-2.5 text-left outline-none transition-[background-color,transform,box-shadow] duration-200 before:pointer-events-none before:absolute before:inset-y-1 before:left-0 before:w-[3px] before:rounded-full before:bg-gradient-to-b before:from-[#2D6BFF]/0 before:via-[#2D6BFF]/50 before:to-sky-500/0 before:opacity-0 before:transition-opacity hover:bg-white/[0.06] hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] hover:before:opacity-100 focus-visible:ring-2 focus-visible:ring-[#2D6BFF]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050508] active:scale-[0.995] sm:gap-3.5 sm:px-3 sm:py-3.5"
    : "group relative flex w-full items-center justify-start gap-3 overflow-hidden rounded-xl px-2.5 py-2.5 text-left outline-none transition-[background-color,transform,box-shadow] duration-200 before:pointer-events-none before:absolute before:inset-y-1 before:left-0 before:w-[3px] before:rounded-full before:bg-gradient-to-b before:from-blue-600/0 before:via-blue-500/45 before:to-sky-500/0 before:opacity-0 before:transition-opacity hover:bg-gradient-to-r hover:from-neutral-50 hover:to-white/60 hover:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)] hover:before:opacity-100 focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.995] sm:gap-3.5 sm:px-3 sm:py-3.5";

  const cardClass = dark
    ? "overflow-hidden rounded-[1.35rem] border border-white/[0.08] bg-white/[0.04] shadow-[0_2px_40px_-20px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.06),inset_3px_0_0_0_rgba(45,107,255,0.55)]"
    : "overflow-hidden rounded-[1.35rem] border border-neutral-100 bg-white shadow-[0_2px_24px_-16px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,1),inset_3px_0_0_0_rgba(37,99,235,0.35)]";

  const emptyFilter = q.trim().length > 0 && filtered.length === 0;

  return (
    <div className="flex flex-col gap-5 pb-2 pt-1">
      <motion.button
        type="button"
        onClick={onBack}
        initial={reduceMotion ? false : { opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={reduceMotion ? { duration: 0 } : { ...airSpring }}
        className={
          dark
            ? "self-start inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.06] px-4 py-2.5 text-[13px] font-semibold text-white/88 shadow-[0_8px_28px_-14px_rgba(0,0,0,0.65)] ring-1 ring-white/[0.04] transition-[background-color,box-shadow,transform] hover:bg-white/[0.1] hover:shadow-lg active:translate-y-0"
            : "self-start inline-flex cursor-pointer items-center gap-2 rounded-full border border-neutral-200/80 bg-white/90 px-4 py-2.5 text-[13px] font-semibold text-neutral-800 shadow-[0_2px_12px_-6px_rgba(15,23,42,0.15)] ring-1 ring-neutral-900/5 transition-[background-color,box-shadow,transform] hover:-translate-y-px hover:bg-neutral-50 hover:shadow-md active:translate-y-0"
        }
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          className={dark ? "text-white/45" : "text-neutral-500"}
          aria-hidden
        >
          <path d="M14 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back
      </motion.button>

      <div className={cardClass}>
        <motion.h2
          className={
            dark
              ? "m-0 border-b border-white/[0.08] bg-transparent px-4 pb-2 pt-3 text-[11px] font-semibold uppercase leading-none tracking-wider text-white/38 sm:text-[12px]"
              : "m-0 border-b border-neutral-100 bg-transparent px-4 pb-2 pt-3 text-[13px] font-bold uppercase leading-none tracking-wide text-neutral-500 sm:text-[14px]"
          }
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0 } : { ...airSpring, delay: 0.04 }}
        >
          {config.title}
        </motion.h2>

        <div
          className={
            dark
              ? "border-b border-white/[0.08] bg-transparent px-3 pb-2 pt-2 sm:px-4 sm:pb-2 sm:pt-2"
              : "border-b border-neutral-100 bg-white px-3 pb-2 pt-2 sm:px-4 sm:pb-2 sm:pt-2"
          }
        >
          <label htmlFor={`subview-filter-${view}`} className="sr-only">
            Filter links in this section
          </label>
          <div className="relative">
            <span
              className={`pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 ${dark ? "text-white/35" : "text-neutral-400"}`}
            >
              <SubviewSearchIcon />
            </span>
            <input
              id={`subview-filter-${view}`}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter these links…"
              className={
                dark
                  ? "w-full rounded-lg border border-white/[0.1] bg-black/30 py-2 pl-8 pr-8 text-[13px] font-medium text-white/75 outline-none ring-0 transition-[border-color,box-shadow] placeholder:text-white/32 focus:border-[#2D6BFF]/45 focus:ring-2 focus:ring-[#2D6BFF]/20"
                  : "w-full rounded-lg border border-neutral-200/90 bg-white/95 py-2 pl-8 pr-8 text-[13px] font-normal text-neutral-500 outline-none ring-blue-500/0 transition-[border-color,ring-width] placeholder:text-neutral-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20"
              }
            />
            {q ? (
              <button
                type="button"
                aria-label="Clear filter"
                className={
                  dark
                    ? "absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-white/40 hover:bg-white/[0.08] hover:text-white/85"
                    : "absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                }
                onClick={() => setQ("")}
              >
                ×
              </button>
            ) : null}
          </div>
        </div>

        {emptyFilter ? (
          <div
            className={
              dark
                ? "px-4 py-8 text-center text-[14px] text-white/55"
                : "px-4 py-8 text-center text-[14px] text-neutral-600"
            }
          >
            No links match — clear the filter.
          </div>
        ) : (
          <ul className={dark ? "divide-y divide-white/[0.06] p-1.5 sm:p-2" : "divide-y divide-neutral-100/90 p-1.5 sm:p-2"}>
            {filtered.map((link, i) => (
              <motion.li
                key={`${view}-${link.href}-${link.label}`}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reduceMotion ? { duration: 0 } : { ...airSpring, delay: 0.06 + i * chipStagger }}
              >
                <Link href={link.href} prefetch={false} onClick={onClose} className={rowClass}>
                  <span className="flex min-w-0 flex-1 items-center gap-3 sm:gap-3.5">
                    <SubviewLinkGlyph href={link.href} />
                    <span
                      className={
                        dark
                          ? "min-w-0 flex-1 text-[15px] font-medium leading-snug tracking-[-0.01em] text-white/55 transition-colors group-hover:text-white/88 sm:text-[16px]"
                          : "min-w-0 flex-1 text-[15px] font-normal leading-snug tracking-[-0.01em] text-neutral-500 transition-colors group-hover:text-neutral-700 sm:text-[16px]"
                      }
                    >
                      {link.label}
                    </span>
                  </span>
                </Link>
              </motion.li>
            ))}
          </ul>
        )}
      </div>

      {renderFooter ? renderFooter({ onClose, reduceMotion }) : <MenuAuthFooter onClose={onClose} reduceMotion={reduceMotion} />}
    </div>
  );
}
