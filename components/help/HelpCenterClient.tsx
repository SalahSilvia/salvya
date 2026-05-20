"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HelpCategoryTabs } from "@/components/help/HelpCategoryTabs";
import { TopicCard } from "@/components/help/HelpCenterUi";
import {
  HelpPopularActionsSection,
  HelpKnowledgeBaseSection,
  HelpQuickLinksStrip,
} from "@/components/help/HelpCenterSections";
import { AskSalvyaAi } from "@/components/docs/AskSalvyaAi";
import {
  FAQ_PATH,
  HELP_CENTER_PATH,
  HELP_RECENTS_STORAGE_KEY,
  HELP_TRENDING_SEARCHES,
  type HelpTabId,
  filterFaqs,
  filterHelpTopics,
} from "@/lib/help-center";
import { semanticKnowledgeSearch } from "@/lib/knowledge/semantic-search";

const HelpAiSeoSection = dynamic(
  () => import("@/components/help/HelpCenterSections").then((m) => ({ default: m.HelpAiSeoSection })),
  { ssr: true },
);
const HelpDeveloperSection = dynamic(
  () => import("@/components/help/HelpCenterSections").then((m) => ({ default: m.HelpDeveloperSection })),
  { ssr: true },
);
const HelpFlowsSection = dynamic(
  () => import("@/components/help/HelpCenterSections").then((m) => ({ default: m.HelpFlowsSection })),
  { ssr: true },
);
const HelpPlatformIndexSection = dynamic(
  () => import("@/components/help/HelpCenterSections").then((m) => ({ default: m.HelpPlatformIndexSection })),
  { ssr: true },
);
const HelpStructuredDataSection = dynamic(
  () => import("@/components/help/HelpCenterSections").then((m) => ({ default: m.HelpStructuredDataSection })),
  { ssr: true },
);
const HelpFaqSection = dynamic(
  () => import("@/components/help/HelpCenterSections").then((m) => ({ default: m.HelpFaqSection })),
  { ssr: true },
);
const HelpLegalHubSection = dynamic(
  () => import("@/components/help/HelpCenterSections").then((m) => ({ default: m.HelpLegalHubSection })),
  { ssr: true },
);
const HelpSupportSection = dynamic(
  () => import("@/components/help/HelpCenterSections").then((m) => ({ default: m.HelpSupportSection })),
  { ssr: true },
);
const HelpEnterpriseFooter = dynamic(
  () => import("@/components/help/HelpCenterSections").then((m) => ({ default: m.HelpEnterpriseFooter })),
  { ssr: true },
);

const SECTION_NAV = [
  { id: "help-popular-heading", label: "Popular actions" },
  { id: "legal-policies", label: "Legal & policies" },
  { id: "knowledge-base", label: "Knowledge base" },
  { id: "ai-seo", label: "AI & SEO" },
  { id: "developer-docs", label: "Developers" },
  { id: "platform-flows", label: "Flows" },
  { id: "sitemap-index", label: "Platform index" },
  { id: "schema-trust", label: "Structured data" },
  { id: "faq-heading", label: "FAQ (preview)" },
  { id: "status-support", label: "Support" },
] as const;

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" className="text-neutral-400" fill="none" aria-hidden>
      <path d="M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15ZM16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" />
    </svg>
  );
}

function isEditableTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return el.isContentEditable;
}

function readRecentsFromStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HELP_RECENTS_STORAGE_KEY);
    const v = raw ? (JSON.parse(raw) as unknown) : null;
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.length >= 2 && x.length <= 80) : [];
  } catch {
    return [];
  }
}

function writeRecentsToStorage(next: string[]) {
  try {
    window.localStorage.setItem(HELP_RECENTS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* quota */
  }
}

function helpCenterPath(pathname: string): string {
  const m = pathname.match(/^\/(en|fr|es|it|nl|ar)(?=\/|$)/);
  return m ? `/${m[1]}${HELP_CENTER_PATH}` : HELP_CENTER_PATH;
}

function SectionFallback() {
  return <div className="mt-16 h-32 animate-pulse rounded-2xl bg-neutral-100/80" aria-hidden />;
}

export function HelpCenterClient() {
  const pathname = usePathname() ?? HELP_CENTER_PATH;
  const basePath = helpCenterPath(pathname);
  const reduceMotion = useReducedMotion();
  const searchRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<HelpTabId>("all");
  const [hydrated, setHydrated] = useState(false);
  const [recents, setRecents] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const filtered = useMemo(() => filterHelpTopics(q, tab), [q, tab]);
  const semanticHits = useMemo(() => (q.trim().length > 2 ? semanticKnowledgeSearch(q, 8) : []), [q]);
  const faqs = useMemo(() => filterFaqs(q), [q]);
  const total = filtered.length;
  const empty = q.trim().length > 0 && total === 0;
  const searching = q.trim().length > 0;

  const commitRecent = useCallback((term: string) => {
    const t = term.trim();
    if (t.length < 2) return;
    const prev = readRecentsFromStorage();
    const next = [t, ...prev.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 6);
    writeRecentsToStorage(next);
    setRecents(next);
  }, []);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setQ(sp.get("q") ?? "");
    setRecents(readRecentsFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const params = new URLSearchParams(window.location.search);
    const trimmed = q.trim();
    if (trimmed) params.set("q", trimmed);
    else params.delete("q");
    const qs = params.toString();
    window.history.replaceState({}, "", qs ? `${basePath}?${qs}` : basePath);
  }, [q, hydrated, basePath]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "/" && !isEditableTarget(e.target)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const copyPageLink = useCallback(async () => {
    const trimmed = q.trim();
    const path = trimmed ? `${basePath}?q=${encodeURIComponent(trimmed)}` : basePath;
    const url = typeof window !== "undefined" ? `${window.location.origin}${path}` : path;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard denied */
    }
  }, [q, basePath]);

  const applySuggested = useCallback(
    (next: string) => {
      setQ(next);
      commitRecent(next);
      searchRef.current?.focus();
    },
    [commitRecent],
  );

  const scrollToAnchor = useCallback(
    (id: string) => {
      document.getElementById(id)?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    },
    [reduceMotion],
  );

  useEffect(() => {
    if (tab !== "policies" || searching) return;
    const t = window.setTimeout(() => scrollToAnchor("legal-policies"), 80);
    return () => window.clearTimeout(t);
  }, [tab, searching, scrollToAnchor]);

  return (
    <div className="min-h-dvh bg-[#fafbfd] text-neutral-950 antialiased">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(100%_80%_at_50%_-20%,rgba(59,130,246,0.08),transparent_55%),radial-gradient(80%_50%_at_100%_0%,rgba(14,165,233,0.05),transparent)]" aria-hidden />

      <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/85 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-[max(1rem,env(safe-area-inset-left))] py-3 pr-[max(1rem,env(safe-area-inset-right))] sm:py-4">
          <nav aria-label="Breadcrumb" className="flex min-w-0 flex-wrap items-center gap-1.5 text-[13px]">
            <Link href="/" className="font-semibold text-neutral-500 transition-colors hover:text-neutral-900">
              Home
            </Link>
            <span className="text-neutral-300" aria-hidden>
              /
            </span>
            <span className="truncate font-semibold text-neutral-900">Help Center</span>
          </nav>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-neutral-200/90 bg-neutral-50 px-2.5 py-1 font-mono text-[10px] font-medium text-neutral-500 sm:inline-block" title="Focus search">
              /
            </span>
            <span className="rounded-full bg-neutral-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">Help Center</span>
          </div>
        </div>

        <HelpCategoryTabs tab={tab} onTabChange={setTab} />
      </header>

      <main className="relative mx-auto max-w-6xl px-[max(1rem,env(safe-area-inset-left))] pb-24 pr-[max(1rem,env(safe-area-inset-right))] pt-10 sm:pt-14">
        <div className="lg:grid lg:grid-cols-[1fr_13.5rem] lg:items-start lg:gap-10 xl:grid-cols-[1fr_15rem] xl:gap-12">
          <div>
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">Salvya</p>
              <h1 className="mt-2 text-[clamp(2rem,5vw,3rem)] font-bold tracking-[-0.045em] text-neutral-950">Salvya Help Center</h1>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-neutral-600 sm:text-[16px]">
                Documentation, guides, developer APIs, creator tools, onboarding flows, policies, and AI-readable platform knowledge.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link href="/docs" className="rounded-full border border-neutral-200/90 bg-white px-3.5 py-1.5 text-[12px] font-semibold text-neutral-700 shadow-sm hover:border-blue-200 hover:text-blue-800">
                  Full docs →
                </Link>
                <Link href="/ai" className="rounded-full border border-indigo-200/80 bg-indigo-50/80 px-3.5 py-1.5 text-[12px] font-semibold text-indigo-900 hover:bg-indigo-100">
                  AI overview
                </Link>
                <Link href="/status" className="rounded-full border border-neutral-200/90 bg-white px-3.5 py-1.5 text-[12px] font-semibold text-neutral-700 shadow-sm hover:border-blue-200">
                  Status
                </Link>
                <Link href={FAQ_PATH} className="rounded-full border border-neutral-200/90 bg-white px-3.5 py-1.5 text-[12px] font-semibold text-neutral-700 shadow-sm hover:border-blue-200 hover:text-blue-800">
                  FAQ
                </Link>
                <Link href="/help-center#legal-policies" className="rounded-full border border-slate-300 bg-slate-900 px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-sm hover:bg-slate-800">
                  Legal & policies
                </Link>
              </div>
            </motion.div>

            {!searching ? <HelpQuickLinksStrip /> : null}

            <div className="relative mt-8 max-w-2xl">
              <label htmlFor="help-center-search" className="sr-only">
                Search help center
              </label>
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                <SearchIcon />
              </span>
              <input
                ref={searchRef}
                id="help-center-search"
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRecent(q);
                  if (e.key === "Escape") {
                    if (q) setQ("");
                    else (e.target as HTMLInputElement).blur();
                  }
                }}
                placeholder="Search articles, APIs, policies, onboarding, tracking, refunds…"
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded-2xl border border-neutral-200/90 bg-white py-4 pl-12 pr-[7.5rem] text-[16px] text-neutral-900 shadow-[0_8px_40px_-20px_rgba(15,23,42,0.12)] outline-none transition-[box-shadow,border-color] placeholder:text-neutral-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-500/15 sm:py-5 sm:text-[17px]"
              />
              <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                <button
                  type="button"
                  onClick={copyPageLink}
                  className="rounded-xl px-2.5 py-2 text-[12px] font-semibold text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800"
                  aria-label="Copy link to this help page or search"
                >
                  {copied ? "Copied" : "Copy link"}
                </button>
                {q ? (
                  <button
                    type="button"
                    aria-label="Clear search"
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                    onClick={() => setQ("")}
                  >
                    <span className="text-xl leading-none">×</span>
                  </button>
                ) : null}
              </div>
            </div>

            <p className="mt-2 text-[12px] text-neutral-400">
              Press{" "}
              <kbd className="rounded border border-neutral-200 bg-white px-1.5 py-0.5 font-mono text-[11px] text-neutral-600">/</kbd> to focus search · Shareable URLs with query params
            </p>

            <p className="mt-3 text-[13px] text-neutral-500" aria-live="polite">
              {empty
                ? "No matches — try trending searches or browse sections below."
                : `${total} result${total === 1 ? "" : "s"}${searching ? " ranked for your search" : tab !== "all" ? " in this category" : " indexed"}`}
            </p>

            <div className="mt-5 space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-400">Trending searches</p>
              <div className="flex flex-wrap gap-2">
                {HELP_TRENDING_SEARCHES.map((s) => (
                  <button
                    key={s.q}
                    type="button"
                    onClick={() => applySuggested(s.q)}
                    className="rounded-full border border-neutral-200/90 bg-white px-3 py-1.5 text-[12px] font-medium text-neutral-700 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50/80 hover:text-blue-800"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              {recents.length > 0 ? (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-400">Recent searches</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {recents.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          setQ(r);
                          searchRef.current?.focus();
                        }}
                        className="max-w-full truncate rounded-full border border-dashed border-neutral-300/90 bg-neutral-50/80 px-3 py-1.5 text-[12px] font-medium text-neutral-600 hover:border-blue-200 hover:bg-white hover:text-neutral-900"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {searching && !empty ? (
              <section className="mt-10" aria-labelledby="search-results-heading">
                <h2 id="search-results-heading" className="text-[13px] font-bold uppercase tracking-[0.16em] text-neutral-950">
                  Search results
                </h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((topic, i) => (
                    <TopicCard key={topic.id} topic={topic} index={i} reduceMotion={reduceMotion} query={q} />
                  ))}
                </ul>
              </section>
            ) : null}

            {searching && semanticHits.length > 0 ? (
              <section className="mt-8" aria-labelledby="semantic-results-heading">
                <h2 id="semantic-results-heading" className="text-[13px] font-bold uppercase tracking-[0.16em] text-neutral-950">
                  Knowledge base matches
                </h2>
                <ul className="mt-3 space-y-2 rounded-2xl border border-neutral-200/90 bg-white p-3 shadow-sm">
                  {semanticHits.map((hit) => (
                    <li key={`${hit.kind}-${hit.id}`}>
                      <Link href={hit.href} className="block rounded-lg px-2 py-2 hover:bg-blue-50/80">
                        <span className="text-[10px] font-bold uppercase text-neutral-400">{hit.kind}</span>
                        <p className="text-[14px] font-semibold text-neutral-950">{hit.title}</p>
                        <p className="text-[12px] text-neutral-500 line-clamp-2">{hit.snippet}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {empty ? (
              <div className="mt-10 rounded-2xl border border-dashed border-neutral-200 bg-white/80 px-6 py-12 text-center">
                <p className="text-[15px] font-medium text-neutral-800">Nothing matched</p>
                <p className="mt-2 text-[13px] text-neutral-500">Try a trending tag, switch category tab, or reset.</p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    className="rounded-full bg-neutral-900 px-5 py-2.5 text-[13px] font-semibold text-white hover:opacity-90"
                    onClick={() => {
                      setQ("");
                      setTab("all");
                    }}
                  >
                    Reset filters
                  </button>
                  <button type="button" className="rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-[13px] font-semibold text-neutral-800 hover:bg-neutral-50" onClick={() => applySuggested("refund")}>
                    Try “refund”
                  </button>
                </div>
              </div>
            ) : (
              <>
                {!searching ? (
                  <>
                    <HelpPopularActionsSection />
                    <Suspense fallback={<SectionFallback />}>
                      <HelpLegalHubSection />
                    </Suspense>
                    <HelpKnowledgeBaseSection topics={filtered} query={q} />
                    <Suspense fallback={<SectionFallback />}>
                      <HelpAiSeoSection />
                    </Suspense>
                    <Suspense fallback={<SectionFallback />}>
                      <HelpDeveloperSection />
                    </Suspense>
                    <Suspense fallback={<SectionFallback />}>
                      <HelpFlowsSection />
                    </Suspense>
                    <Suspense fallback={<SectionFallback />}>
                      <HelpPlatformIndexSection />
                    </Suspense>
                    <Suspense fallback={<SectionFallback />}>
                      <HelpStructuredDataSection />
                    </Suspense>
                  </>
                ) : null}
                <Suspense fallback={<SectionFallback />}>
                  <HelpFaqSection faqs={faqs} query={q} />
                </Suspense>
                {!searching ? (
                  <>
                    <Suspense fallback={<SectionFallback />}>
                      <HelpSupportSection />
                    </Suspense>
                    <Suspense fallback={<SectionFallback />}>
                      <HelpEnterpriseFooter />
                    </Suspense>
                  </>
                ) : null}
              </>
            )}

            {!searching ? <AskSalvyaAi className="mt-16" /> : null}

            <aside className="relative mt-16 overflow-hidden rounded-2xl border border-blue-100/80 bg-gradient-to-br from-blue-600 via-blue-600 to-sky-600 p-6 text-white shadow-[0_24px_60px_-28px_rgba(37,99,235,0.45)] sm:p-8">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" aria-hidden />
              <div className="relative max-w-2xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-100/90">Still stuck?</p>
                <p className="mt-2 text-[18px] font-semibold leading-snug sm:text-[20px]">Contact support or open the developer portal</p>
                <p className="mt-2 text-[14px] leading-relaxed text-blue-50/95">
                  Reach the Salvya team for orders and account help, or browse API docs for integrations.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href="/contact" className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2.5 text-[13px] font-semibold text-blue-700 shadow-sm transition-transform hover:scale-[1.02]">
                    Contact support
                  </Link>
                  <Link href="/docs" className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/10 px-4 py-2.5 text-[13px] font-semibold text-white backdrop-blur-sm hover:bg-white/20">
                    Documentation
                  </Link>
                  <Link href="/developers" className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/10 px-4 py-2.5 text-[13px] font-semibold text-white backdrop-blur-sm hover:bg-white/20">
                    Developer portal
                  </Link>
                </div>
              </div>
            </aside>
          </div>

          <aside className="mt-10 hidden lg:mt-0 lg:block" aria-label="On this page">
            <div className="sticky top-36 space-y-4 rounded-2xl border border-neutral-200/80 bg-white/70 p-4 shadow-sm backdrop-blur-md">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">On this page</p>
              <nav className="space-y-1 pt-1">
                {SECTION_NAV.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollToAnchor(item.id)}
                    className="flex w-full rounded-xl px-2 py-2 text-left text-[13px] font-medium text-neutral-700 transition-colors hover:bg-blue-50/80 hover:text-blue-900"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
              <div className="border-t border-neutral-200/80 pt-3">
                <button type="button" onClick={() => searchRef.current?.focus()} className="w-full rounded-xl bg-neutral-900 py-2.5 text-[12px] font-semibold text-white hover:opacity-95">
                  Focus search
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
