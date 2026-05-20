import type { GroupedSearchResults, SearchFilters } from "@/lib/search/types";

const MAX = 10;

type CacheEntry = {
  results: GroupedSearchResults;
};

function norm(q: string): string {
  return q.trim().toLowerCase();
}

function serialize(query: string, filters: SearchFilters): string {
  return `${norm(query)}|${filters.category}|${filters.availability}|${filters.popularity}`;
}

/** LRU-ish cache for last 10 debounced queries (client-only). */
export class SearchQueryCache {
  private order: string[] = [];
  private map = new Map<string, CacheEntry>();

  get(query: string, filters: SearchFilters): GroupedSearchResults | null {
    const key = serialize(query, filters);
    const hit = this.map.get(key);
    if (!hit) return null;
    const i = this.order.indexOf(key);
    if (i >= 0) this.order.splice(i, 1);
    this.order.push(key);
    return hit.results;
  }

  set(query: string, filters: SearchFilters, results: GroupedSearchResults): void {
    const key = serialize(query, filters);
    const i = this.order.indexOf(key);
    if (i >= 0) this.order.splice(i, 1);
    this.order.push(key);
    this.map.set(key, { results });
    while (this.order.length > MAX) {
      const oldest = this.order.shift();
      if (oldest) this.map.delete(oldest);
    }
  }
}
