"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FaqAccordion } from "@/components/help/FaqAccordion";
import { helpTouchScrollClass } from "@/components/help/HelpCenterUi";
import { FAQ_PATH, HELP_CENTER_PATH, HELP_FAQ_GROUP_META } from "@/lib/help-center/content";
import { filterFaqs } from "@/lib/help-center/search";
import type { HelpFaq } from "@/lib/help-center/types";

const FAQ_SUGGESTIONS = ["refund", "track", "creator", "cookies", "payment", "cancel"];

type FaqGroupFilter = HelpFaq["group"] | "all";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" className="text-neutral-400" fill="none" aria-hidden>
      <path d="M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15ZM16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" />
    </svg>
  );
}

export function FaqPageClient() {
  const reduceMotion = useReducedMotion();
  const searchRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [group, setGroup] = useState<FaqGroupFilter>("all");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setQ(sp.get("q") ?? "");
    const g = sp.get("group");
    if (g && HELP_FAQ_GROUP_META.some((m) => m.id === g)) setGroup(g as FaqGroupFilter);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const params = new URLSearchParams();
    const trimmed = q.trim();
    if (trimmed) params.set("q", trimmed);
    if (group !== "all") params.set("group", group);
    const qs = params.toString();
    window.history.replaceState({}, "", qs ? `${FAQ_PATH}?${qs}` : FAQ_PATH);
  }, [q, group, hydrated]);

  const faqs = useMemo(() => filterFaqs(q, group), [q, group]);
  const empty = q.trim().length > 0 && faqs.length === 0;

  const applySuggested = useCallback((term: string) => {
    setQ(term);
    searchRef.current?.focus();
  }, []);

  return (
    <div className="min-h-dvh bg-[#fafbfd] text-neutral-950 antialiased">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(100%_80%_at_50%_-20%,rgba(59,130,246,0.08),transparent_55%)]" aria-hidden />

      <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/85 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-[max(1rem,env(safe-area-inset-left))] py-3 pr-[max(1rem,env(safe-area-inset-right))] sm:py-4">
          <nav aria-label="Breadcrumb" className="flex min-w-0 flex-wrap items-center gap-1.5 text-[13px]">
            <Link href="/" className="font-semibold text-neutral-500 transition-colors hover:text-neutral-900">
              Home
            </Link>
            <span className="text-neutral-300" aria-hidden>
              /
            </span>
            <Link href={HELP_CENTER_PATH} className="font-semibold text-neutral-500 transition-colors hover:text-neutral-900">
              Help Center
            </Link>
            <span className="text-neutral-300" aria-hidden>
              /
            </span>
            <span className="truncate font-semibold text-neutral-900">FAQ</span>
          </nav>
          <span className="rounded-full bg-neutral-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">FAQ</span>
        </div>
      </header>

      <main className="relative mx-auto max-w-3xl px-[max(1rem,env(safe-area-inset-left))] pb-24 pr-[max(1rem,env(safe-area-inset-right))] pt-10 sm:pt-14">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.4 }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">Salvya Help</p>
          <h1 className="mt-2 text-[clamp(1.75rem,4.5vw,2.5rem)] font-bold tracking-[-0.04em] text-neutral-950">Frequently asked questions</h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-neutral-600">
            Quick answers for customers, creators, and developers — with links to policies, tools, and the full Help Center.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href={HELP_CENTER_PATH}
              className="rounded-full border border-neutral-200/90 bg-white px-3.5 py-1.5 text-[12px] font-semibold text-neutral-700 shadow-sm hover:border-blue-200 hover:text-blue-800"
            >
              Help Center →
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-neutral-200/90 bg-white px-3.5 py-1.5 text-[12px] font-semibold text-neutral-700 shadow-sm hover:border-blue-200"
            >
              Contact support
            </Link>
            <Link
              href="/help-center#legal-policies"
              className="rounded-full border border-slate-300 bg-slate-900 px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              Legal & policies
            </Link>
          </div>
        </motion.div>

        <div className="relative mt-8">
          <label htmlFor="faq-search" className="sr-only">
            Search FAQ
          </label>
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
            <SearchIcon />
          </span>
          <input
            ref={searchRef}
            id="faq-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search questions — refunds, tracking, payouts, API…"
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-2xl border border-neutral-200/90 bg-white py-4 pl-11 pr-12 text-[16px] text-neutral-900 shadow-sm outline-none placeholder:text-neutral-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-500/15"
          />
          {q ? (
            <button
              type="button"
              aria-label="Clear search"
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-neutral-400 hover:bg-neutral-100"
              onClick={() => setQ("")}
            >
              ×
            </button>
          ) : null}
        </div>

        <p className="mt-3 text-[13px] text-neutral-500" aria-live="polite">
          {empty
            ? "No matches — try a suggestion below or switch category."
            : `${faqs.length} question${faqs.length === 1 ? "" : "s"}${q.trim() ? " matching your search" : group !== "all" ? " in this category" : ""}`}
        </p>

        <div className="mt-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-400">Category</p>
          <div className={`mt-2 flex gap-2 pb-1 ${helpTouchScrollClass} snap-x snap-mandatory`}>
            {HELP_FAQ_GROUP_META.map((g) => {
              const active = group === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGroup(g.id)}
                  className={`shrink-0 snap-start rounded-full border px-3.5 py-2 text-[12px] font-semibold transition-colors ${
                    active
                      ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                      : "border-neutral-200/90 bg-white text-neutral-600 hover:border-blue-200"
                  }`}
                >
                  {g.label}
                </button>
              );
            })}
          </div>
        </div>

        {!q.trim() ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {FAQ_SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => applySuggested(s)}
                className="rounded-full border border-neutral-200/90 bg-white px-3 py-1.5 text-[12px] font-medium text-neutral-700 hover:border-blue-200 hover:bg-blue-50/80"
              >
                {s}
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-10">
          <FaqAccordion faqs={faqs} query={q} />
        </div>

        <aside className="relative mt-14 overflow-hidden rounded-2xl border border-blue-100/80 bg-gradient-to-br from-blue-600 to-sky-600 p-6 text-white shadow-lg sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-100/90">Need more detail?</p>
          <p className="mt-2 text-[17px] font-semibold leading-snug">Browse the full Help Center or contact us</p>
          <p className="mt-2 text-[14px] text-blue-50/95">
            Guides, API docs, legal policies, and platform flows live in the Help Center.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={HELP_CENTER_PATH} className="rounded-full bg-white px-4 py-2.5 text-[13px] font-semibold text-blue-700 shadow-sm hover:scale-[1.02]">
              Open Help Center
            </Link>
            <Link href="/track-order" className="rounded-full border border-white/40 bg-white/10 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-white/20">
              Track order
            </Link>
          </div>
        </aside>
      </main>
    </div>
  );
}
