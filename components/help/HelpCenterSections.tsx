"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { SectionHeading, TopicCard, helpTouchScrollClass } from "@/components/help/HelpCenterUi";
import { FaqAccordion } from "@/components/help/FaqAccordion";
import {
  HELP_AI_ARTICLES,
  HELP_DEV_ENDPOINTS,
  FAQ_PATH,
  HELP_FOOTER_COLUMNS,
  HELP_LEGAL_HUB,
  HELP_QUICK_LINKS,
  HELP_KB_CATEGORIES,
  HELP_PLATFORM_FLOWS,
  HELP_PLATFORM_INDEX,
  HELP_POPULAR_ACTIONS,
  HELP_SCHEMA_TYPES,
  HELP_SUPPORT_LINKS,
} from "@/lib/help-center";
import type { HelpFaq, HelpTopic } from "@/lib/help-center/types";
import { getTopicsByIds } from "@/lib/help-center/search";

const ACTION_ICONS: Record<string, string> = {
  track: "📦",
  returns: "↩",
  shipping: "🚚",
  signin: "🔐",
  creator: "✦",
  apply: "📝",
  cookies: "🍪",
  api: "{ }",
  sitemap: "🗺",
  status: "●",
  legal: "§",
  faq: "?",
};

export function HelpQuickLinksStrip() {
  return (
    <nav className="mt-8" aria-label="Quick policy links">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-400">Quick links</p>
      <ul className={`mt-3 flex gap-2 pb-1 ${helpTouchScrollClass} snap-x snap-mandatory`}>
        {HELP_QUICK_LINKS.map((link) => (
          <li key={link.href} className="shrink-0 snap-start">
            <Link
              href={link.href}
              className={`inline-flex rounded-full border px-3.5 py-2 text-[12px] font-semibold transition-colors ${
                link.accent
                  ? "border-slate-800 bg-slate-900 text-white shadow-sm hover:bg-slate-800"
                  : "border-neutral-200/90 bg-white text-neutral-700 hover:border-blue-200 hover:bg-blue-50/80 hover:text-blue-800"
              }`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function HelpLegalHubSection() {
  const reduceMotion = useReducedMotion();
  return (
    <section className="mt-16 scroll-mt-28" id="legal-policies" aria-labelledby="help-legal-heading">
      <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/90 bg-gradient-to-br from-slate-50 via-white to-stone-50 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.12)]">
        <div className="border-b border-slate-200/80 px-5 py-6 sm:px-8 sm:py-7">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Legal & compliance</p>
          <h2 id="help-legal-heading" className="mt-1 text-[clamp(1.35rem,3vw,1.85rem)] font-bold tracking-[-0.03em] text-slate-950">
            Policies & legal documents
          </h2>
          <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-slate-600">
            Every official Salvya policy in one place — terms, shopping rules, privacy, cookies, and creator programme legal. Human-readable pages with structured data for search and AI.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/terms"
              className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-[12px] font-semibold text-white hover:bg-slate-800"
            >
              Terms hub →
            </Link>
            <Link
              href="/cookies/settings"
              className="inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-[12px] font-semibold text-slate-800 hover:border-slate-400"
            >
              Cookie settings
            </Link>
            <Link
              href="/docs/policies/machine-readable"
              className="inline-flex rounded-full border border-slate-200 px-4 py-2 text-[12px] font-semibold text-slate-600 hover:text-slate-900"
            >
              AI-readable index
            </Link>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-2">
          {HELP_LEGAL_HUB.map((group, gi) => (
            <motion.div
              key={group.id}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: gi * 0.05, duration: 0.35 }}
              className={`border-slate-200/80 p-5 sm:p-6 ${gi % 2 === 0 ? "lg:border-r" : ""} ${gi < 2 ? "border-b lg:border-b-0" : ""} ${gi < HELP_LEGAL_HUB.length - 2 ? "lg:border-b" : ""}`}
            >
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm ring-1 ring-slate-200/80" aria-hidden>
                  {group.icon}
                </span>
                <div className="min-w-0">
                  <h3 className="text-[15px] font-semibold text-slate-950">{group.title}</h3>
                  <p className="mt-0.5 text-[12px] text-slate-500">{group.description}</p>
                </div>
              </div>
              <ul className="mt-4 space-y-2">
                {group.policies.map((policy) => (
                  <li key={policy.id} className="overflow-hidden rounded-xl border border-slate-200/80 bg-white/90 transition hover:border-slate-400 hover:shadow-sm">
                    <Link href={policy.href} className="group block px-3.5 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[14px] font-semibold text-slate-950 group-hover:text-blue-800">{policy.title}</span>
                        {policy.badge ? (
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                            {policy.badge}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-[12px] leading-relaxed text-slate-500">{policy.summary}</p>
                    </Link>
                    {policy.docsHref ? (
                      <div className="border-t border-slate-100 bg-slate-50/80 px-3.5 py-2">
                        <Link href={policy.docsHref} className="text-[11px] font-semibold text-blue-700 hover:underline" prefetch={false}>
                          Read guide in docs →
                        </Link>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HelpPopularActionsSection() {
  const reduceMotion = useReducedMotion();
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [canScrollForward, setCanScrollForward] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setScrollLeft(el.scrollLeft);
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollForward(maxScroll > 2 && el.scrollLeft < maxScroll - 2);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const ro = new ResizeObserver(() => updateScrollState());
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
  }, [updateScrollState]);

  const scrollByDir = useCallback((dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-help-action-card]");
    const w = card?.offsetWidth ?? 0;
    const delta = w > 0 ? w + 12 : el.clientWidth * 0.82;
    el.scrollBy({ left: dir * delta, behavior: reduceMotion ? "auto" : "smooth" });
  }, [reduceMotion]);

  const showBack = scrollLeft > 2;
  const arrowClass =
    "absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200/90 bg-white/95 text-lg text-neutral-700 shadow-md backdrop-blur-sm transition hover:border-blue-200 hover:text-blue-700";

  return (
    <section aria-labelledby="help-popular-heading">
      <SectionHeading
        id="help-popular-heading"
        title="Popular actions"
        description="High-intent shortcuts to the pages customers, creators, and developers open most."
      />
      <div className="relative -mx-[max(1rem,env(safe-area-inset-left))] px-[max(1rem,env(safe-area-inset-left))] sm:mx-0 sm:px-0">
        <div className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-10 bg-gradient-to-l from-[#fafbfd] to-transparent" aria-hidden />
        <button
          type="button"
          onClick={() => scrollByDir(-1)}
          className={`${arrowClass} left-0 sm:left-1 ${showBack ? "opacity-100" : "pointer-events-none opacity-0"}`}
          aria-label="Scroll popular actions left"
          aria-hidden={!showBack}
          tabIndex={showBack ? 0 : -1}
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => scrollByDir(1)}
          className={`${arrowClass} right-0 sm:right-1 ${canScrollForward ? "opacity-100" : "pointer-events-none opacity-0"}`}
          aria-label="Scroll popular actions right"
          aria-hidden={!canScrollForward}
          tabIndex={canScrollForward ? 0 : -1}
        >
          ›
        </button>
        <ul
          ref={scrollerRef}
          className={`flex gap-3 pb-2 pt-1 ${helpTouchScrollClass} snap-x snap-mandatory scroll-pl-1 scroll-pr-6`}
          aria-label="Popular actions carousel"
        >
          {HELP_POPULAR_ACTIONS.map((action, i) => (
            <motion.li
              key={action.id}
              data-help-action-card
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.04, duration: 0.35 }}
              className="w-[min(72vw,13.5rem)] shrink-0 snap-start sm:w-[11.5rem]"
            >
              <Link
                href={action.href}
                className="group flex h-full min-h-[9.5rem] flex-col rounded-2xl border border-neutral-100/90 bg-white/95 p-4 shadow-sm ring-1 ring-neutral-900/5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-sky-50 text-lg ring-1 ring-blue-100/80" aria-hidden>
                  {ACTION_ICONS[action.icon] ?? "→"}
                </span>
                <p className="mt-3 text-[15px] font-semibold text-neutral-950">{action.title}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-neutral-500">{action.description}</p>
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function HelpKnowledgeBaseSection({ topics, query }: { topics: HelpTopic[]; query: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <section className="mt-16" aria-labelledby="help-kb-heading">
      <SectionHeading
        id="knowledge-base"
        title="Knowledge base"
        description="Organized articles linking to official Salvya pages — searchable, shareable, and indexed."
      />
      <div className="space-y-10">
        {HELP_KB_CATEGORIES.map((cat) => {
          const display = query.trim()
            ? getTopicsByIds(cat.topicIds).filter((t) => topics.some((x) => x.id === t.id))
            : getTopicsByIds(cat.topicIds);
          if (display.length === 0) return null;
          return (
            <details key={cat.id} open className="group rounded-2xl border border-neutral-200/90 bg-white/80 shadow-sm" id={`kb-${cat.id}`}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 marker:content-none [&::-webkit-details-marker]:hidden">
                <div>
                  <h3 className="text-[16px] font-semibold text-neutral-950">{cat.title}</h3>
                  <p className="mt-1 text-[13px] text-neutral-500">{cat.description}</p>
                </div>
                <span className="shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-neutral-600">
                  {display.length} articles
                </span>
              </summary>
              <ul className="grid gap-3 border-t border-neutral-100 p-4 sm:grid-cols-2 lg:grid-cols-3">
                {display.map((topic, i) => (
                  <TopicCard key={topic.id} topic={topic} index={i} reduceMotion={reduceMotion} query={query} />
                ))}
              </ul>
            </details>
          );
        })}
      </div>
    </section>
  );
}

export function HelpAiSeoSection() {
  return (
    <section className="mt-16" aria-labelledby="help-ai-heading">
      <div
        id="ai-seo"
        className="scroll-mt-28 overflow-hidden rounded-[1.75rem] border border-indigo-200/60 bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950 p-6 text-white shadow-[0_32px_80px_-32px_rgba(30,58,138,0.55)] sm:p-8"
      >
        <h2 id="help-ai-heading" className="text-[clamp(1.35rem,3vw,1.75rem)] font-bold tracking-[-0.03em]">AI & search understanding</h2>
        <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-indigo-100/80">
          Machine-readable platform knowledge for Google, ChatGPT, Gemini, Claude, Perplexity, and enterprise crawlers.
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {HELP_AI_ARTICLES.map((article) => (
            <li key={article.id}>
              <Link
                href={article.href}
                className="block h-full rounded-xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm transition hover:border-indigo-300/40 hover:bg-white/[0.1]"
              >
                <p className="text-[14px] font-semibold text-white">{article.title}</p>
                <p className="mt-1.5 text-[12px] leading-relaxed text-indigo-100/70">{article.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/llms.txt" className="rounded-full bg-white/10 px-4 py-2 text-[12px] font-semibold ring-1 ring-white/15 hover:bg-white/15">
            LLMs.txt
          </Link>
          <Link href="/sitemap.xml" className="rounded-full bg-white/10 px-4 py-2 text-[12px] font-semibold ring-1 ring-white/15 hover:bg-white/15">
            Sitemap.xml
          </Link>
          <Link href="/docs" className="rounded-full bg-white/10 px-4 py-2 text-[12px] font-semibold ring-1 ring-white/15 hover:bg-white/15">
            Documentation
          </Link>
          <Link href="/developers" className="rounded-full bg-white px-4 py-2 text-[12px] font-semibold text-indigo-950 hover:bg-indigo-50">
            Developer portal →
          </Link>
        </div>
      </div>
    </section>
  );
}

export function HelpDeveloperSection() {
  return (
    <section className="mt-16" id="developers" aria-labelledby="help-dev-heading">
      <SectionHeading
        id="developer-docs"
        title="Developer docs"
        description="REST APIs, authentication patterns, webhooks, and OpenAPI."
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-3">
          <Link href="/developers" className="block rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm hover:shadow-md">
            <p className="text-[15px] font-semibold text-neutral-950">Open developer portal</p>
            <p className="mt-1 text-[13px] text-neutral-600">Full API reference, SDK notes, and examples.</p>
          </Link>
          <div className="rounded-2xl border border-neutral-200/90 bg-neutral-950 p-4 font-mono text-[12px] leading-relaxed text-emerald-300/90">
            <p className="text-neutral-500"># Session probe</p>
            <p className="mt-2">GET /api/auth/me</p>
          </div>
          <Link href="/openapi.json" className="inline-flex rounded-full border border-neutral-200 bg-white px-4 py-2 text-[12px] font-semibold text-neutral-800 hover:border-blue-200">
            Download OpenAPI JSON
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-sm">
          <ul className="divide-y divide-neutral-100">
            {HELP_DEV_ENDPOINTS.map((ep) => (
              <li key={ep.id} className="flex flex-wrap items-start gap-2 px-4 py-3 text-[13px]">
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700">{ep.method}</span>
                <code className="font-mono text-[12px] text-neutral-800">{ep.path}</code>
                <p className="w-full text-neutral-500">{ep.summary}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function HelpFlowsSection() {
  const reduceMotion = useReducedMotion();
  return (
    <section className="mt-16" id="flows" aria-labelledby="help-flows-heading">
      <SectionHeading id="platform-flows" title="Platform flows" description="Customer and creator lifecycles." />
      <div className="grid gap-6 sm:grid-cols-2">
        {HELP_PLATFORM_FLOWS.map((flow, fi) => (
          <motion.div
            key={flow.id}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: fi * 0.06, duration: 0.4 }}
            className="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-sm"
          >
            <h3 className="text-[16px] font-semibold text-neutral-950">{flow.title}</h3>
            <ol className="mt-4 space-y-2">
              {flow.steps.map((step, i) => (
                <li key={step.label} className="flex items-start gap-2 text-[13px]">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[11px] font-bold text-blue-700">{i + 1}</span>
                  <span className="font-medium text-neutral-900">{step.label}</span>
                </li>
              ))}
            </ol>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function HelpPlatformIndexSection() {
  const groups = [...new Set(HELP_PLATFORM_INDEX.map((l) => l.group))];
  return (
    <section className="mt-16" id="platform-index" aria-labelledby="help-index-heading">
      <SectionHeading id="sitemap-index" title="Sitemap & platform index" description="Public crawl surfaces and discovery files." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <div key={group} className="rounded-2xl border border-neutral-200/90 bg-white/90 p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">{group}</p>
            <ul className="mt-3 space-y-2">
              {HELP_PLATFORM_INDEX.filter((l) => l.group === group).map((link) => (
                <li key={`${group}-${link.label}-${link.href}`}>
                  <Link href={link.href} className="text-[14px] font-medium text-blue-700 hover:underline">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export function HelpStructuredDataSection() {
  return (
    <section className="mt-16" id="structured-data" aria-labelledby="help-schema-heading">
      <SectionHeading id="schema-trust" title="Structured data & trust" description="Schema.org coverage across Salvya." />
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {HELP_SCHEMA_TYPES.map((schema) => (
          <li key={schema.id} className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-sm">
            <p className="text-[14px] font-semibold text-neutral-950">{schema.name}</p>
            <p className="mt-1 text-[13px] text-neutral-600">{schema.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function HelpFaqSection({ faqs }: { faqs: HelpFaq[]; query: string }) {
  if (!faqs.length) return null;
  return (
    <section className="mt-16" id="faq" aria-labelledby="help-faq-heading">
      <SectionHeading id="faq-heading" title="FAQ" description="Customer, creator, developer, and AI questions." />
      <div className="divide-y divide-neutral-200/90 overflow-hidden rounded-2xl border border-neutral-200/90 bg-white/95 shadow-sm">
        {faqs.map((f) => (
          <details key={f.id} id={`faq-${f.id}`} className="group bg-white/80 px-4 py-1 open:bg-white">
            <summary className="cursor-pointer list-none py-3 pr-8 text-[15px] font-semibold text-neutral-900 marker:content-none [&::-webkit-details-marker]:hidden">
              {f.question}
            </summary>
            <div className="border-t border-neutral-100 pb-4 pt-3 text-[14px] text-neutral-600">
              <p>{f.answer}</p>
              {f.links?.length ? (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {f.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="rounded-full bg-blue-50 px-3 py-1.5 text-[12px] font-semibold text-blue-800">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

export function HelpSupportSection() {
  return (
    <section className="mt-16" id="support" aria-labelledby="help-support-heading">
      <SectionHeading id="status-support" title="Status & support" description="Contact, reports, and security." />
      <ul className="grid gap-3 sm:grid-cols-2">
        {HELP_SUPPORT_LINKS.map((link) => (
          <li key={link.id}>
            <Link href={link.href} className="block rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-sm hover:border-blue-200">
              <p className="text-[15px] font-semibold text-neutral-950">{link.label}</p>
              <p className="mt-1 text-[13px] text-neutral-500">{link.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function HelpEnterpriseFooter() {
  return (
    <footer className="mt-20" id="help-footer">
      <div className="rounded-[1.75rem] border border-neutral-200/90 bg-white/95 p-6 shadow-sm sm:p-8">
        <div className="mb-8 max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-600/80">Explore Salvya</p>
          <h2 className="mt-1 text-[1.25rem] font-bold tracking-tight text-neutral-950">Platform, help, developers & AI</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-neutral-600">
            Jump to shop, docs, and discovery surfaces. All legal policies are listed in the section above and summarized below.
          </p>
          <Link href="/help-center#legal-policies" className="mt-3 inline-flex text-[13px] font-semibold text-blue-700 hover:underline">
            ↑ Back to Legal & policies hub
          </Link>
        </div>

        <div className="mb-10 rounded-2xl border border-slate-200/90 bg-slate-50/50 p-5 sm:p-6">
          <p className="text-[12px] font-bold uppercase tracking-wider text-slate-500">Complete legal index</p>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {HELP_LEGAL_HUB.map((group) => (
              <div key={group.id}>
                <p className="text-[13px] font-semibold text-slate-900">{group.title}</p>
                <ul className="mt-2 space-y-1.5">
                  {group.policies.map((p) => (
                    <li key={p.id}>
                      <Link href={p.href} className="text-[12px] text-slate-600 hover:text-blue-700 hover:underline">
                        {p.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {HELP_FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-[13px] font-semibold text-neutral-950">{col.title}</p>
              <ul className="mt-3 space-y-2.5">
                {col.links.map((link) => (
                  <li key={`${col.title}-${link.label}-${link.href}`}>
                    <Link
                      href={link.href}
                      className="inline-block text-[13px] leading-snug text-neutral-600 transition-colors hover:text-blue-700 hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-10 border-t border-neutral-100 pt-6 text-center text-[12px] text-neutral-400">
          © Salvya · Official artist merch & creator-commerce
        </p>
      </div>
    </footer>
  );
}
