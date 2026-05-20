"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { useLikes } from "@/components/likes/LikesProvider";
import type { SearchProductHit } from "@/lib/member/search-catalog";
import {
  DISCOVER_CATEGORIES,
  RECENT_SEARCH_STORAGE_KEY,
  SUGGESTED_QUERIES,
  TRENDING_EDITORIAL,
} from "@/lib/member/search-discovery";
import { likedProductIdSet, sortSearchHitsByTaste } from "@/lib/member/likes-personalize";
import type { ArtistCard } from "@/lib/site-data";
import { SearchQueryCache } from "@/lib/search/query-cache";
import {
  DEFAULT_SEARCH_FILTERS,
  discoverTilesToCollections,
  type SearchFilters,
} from "@/lib/search/types";
import type { PersonalizationProfile } from "@/lib/discovery/types";
import type { EnrichedSearchProductHit } from "@/lib/discovery/build-discovery-catalog";
import { sortProductsByDiscoveryRank } from "@/lib/search/unified-search";
import { runUnifiedSearch, type UnifiedSearchContext } from "@/lib/search/unified-search";
import { getAnalyticsTracker } from "@/lib/analytics/tracker";
import { ArtistsRow } from "./ArtistsRow";
import { DiscoverCategories } from "./DiscoverCategories";
import { FeaturedPiecesGrid } from "./FeaturedPiecesGrid";
import { SearchFilterBar } from "./SearchFilterBar";
import { SearchHeader, ease } from "./SearchHeader";
import { SearchResultsSkeleton, SearchResultsView, type SearchResultPickInfo } from "./SearchResultsView";
import { TrendingSection } from "./TrendingSection";

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="none" className={className} aria-hidden>
      <path
        d="M10.5 17a6.5 6.5 0 100-13 6.5 6.5 0 000 13ZM15.5 15.5L20 20"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
      />
    </svg>
  );
}

function readRecents(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_SEARCH_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string").slice(0, 8)
      : [];
  } catch {
    return [];
  }
}

function writeRecents(next: string[]) {
  try {
    window.localStorage.setItem(RECENT_SEARCH_STORAGE_KEY, JSON.stringify(next.slice(0, 8)));
  } catch {
    /* ignore */
  }
}

export function SearchExperience({
  productHits,
  storefrontArtists,
  personalization = null,
}: {
  productHits: EnrichedSearchProductHit[];
  storefrontArtists: ArtistCard[];
  personalization?: PersonalizationProfile | null;
}) {
  const pathname = usePathname() ?? "/";
  const { items: likedItems } = useLikes();
  const reduceMotion = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const cacheRef = useRef(new SearchQueryCache());

  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [recents, setRecents] = useState<string[]>([]);
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_SEARCH_FILTERS);
  const [productShow, setProductShow] = useState(12);
  const lastSearchSig = useRef<string | null>(null);

  useEffect(() => {
    setRecents(readRecents());
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(q.trim()), 320);
    return () => window.clearTimeout(t);
  }, [q]);

  const trimmed = q.trim();
  const debouncedTrim = debouncedQ.trim();
  const hasActiveQuery = debouncedTrim.length > 0;
  const isPending = trimmed.length > 0 && trimmed !== debouncedTrim;

  useEffect(() => {
    setProductShow(12);
  }, [debouncedTrim, filters]);

  const likedIds = useMemo(() => likedProductIdSet(likedItems), [likedItems]);

  const artistBySlug = useMemo(() => new Map(storefrontArtists.map((a) => [a.slug, a])), [storefrontArtists]);

  const collections = useMemo(() => discoverTilesToCollections(DISCOVER_CATEGORIES), []);

  const folderCatalogCounts = useMemo(() => {
    const map = new Map<string, { h: number; t: number }>();
    for (const p of productHits) {
      const cur = map.get(p.artistSlug) ?? { h: 0, t: 0 };
      if (p.kind === "hoodie") cur.h += 1;
      else cur.t += 1;
      map.set(p.artistSlug, cur);
    }
    return map;
  }, [productHits]);

  const productHitsPersonalized = useMemo(() => {
    const taste = sortSearchHitsByTaste(productHits, likedItems) as EnrichedSearchProductHit[];
    return sortProductsByDiscoveryRank(taste, personalization);
  }, [productHits, likedItems, personalization]);

  const ctx = useMemo<UnifiedSearchContext>(
    () => ({
      artists: storefrontArtists,
      products: productHits,
      collections,
      trends: TRENDING_EDITORIAL,
      likedProductIds: likedIds,
      personalization,
      artistBySlug,
    }),
    [storefrontArtists, productHits, collections, likedIds, personalization, artistBySlug],
  );

  const groupedResults = useMemo(() => {
    if (!hasActiveQuery) return null;
    const cached = cacheRef.current.get(debouncedTrim, filters);
    if (cached) return cached;
    return runUnifiedSearch(debouncedTrim, filters, ctx);
  }, [hasActiveQuery, debouncedTrim, filters, ctx]);

  useEffect(() => {
    if (!hasActiveQuery || !groupedResults) return;
    cacheRef.current.set(debouncedTrim, filters, groupedResults);
  }, [hasActiveQuery, debouncedTrim, filters, groupedResults]);

  const pushRecent = useCallback((term: string) => {
    const t = term.trim();
    if (!t) return;
    setRecents((prev) => {
      const next = [t, ...prev.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 8);
      writeRecents(next);
      return next;
    });
  }, []);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") pushRecent(q);
    },
    [pushRecent, q],
  );

  const totalHits =
    groupedResults == null
      ? 0
      : groupedResults.artists.length +
        groupedResults.products.length +
        groupedResults.collections.length +
        groupedResults.trends.length;

  useEffect(() => {
    if (!hasActiveQuery) lastSearchSig.current = null;
  }, [hasActiveQuery]);

  const onSearchResultPick = useCallback(
    (pick: SearchResultPickInfo) => {
      if (!debouncedTrim) return;
      getAnalyticsTracker().trackSearch(pathname, {
        phase: "select",
        query: debouncedTrim,
        result_count: totalHits,
        selected_kind: pick.kind,
        selected_href: pick.href,
        selected_label: pick.label ?? null,
      });
      if (pick.kind === "collection") {
        getAnalyticsTracker().trackCollectionView(pathname, {
          href: pick.href,
          title: pick.label ?? null,
          query: debouncedTrim,
        });
      }
    },
    [debouncedTrim, totalHits, pathname],
  );

  useEffect(() => {
    if (!hasActiveQuery || isPending || !groupedResults) return;
    let filtersKey = "";
    try {
      filtersKey = JSON.stringify(filters);
    } catch {
      filtersKey = "x";
    }
    const sig = `${debouncedTrim}|${totalHits}|${filtersKey}`;
    if (lastSearchSig.current === sig) return;
    lastSearchSig.current = sig;
    const t = window.setTimeout(() => {
      getAnalyticsTracker().trackSearch(pathname, {
        phase: "impression",
        query: debouncedTrim,
        result_count: totalHits,
      });
    }, 450);
    return () => window.clearTimeout(t);
  }, [hasActiveQuery, isPending, groupedResults, debouncedTrim, totalHits, filters, pathname]);

  const noResults = hasActiveQuery && !isPending && groupedResults !== null && totalHits === 0;

  const lastZeroSig = useRef<string | null>(null);
  useEffect(() => {
    if (!noResults) return;
    const sig = debouncedTrim;
    if (lastZeroSig.current === sig) return;
    lastZeroSig.current = sig;
    getAnalyticsTracker().trackSearchZeroResults(pathname, { query: debouncedTrim });
  }, [noResults, debouncedTrim, pathname]);

  return (
    <div className="relative min-h-dvh bg-[#050508] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[min(42vh,22rem)] overflow-hidden" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_50%_-15%,rgba(45,107,255,0.14),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_100%_35%,rgba(200,180,255,0.06),transparent_50%)]" />
        <div className="grain-overlay absolute inset-0 opacity-[0.045]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#050508]/92 px-4 pb-4 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-2xl backdrop-saturate-150 sm:px-6">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
        >
          <SearchHeader />
        </motion.div>

        <label htmlFor="salvya-search-q" className="sr-only">
          Search creators and products
        </label>
        <div className="relative mt-5 rounded-full border border-white/[0.12] bg-white/[0.06] p-1 shadow-[0_12px_48px_-20px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-xl">
          <div className="flex min-h-[52px] items-center gap-2.5 pl-4 pr-2">
            <SearchIcon className="shrink-0 text-white/35" />
            <input
              ref={inputRef}
              id="salvya-search-q"
              type="search"
              enterKeyHint="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search creators, hoodies, tees, collections…"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className="min-h-[48px] flex-1 border-0 bg-transparent py-2 text-[15px] text-white outline-none ring-0 placeholder:text-white/32"
            />
          </div>
        </div>

        {trimmed.length > 0 ? (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.28, ease }}
          >
            <SearchFilterBar filters={filters} onChange={setFilters} />
          </motion.div>
        ) : null}
      </header>

      <div className="relative z-[1] mx-auto w-full max-w-lg px-4 py-6 sm:px-6 sm:pb-28">
        {!hasActiveQuery && recents.length > 0 ? (
          <motion.section
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, ease }}
            className="mb-8"
          >
            <h2 className="m-0 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/38">Recent</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {recents.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setQ(term)}
                  className="rounded-full border border-white/[0.1] bg-white/[0.06] px-4 py-2 text-[13px] font-medium text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-[transform,background-color] hover:bg-white/[0.1] active:scale-[0.98]"
                >
                  {term}
                </button>
              ))}
            </div>
          </motion.section>
        ) : null}

        {!hasActiveQuery ? (
          <>
            <TrendingSection cards={TRENDING_EDITORIAL} reduceMotion={Boolean(reduceMotion)} />
            <ArtistsRow
              artists={storefrontArtists}
              folderCatalogCounts={folderCatalogCounts}
              reduceMotion={Boolean(reduceMotion)}
            />
            <FeaturedPiecesGrid hits={productHitsPersonalized.slice(0, 8)} reduceMotion={Boolean(reduceMotion)} />
            <DiscoverCategories tiles={DISCOVER_CATEGORIES} reduceMotion={Boolean(reduceMotion)} />
          </>
        ) : null}

        {hasActiveQuery && isPending ? <SearchResultsSkeleton /> : null}

        {hasActiveQuery && !isPending && groupedResults && totalHits > 0 ? (
          <SearchResultsView
            grouped={groupedResults}
            folderCatalogCounts={folderCatalogCounts}
            reduceMotion={Boolean(reduceMotion)}
            visibleProductCount={productShow}
            onShowMore={() => setProductShow((n) => n + 12)}
            onResultPick={onSearchResultPick}
          />
        ) : null}

        {noResults ? (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease }}
            className="rounded-3xl border border-white/[0.08] bg-white/[0.03] px-5 py-10 text-center backdrop-blur-md"
          >
            <p className="m-0 text-[1.2rem] font-semibold tracking-[-0.03em] text-white/95">No matches</p>
            <p className="mx-auto mt-2 max-w-xs text-[14px] leading-relaxed text-white/45">
              Try another creator, product, or editorial lane — filters may hide results too.
            </p>
            <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">Suggested</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {SUGGESTED_QUERIES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setQ(s)}
                  className="rounded-full border border-white/[0.1] bg-white/[0.06] px-3 py-1.5 text-[12px] font-medium text-white/80 hover:bg-white/[0.1]"
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="mt-8 border-t border-white/[0.06] pt-6 text-left">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">Popular storefronts</p>
              <ul className="mt-3 flex flex-col gap-2">
                {storefrontArtists.slice(0, 4).map((a) => (
                  <li key={a.slug}>
                    <Link
                      href={`/artist/${a.slug}`}
                      prefetch={false}
                      className="flex items-center gap-2 rounded-xl px-2 py-2 text-[14px] font-medium text-white/80 hover:bg-white/[0.05]"
                    >
                      <span className="h-8 w-8 overflow-hidden rounded-lg bg-white/10">
                        <img src={a.profileImage} alt="" className="h-full w-full object-cover" />
                      </span>
                      {a.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
