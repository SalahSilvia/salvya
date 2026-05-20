"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { CreatorProductLinkWithProduct } from "@/lib/creator/product-link-types";
import { CreatorLinksHero, type LinkSort } from "@/components/creator/links/CreatorLinksHero";
import { CreatorLinkCard } from "@/components/creator/links/CreatorLinkCard";
import { creatorCtaButton, creatorEyebrow, creatorIntelligenceWrap } from "@/lib/theme/creator-accent";

type CopyState = { id: string; field: "url" | "code" } | null;

export function CreatorLinksExperience() {
  const reduceMotion = useReducedMotion();
  const [links, setLinks] = useState<CreatorProductLinkWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<LinkSort>("newest");
  const [copyState, setCopyState] = useState<CopyState>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/creator/product-links", { credentials: "include", cache: "no-store" });
      const body = (await res.json()) as { ok?: boolean; links?: CreatorProductLinkWithProduct[]; error?: string };
      if (!res.ok || !body.ok || !body.links) throw new Error(body.error ?? "Failed to load");
      setLinks(body.links);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(() => {
    const totalClicks = links.reduce((n, l) => n + l.clicks_count, 0);
    const totalOrders = links.reduce((n, l) => n + l.orders_count, 0);
    const conversionRate = totalClicks > 0 ? (totalOrders / totalClicks) * 100 : 0;
    return { totalClicks, totalOrders, conversionRate };
  }, [links]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    let list = links;
    if (needle) {
      list = list.filter((l) => {
        const title = l.product?.title?.toLowerCase() ?? "";
        return title.includes(needle) || l.tracking_code.toLowerCase().includes(needle);
      });
    }
    const sorted = [...list];
    if (sort === "clicks") sorted.sort((a, b) => b.clicks_count - a.clicks_count);
    else if (sort === "orders") sorted.sort((a, b) => b.orders_count - a.orders_count);
    else sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return sorted;
  }, [links, query, sort]);

  const topLink = useMemo(() => {
    if (links.length === 0) return null;
    return [...links].sort((a, b) => b.clicks_count - a.clicks_count)[0] ?? null;
  }, [links]);

  async function copyText(id: string, field: "url" | "code", text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyState({ id, field });
      window.setTimeout(() => setCopyState(null), 2000);
    } catch {
      setCopyState(null);
    }
  }

  const fade = reduceMotion ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 } };

  if (loading) {
    return (
      <div className="space-y-8 pb-6">
        <div className="h-[280px] animate-pulse rounded-[1.65rem] bg-white/[0.04]" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-[1.25rem] bg-white/[0.05]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div className="space-y-8 pb-6" {...fade} transition={{ duration: 0.35 }}>
      <CreatorLinksHero
        query={query}
        onQueryChange={setQuery}
        sort={sort}
        onSortChange={setSort}
        linkCount={links.length}
        totalClicks={stats.totalClicks}
        totalOrders={stats.totalOrders}
        conversionRate={stats.conversionRate}
        visibleCount={filtered.length}
      />

      {error ? (
        <p className="rounded-2xl border border-rose-500/25 bg-rose-950/30 px-4 py-3 text-[13px] text-rose-100">
          {error}
        </p>
      ) : null}

      {links.length === 0 ? (
        <EmptyLinks />
      ) : (
        <>
          {topLink && links.length > 1 ? (
            <section className={creatorIntelligenceWrap}>
              <p className={creatorEyebrow}>Top performer</p>
              <p className="mt-2 text-[15px] font-semibold text-white/90">
                {topLink.product?.title ?? "Product"}
              </p>
              <p className="mt-1 text-[13px] text-white/42">
                <span className="font-mono text-fuchsia-200/75">{topLink.tracking_code}</span>
                {" · "}
                {topLink.clicks_count} clicks · {topLink.orders_count} orders
              </p>
            </section>
          ) : null}

          {filtered.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-8 text-center text-[14px] text-white/45">
              No links match your search. Try another product name or tracking code.
            </p>
          ) : (
            <ul className="space-y-3">
              {filtered.map((link, i) => (
                <CreatorLinkCard
                  key={link.id}
                  link={link}
                  index={i}
                  copyField={copyState?.id === link.id ? copyState.field : null}
                  onCopyUrl={() => void copyText(link.id, "url", link.shareUrl)}
                  onCopyCode={() => void copyText(link.id, "code", link.tracking_code)}
                />
              ))}
            </ul>
          )}
        </>
      )}
    </motion.div>
  );
}

function EmptyLinks() {
  return (
    <div className="relative overflow-hidden rounded-[1.35rem] border border-dashed border-violet-500/25 bg-gradient-to-b from-violet-500/[0.06] to-transparent px-6 py-16 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 size-48 -translate-x-1/2 rounded-full bg-fuchsia-500/15 blur-[80px]"
      />
      <p className="relative text-[11px] font-bold uppercase tracking-[0.18em] text-fuchsia-300/60">No links yet</p>
      <p className="relative mt-3 text-[1.35rem] font-semibold tracking-tight text-white/88">
        Start earning with your first promo link
      </p>
      <p className="relative mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-white/42">
        Browse the official catalog, promote a product, and your trackable link will appear here with live click and
        order stats.
      </p>
      <Link
        href="/creator/products"
        className={`relative mt-8 inline-flex min-h-11 items-center justify-center rounded-xl px-6 text-[14px] font-semibold text-white ${creatorCtaButton}`}
      >
        Browse catalog
      </Link>
    </div>
  );
}
