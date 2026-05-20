import type { ArtistCard } from "@/lib/site-data";
import type { EnrichedSearchProductHit } from "@/lib/discovery/build-discovery-catalog";
import { rankProductScore } from "@/lib/discovery/ranking";
import { textMatchScore } from "@/lib/discovery/fuzzy";
import type { PersonalizationProfile } from "@/lib/discovery/types";
import type {
  GroupedSearchResults,
  SearchFilters,
  SearchResult,
  TrendBlock,
  ArtistSearchHit,
  ProductSearchHit,
  CollectionSearchHit,
  TrendSearchHit,
  SearchCollection,
} from "@/lib/search/types";

const TYPE_TIER = { artist: 40, product: 30, collection: 20, trend: 10 } as const;

function norm(q: string): string {
  return q.trim().toLowerCase();
}

function scoreArtist(a: ArtistCard, q: string, filters: SearchFilters): number {
  const ql = norm(q);
  let s = 0;
  if (a.statusTag === "LIMITED DROP") s += 25;
  else if (a.statusTag === "AVAILABLE") s += 12;
  if (!ql) {
    s += filters.popularity === "trending" ? 8 : 5;
    return s;
  }
  const text = textMatchScore(q, a.name, a.slug, a.aboutLead) / 100;
  s += text * 100;
  if (filters.availability === "limited" && a.statusTag !== "LIMITED DROP") return -1;
  return s;
}

function scoreProduct(
  hit: EnrichedSearchProductHit,
  q: string,
  filters: SearchFilters,
  profile: PersonalizationProfile | null | undefined,
  artistMap: Map<string, ArtistCard>,
): number {
  const meta = hit.rankMeta;
  if (!meta) return -1;
  const limitedArtist = artistMap.get(hit.artistSlug)?.statusTag === "LIMITED DROP";

  if (filters.availability === "in_stock" && !meta.inStock) return -1;
  if (filters.availability === "limited" && !limitedArtist) return -1;

  const rankScore = rankProductScore(
    {
      query: q,
      title: hit.title,
      artistSlug: hit.artistSlug,
      artistLabel: hit.artistLabel,
      category: meta.category,
      priceCents: meta.priceCents,
      inStock: meta.inStock,
      publishedAt: meta.publishedAt,
      productId: meta.dbProductId,
      likedProductId: hit.productId,
      metrics: meta.metrics,
    },
    profile,
  );

  if (!norm(q) && rankScore < 1) return -1;

  const textOnly = textMatchScore(q, hit.title, hit.artistLabel, hit.artistSlug);
  if (norm(q) && textOnly < 35) return -1;

  return rankScore + (limitedArtist ? 8 : 0);
}

function scoreCollection(c: SearchCollection, q: string): number {
  const text = textMatchScore(q, c.title, c.description, c.id);
  if (!norm(q)) return text > 0 ? 12 : 8;
  if (text < 35) return -1;
  return text;
}

function scoreTrend(t: TrendBlock, q: string): number {
  const text = textMatchScore(q, t.title, t.sub);
  if (!norm(q)) return 12;
  if (text < 35) return -1;
  return text;
}

function cmpResults(a: SearchResult, b: SearchResult): number {
  const tier = (r: SearchResult) =>
    r.type === "artist"
      ? TYPE_TIER.artist
      : r.type === "product"
        ? TYPE_TIER.product
        : r.type === "collection"
          ? TYPE_TIER.collection
          : TYPE_TIER.trend;
  const td = tier(b) - tier(a);
  if (td !== 0) return td;
  return b.score - a.score;
}

export type RankedSearchContext = {
  artists: ArtistCard[];
  products: EnrichedSearchProductHit[];
  collections: SearchCollection[];
  trends: TrendBlock[];
  personalization?: PersonalizationProfile | null;
  artistBySlug: Map<string, ArtistCard>;
};

/** Ranked discovery search — weighted scoring, fuzzy text, personalization. */
export function runRankedSearch(
  query: string,
  filters: SearchFilters,
  ctx: RankedSearchContext,
): GroupedSearchResults {
  const ql = norm(query);
  const out: SearchResult[] = [];

  const allowArtists = filters.category === "all" || filters.category === "artists";
  const allowProducts = filters.category === "all" || filters.category === "products";
  const allowCollections =
    filters.category === "all" || filters.category === "drops" || filters.category === "products";
  const allowTrends = filters.category === "all" || filters.category === "drops";

  if (allowArtists) {
    for (const a of ctx.artists) {
      const score = scoreArtist(a, query, filters);
      if (score >= 0 && (ql || score > 0)) out.push({ type: "artist", data: a, score });
    }
  }

  if (allowProducts) {
    for (const p of ctx.products) {
      const score = scoreProduct(p, query, filters, ctx.personalization, ctx.artistBySlug);
      if (score >= 0) out.push({ type: "product", data: p, score });
    }
  }

  if (allowCollections) {
    for (const c of ctx.collections) {
      const score = scoreCollection(c, query);
      if (score >= 0 && (ql || score > 0)) out.push({ type: "collection", data: c, score });
    }
  }

  if (allowTrends) {
    for (const t of ctx.trends) {
      const score = scoreTrend(t, query);
      if (score >= 0 && (ql || score > 0)) out.push({ type: "trend", data: t, score });
    }
  }

  if (filters.popularity === "trending") {
    out.sort((a, b) => {
      if (a.type === "product" && b.type === "product") return b.score - a.score;
      if (a.type === "product") return -1;
      if (b.type === "product") return 1;
      return cmpResults(a, b);
    });
  } else {
    out.sort(cmpResults);
  }

  return {
    artists: out.filter((r): r is ArtistSearchHit => r.type === "artist"),
    products: out.filter((r): r is ProductSearchHit => r.type === "product"),
    collections: out.filter((r): r is CollectionSearchHit => r.type === "collection"),
    trends: out.filter((r): r is TrendSearchHit => r.type === "trend"),
  };
}

/** Default browse rail: top ranked products with no query. */
export function sortProductsByDiscoveryRank(
  products: EnrichedSearchProductHit[],
  profile?: PersonalizationProfile | null,
): EnrichedSearchProductHit[] {
  return [...products]
    .map((p) => ({
      p,
      score: scoreProduct(p, "", { category: "all", availability: "all", popularity: "all" }, profile, new Map()),
    }))
    .filter((x) => x.score >= 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);
}
