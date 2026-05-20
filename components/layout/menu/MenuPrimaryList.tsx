"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import type { MenuView } from "./menu-views";
import { MenuRowGlyph } from "./menu-glyphs";
import { MenuAuthFooter } from "./MenuAuthFooter";
import { MenuDiscoverPanel } from "./MenuDiscoverPanel";
import { MENU_SECTIONS, type MenuSection } from "./menu-primary";
import { airSpring, rowStagger } from "./menu-motion";

type Props = {
  onClose: () => void;
  onOpenSubview: (v: Exclude<MenuView, "main">) => void;
  reduceMotion: boolean | null;
  /** When set, replaces the default sign-in / register card (e.g. full-page menu for signed-in users). */
  renderFooter?: (ctx: { onClose: () => void; reduceMotion: boolean | null }) => React.ReactNode;
  /** Override menu sections (e.g. customer menu without creator tools). */
  sections?: MenuSection[];
  /** Full-page member menu uses dark chrome to match `MemberBottomNav`. */
  surface?: "light" | "dark";
  /** Guest policy menu hides discover / search shortcuts. */
  showDiscoverPanel?: boolean;
};

function RowChevron({ dark }: { dark?: boolean }) {
  return (
    <span
      className={
        dark
          ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-white/45 shadow-none ring-1 ring-white/[0.1] transition-all duration-200 group-hover:bg-[#2D6BFF]/35 group-hover:text-white group-hover:ring-[#2D6BFF]/40 group-focus-visible:bg-[#2D6BFF]/35 group-focus-visible:text-white"
          : "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100/90 text-neutral-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] ring-1 ring-neutral-200/60 transition-all duration-200 group-hover:bg-neutral-900 group-hover:text-white group-hover:ring-transparent group-focus-visible:bg-neutral-900 group-focus-visible:text-white"
      }
      aria-hidden
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-current">
        <path d="M10 8l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function filterSections(query: string, sections: MenuSection[]) {
  const q = query.trim().toLowerCase();
  if (!q) return sections;
  return sections
    .map((section) => ({
      ...section,
      rows: section.rows.filter((row) => {
        if (row.label.toLowerCase().includes(q)) return true;
        if (row.kind === "route" && row.href.toLowerCase().includes(q)) return true;
        return false;
      }),
    }))
    .filter((s) => s.rows.length > 0);
}

export function MenuPrimaryList({
  onClose,
  onOpenSubview,
  reduceMotion,
  renderFooter,
  sections,
  surface = "light",
  showDiscoverPanel = true,
}: Props) {
  const [query, setQuery] = useState("");
  const baseSections = sections ?? MENU_SECTIONS;
  const filtered = useMemo(() => filterSections(query, baseSections), [query, baseSections]);
  const searching = query.trim().length > 0;
  const emptySearch = searching && filtered.length === 0;
  const dark = surface === "dark";

  let index = 0;
  const rowInteractive = dark
    ? "group relative flex w-full items-center justify-start gap-3 overflow-hidden rounded-xl px-2.5 py-2.5 outline-none transition-[background-color,transform,box-shadow] duration-200 before:pointer-events-none before:absolute before:inset-y-1 before:left-0 before:w-[3px] before:rounded-full before:bg-gradient-to-b before:from-[#2D6BFF]/0 before:via-[#2D6BFF]/55 before:to-sky-400/0 before:opacity-0 before:transition-opacity hover:bg-white/[0.06] hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] hover:before:opacity-100 focus-visible:ring-2 focus-visible:ring-[#2D6BFF]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050508] active:scale-[0.995] sm:gap-3.5 sm:px-3 sm:py-3.5"
    : "group relative flex w-full items-center justify-start gap-3 overflow-hidden rounded-xl px-2.5 py-2.5 outline-none transition-[background-color,transform,box-shadow] duration-200 before:pointer-events-none before:absolute before:inset-y-1 before:left-0 before:w-[3px] before:rounded-full before:bg-gradient-to-b before:from-blue-500/0 before:via-blue-500/40 before:to-sky-500/0 before:opacity-0 before:transition-opacity hover:bg-gradient-to-r hover:from-neutral-50 hover:to-white/60 hover:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)] hover:before:opacity-100 focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.995] sm:gap-3.5 sm:px-3 sm:py-3.5";

  const labelClass = dark
    ? "min-w-0 flex-1 text-left text-[15px] font-medium leading-snug tracking-[-0.01em] text-white/55 transition-colors group-hover:text-white/88 sm:text-[16px]"
    : "min-w-0 flex-1 text-left text-[15px] font-normal leading-snug tracking-[-0.01em] text-neutral-500 transition-colors group-hover:text-neutral-700 sm:text-[16px]";

  const rowInteractiveSubview = dark
    ? "group relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-xl px-2.5 py-2.5 outline-none transition-[background-color,transform,box-shadow] duration-200 before:pointer-events-none before:absolute before:inset-y-1 before:left-0 before:w-[3px] before:rounded-full before:bg-gradient-to-b before:from-[#2D6BFF]/0 before:via-[#2D6BFF]/55 before:to-sky-400/0 before:opacity-0 before:transition-opacity hover:bg-white/[0.06] hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] hover:before:opacity-100 focus-visible:ring-2 focus-visible:ring-[#2D6BFF]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050508] active:scale-[0.995] sm:gap-3.5 sm:px-3 sm:py-3.5"
    : "group relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-xl px-2.5 py-2.5 outline-none transition-[background-color,transform,box-shadow] duration-200 before:pointer-events-none before:absolute before:inset-y-1 before:left-0 before:w-[3px] before:rounded-full before:bg-gradient-to-b before:from-blue-500/0 before:via-blue-500/40 before:to-sky-500/0 before:opacity-0 before:transition-opacity hover:bg-gradient-to-r hover:from-neutral-50 hover:to-white/60 hover:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)] hover:before:opacity-100 focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.995] sm:gap-3.5 sm:px-3 sm:py-3.5";

  const sectionSurface = (id: string) => {
    const inset: Record<string, string> = {
      shop: "inset_3px_0_0_0_rgba(45,107,255,0.65)",
      about: "inset_3px_0_0_0_rgba(251,191,36,0.4)",
      artists: "inset_3px_0_0_0_rgba(139,92,246,0.5)",
      legal: "inset_3px_0_0_0_rgba(148,163,184,0.38)",
    };
    const stripe = inset[id] ?? "inset_3px_0_0_0_rgba(148,163,184,0.35)";
    if (dark) {
      return `overflow-hidden rounded-[1.35rem] border border-white/[0.08] bg-white/[0.04] shadow-[0_2px_40px_-20px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06),${stripe}]`;
    }
    return `overflow-hidden rounded-[1.35rem] border border-neutral-100 bg-white shadow-[0_2px_24px_-16px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,1),${stripe}]`;
  };

  return (
    <div className="flex flex-col gap-0">
      <h1
        className={
          dark
            ? "m-0 p-0 text-[2.25rem] font-semibold leading-none tracking-[-0.045em] text-white sm:text-[2.5rem]"
            : "m-0 p-0 text-[clamp(4.25rem,20vw,9rem)] font-extralight leading-none tracking-[-0.04em] text-neutral-400"
        }
      >
        Menu
      </h1>
      {dark ? (
        <p className="mt-2 max-w-md text-[14px] leading-relaxed text-white/42">
          Jump to shopping, your bag, or policies — or search below.
        </p>
      ) : null}
      {showDiscoverPanel ? (
        <MenuDiscoverPanel surface={surface} query={query} onQueryChange={setQuery} onClose={onClose} />
      ) : null}

      {emptySearch ? (
        <div
          className={
            dark
              ? "mt-2 rounded-[1.25rem] border border-dashed border-white/[0.12] bg-white/[0.03] px-4 py-8 text-center"
              : "mt-2 rounded-[1.25rem] border border-dashed border-neutral-200/90 bg-white px-4 py-8 text-center"
          }
        >
          <p className={dark ? "text-[15px] font-medium text-white/90" : "text-[15px] font-medium text-neutral-800"}>
            No menu matches
          </p>
          <p className={dark ? "mt-1 text-[13px] text-white/45" : "mt-1 text-[13px] text-neutral-500"}>
            Try “bag”, “shipping”, “help”, or “cookies”.
          </p>
          <button
            type="button"
            className={
              dark
                ? "mt-4 rounded-full border border-white/[0.14] bg-white/[0.06] px-4 py-2 text-[13px] font-semibold text-white/90 transition-colors hover:bg-white/[0.1]"
                : "mt-4 rounded-full border border-neutral-200 bg-white px-4 py-2 text-[13px] font-semibold text-neutral-800 shadow-sm transition-colors hover:bg-neutral-50"
            }
            onClick={() => setQuery("")}
          >
            Clear search
          </button>
        </div>
      ) : null}

      {!emptySearch
        ? filtered.map((section) => (
            <section
              key={section.id}
              className={`${sectionSurface(section.id)} mt-2`}
              aria-labelledby={`menu-section-${section.id}`}
            >
              <h2
                id={`menu-section-${section.id}`}
                className={
                  dark
                    ? "m-0 border-b border-white/[0.08] bg-transparent px-4 pb-1.5 pt-2 text-[11px] font-semibold uppercase leading-none tracking-wider text-white/38 sm:pb-2 sm:pt-2.5 sm:text-[12px]"
                    : "m-0 border-b border-neutral-100 bg-transparent px-4 pb-1.5 pt-2 text-[13px] font-bold uppercase leading-none tracking-wide text-neutral-500 sm:pb-2 sm:pt-2.5 sm:text-[14px]"
                }
              >
                {section.title}
              </h2>
              <ul className={dark ? "m-0 divide-y divide-white/[0.06] p-1.5 pt-0 sm:p-2 sm:pt-0" : "m-0 divide-y divide-neutral-100 p-1.5 pt-0 sm:p-2 sm:pt-0"}>
                {section.rows.map((row) => {
                  const i = index++;

                  const inner = (
                    <>
                      <span className="flex min-w-0 flex-1 items-center gap-3 sm:gap-3.5">
                        <MenuRowGlyph rowId={row.id} />
                        <span className={labelClass}>{row.label}</span>
                      </span>
                      {row.kind === "subview" ? <RowChevron dark={dark} /> : null}
                    </>
                  );

                  return (
                    <motion.li
                      key={row.id}
                      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={reduceMotion ? { duration: 0 } : { ...airSpring, delay: i * rowStagger }}
                    >
                      {row.kind === "route" ? (
                        <Link href={row.href} prefetch={false} onClick={onClose} className={rowInteractive}>
                          {inner}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onOpenSubview(row.view)}
                          className={`${rowInteractiveSubview} cursor-pointer border-0 bg-transparent text-left`}
                        >
                          {inner}
                        </button>
                      )}
                    </motion.li>
                  );
                })}
              </ul>
            </section>
          ))
        : null}

      <div className="mt-2">
        {renderFooter ? renderFooter({ onClose, reduceMotion }) : <MenuAuthFooter onClose={onClose} reduceMotion={reduceMotion} />}
      </div>
    </div>
  );
}
