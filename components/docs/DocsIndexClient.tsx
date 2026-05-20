"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { AskSalvyaAi } from "@/components/docs/AskSalvyaAi";
import { helpTouchScrollClass } from "@/components/help/HelpCenterUi";
import type { DocCategory } from "@/lib/docs/types";
import type { DocArticle } from "@/lib/docs/types";
import { semanticKnowledgeSearch } from "@/lib/knowledge/semantic-search";

export function DocsIndexClient({
  categories,
  articles,
}: {
  categories: DocCategory[];
  articles: DocArticle[];
}) {
  const [q, setQ] = useState("");
  const results = useMemo(() => (q.trim() ? semanticKnowledgeSearch(q, 10) : []), [q]);

  const byCategory = useMemo(() => {
    const map = new Map<string, DocArticle[]>();
    for (const a of articles) {
      const list = map.get(a.category) ?? [];
      list.push(a);
      map.set(a.category, list);
    }
    return map;
  }, [articles]);

  const applyQuery = useCallback((next: string) => setQ(next), []);

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">Salvya Knowledge OS</p>
      <h1 className="mt-2 text-[clamp(2rem,5vw,3rem)] font-bold tracking-[-0.045em]">Documentation</h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-neutral-600">
        AI-readable platform docs — orders, creators, APIs, policies, and architecture for humans and machines.
      </p>

      <div className="relative mt-8 max-w-2xl">
        <label htmlFor="docs-search" className="sr-only">
          Search documentation
        </label>
        <input
          id="docs-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder='Try "refund", "how creators get paid", "failed checkout"…'
          className="w-full rounded-2xl border border-neutral-200/90 bg-white py-4 pl-4 pr-4 text-[16px] shadow-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-500/15"
        />
      </div>

      {results.length > 0 ? (
        <ul className="mt-6 space-y-2 rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-sm">
          {results.map((r) => (
            <li key={`${r.kind}-${r.id}`}>
              <Link href={r.href} className="block rounded-lg px-2 py-2 hover:bg-blue-50/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{r.kind}</span>
                <p className="text-[14px] font-semibold text-neutral-950">{r.title}</p>
                <p className="text-[12px] text-neutral-500 line-clamp-2">{r.snippet}</p>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-10 flex flex-wrap gap-2">
        {["refund", "tracking", "payout", "API auth", "bag sync"].map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => applyQuery(chip)}
            className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[12px] font-medium text-neutral-700 hover:border-blue-200 hover:bg-blue-50"
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/docs/${cat.id}`}
            className="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
          >
            <span className="text-xl" aria-hidden>
              {cat.icon}
            </span>
            <p className="mt-3 text-[16px] font-semibold">{cat.title}</p>
            <p className="mt-1 text-[13px] text-neutral-500">{cat.description}</p>
            <p className="mt-3 text-[12px] font-semibold text-blue-700">
              {(byCategory.get(cat.id) ?? []).length} articles →
            </p>
          </Link>
        ))}
      </div>

      <div className={`mt-10 flex gap-3 overflow-x-auto pb-2 ${helpTouchScrollClass}`}>
        <Link href="/ai" className="shrink-0 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-[12px] font-semibold text-indigo-900">
          AI overview
        </Link>
        <Link href="/platform" className="shrink-0 rounded-full border border-neutral-200 bg-white px-4 py-2 text-[12px] font-semibold">
          Platform
        </Link>
        <Link href="/developers" className="shrink-0 rounded-full border border-neutral-200 bg-white px-4 py-2 text-[12px] font-semibold">
          Developers
        </Link>
        <Link href="/status" className="shrink-0 rounded-full border border-neutral-200 bg-white px-4 py-2 text-[12px] font-semibold">
          Status
        </Link>
      </div>

      <AskSalvyaAi className="mt-14" />
    </div>
  );
}
