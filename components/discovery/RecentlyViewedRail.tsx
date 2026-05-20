"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { RecentViewItem } from "@/lib/discovery/recent-views";

type Props = {
  title?: string;
  limit?: number;
  className?: string;
};

export function RecentlyViewedRail({
  title = "Recently viewed",
  limit = 8,
  className = "",
}: Props) {
  const [items, setItems] = useState<RecentViewItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/me/recent-views", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((data: { ok?: boolean; items?: RecentViewItem[] }) => {
        if (cancelled) return;
        if (data.ok && Array.isArray(data.items)) {
          setItems(data.items.slice(0, limit));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [limit]);

  if (loaded && items.length === 0) return null;

  return (
    <section className={`space-y-3 ${className}`} aria-label={title}>
      <h2 className="text-[13px] font-semibold uppercase tracking-wide text-white/45">{title}</h2>
      {!loaded ? (
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[11rem] w-[9.5rem] shrink-0 animate-pulse rounded-xl bg-white/[0.06]" />
          ))}
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {items.map((item) => (
            <Link
              key={item.productId}
              href={item.href}
              className="group w-[9.5rem] shrink-0 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03]"
            >
              <div className="relative aspect-[4/5] bg-zinc-900">
                {item.imageSrc ? (
                  <Image
                    src={item.imageSrc}
                    alt={item.title}
                    fill
                    className="object-cover transition group-hover:scale-[1.02]"
                    sizes="152px"
                  />
                ) : null}
              </div>
              <div className="space-y-0.5 p-2.5">
                <p className="line-clamp-2 text-[12px] font-medium text-white/90">{item.title}</p>
                <p className="text-[11px] text-white/45">{item.priceLabel}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
