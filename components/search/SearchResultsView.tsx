"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { GroupedSearchResults } from "@/lib/search/types";
import { creatorExploreLine } from "@/lib/search/creator-lines";
import { SearchProductCard } from "./SearchProductCard";
import { ease } from "./SearchHeader";

export type SearchResultPickInfo = {
  kind: "artist" | "product" | "collection" | "trend";
  href: string;
  label?: string;
};

export function SearchResultsView({
  grouped,
  folderCatalogCounts,
  reduceMotion,
  visibleProductCount,
  onShowMore,
  onResultPick,
}: {
  grouped: GroupedSearchResults;
  folderCatalogCounts: Map<string, { h: number; t: number }>;
  reduceMotion: boolean;
  visibleProductCount: number;
  onShowMore: () => void;
  onResultPick?: (info: SearchResultPickInfo) => void;
}) {
  const { artists, products, collections, trends } = grouped;
  const visibleProducts = products.slice(0, visibleProductCount);
  const total =
    artists.length + products.length + collections.length + trends.length;

  if (total === 0) return null;

  return (
    <div className="space-y-10 pb-6">
      {artists.length > 0 ? (
        <section aria-labelledby="sr-artists">
          <h2 id="sr-artists" className="m-0 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/38">
            Artists
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {artists.map((r, i) => {
              const a = r.data;
              const counts = folderCatalogCounts.get(a.slug) ?? { h: 0, t: 0 };
              return (
                <motion.li
                  key={a.slug}
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease, delay: i * 0.03 }}
                >
                  <Link
                    href={`/artist/${a.slug}`}
                    prefetch={false}
                    onClick={() =>
                      onResultPick?.({ kind: "artist", href: `/artist/${a.slug}`, label: a.name })
                    }
                    className="flex min-h-[56px] items-center gap-3 rounded-2xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 transition-[background-color,border-color] hover:border-[#2D6BFF]/32 hover:bg-white/[0.07]"
                  >
                    <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/10">
                      <img src={a.profileImage} alt="" className="h-full w-full object-cover" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-semibold text-white">{a.name}</span>
                      <span className="mt-0.5 block truncate text-[12px] text-white/42">
                        {creatorExploreLine(a.slug, counts.h, counts.t, a.statusTag)}
                      </span>
                    </span>
                    <span className="text-white/28" aria-hidden>
                      →
                    </span>
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {products.length > 0 ? (
        <section aria-labelledby="sr-products">
          <h2 id="sr-products" className="m-0 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/38">
            Products
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
            {visibleProducts.map((r, i) => (
              <SearchProductCard
                key={r.data.id}
                hit={r.data}
                index={i}
                reduceMotion={reduceMotion}
                onNavigate={() =>
                  onResultPick?.({
                    kind: "product",
                    href: r.data.href,
                    label: r.data.title,
                  })
                }
              />
            ))}
          </div>
          {products.length > visibleProducts.length ? (
            <button
              type="button"
              onClick={onShowMore}
              className="mt-4 w-full rounded-2xl border border-white/[0.1] bg-white/[0.04] py-3 text-[14px] font-semibold text-white/85 transition-colors hover:bg-white/[0.07]"
            >
              Show more
            </button>
          ) : null}
        </section>
      ) : null}

      {collections.length > 0 ? (
        <section aria-labelledby="sr-collections">
          <h2 id="sr-collections" className="m-0 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/38">
            Collections & lanes
          </h2>
          <div className="scrollbar-hide mt-4 flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {collections.map((r, i) => {
              const c = r.data;
              return (
                <motion.div
                  key={c.id}
                  initial={reduceMotion ? false : { opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.38, ease, delay: i * 0.04 }}
                  className="w-[min(72vw,220px)] shrink-0"
                >
                  <Link
                    href={c.href}
                    prefetch={false}
                    onClick={() => onResultPick?.({ kind: "collection", href: c.href, label: c.title })}
                    className={`flex min-h-[120px] flex-col justify-end rounded-3xl border border-white/[0.1] bg-gradient-to-br p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-[border-color,transform] hover:border-white/[0.18] active:scale-[0.99] ${c.gradient}`}
                  >
                    <span className="text-[14px] font-semibold leading-snug text-white/95">{c.title}</span>
                    <span className="mt-1 text-[12px] text-white/55">{c.description}</span>
                    <span className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-[#9eb6ff]">Open →</span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      ) : null}

      {trends.length > 0 ? (
        <section aria-labelledby="sr-editorial">
          <h2 id="sr-editorial" className="m-0 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/38">
            Editorial & drops
          </h2>
          <div className="mt-4 flex flex-col gap-3">
            {trends.map((r, i) => {
              const t = r.data;
              return (
                <motion.div
                  key={t.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease, delay: i * 0.04 }}
                >
                  <Link
                    href={t.href}
                    prefetch={false}
                    onClick={() => onResultPick?.({ kind: "trend", href: t.href, label: t.title })}
                    className="block rounded-3xl border border-white/[0.09] bg-white/[0.04] px-5 py-4 transition-colors hover:border-[#2D6BFF]/28 hover:bg-white/[0.06]"
                  >
                    <p className="text-[15px] font-semibold text-white/95">{t.title}</p>
                    <p className="mt-1 text-[13px] text-white/45">{t.sub}</p>
                    <span className="mt-2 inline-flex text-[12px] font-semibold text-[#9eb6ff]">Explore →</span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export function SearchResultsSkeleton() {
  return (
    <div className="space-y-8 pb-6">
      <div className="space-y-2">
        <div className="h-3 w-20 rounded bg-white/[0.08]" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 w-full rounded-2xl bg-white/[0.06]" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-[4/5] rounded-3xl bg-white/[0.06]" />
        ))}
      </div>
    </div>
  );
}
