"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BlogFeaturedHero } from "@/components/blog/BlogFeaturedHero";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { AmbientBackground } from "@/components/home/AmbientBackground";
import type { BlogPost } from "@/lib/blog/types";

type Props = { posts: BlogPost[]; locale: string };

const ease = [0.22, 1, 0.36, 1] as const;

function collectTags(posts: BlogPost[]): string[] {
  const set = new Set<string>();
  for (const p of posts) {
    for (const t of p.tags) set.add(t);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

function indexStats(posts: BlogPost[]) {
  const topics = collectTags(posts).length;
  const readMins = posts.reduce((sum, p) => sum + p.readTimeMinutes, 0);
  return { articles: posts.length, topics, readMins };
}

export function BlogIndexExperience({ posts, locale }: Props) {
  const router = useRouter();
  const pathname = usePathname() ?? "/blogs";
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();

  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string | null>(null);

  useEffect(() => {
    const fromUrl = searchParams.get("tag");
    if (fromUrl && posts.some((p) => p.tags.includes(fromUrl))) {
      setTag(fromUrl);
    } else if (!fromUrl) {
      setTag(null);
    }
  }, [searchParams, posts]);

  const setTagFilter = useCallback(
    (next: string | null) => {
      setTag(next);
      const params = new URLSearchParams(searchParams.toString());
      if (next) params.set("tag", next);
      else params.delete("tag");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const allTags = useMemo(() => collectTags(posts), [posts]);
  const stats = useMemo(() => indexStats(posts), [posts]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return posts.filter((p) => {
      if (tag && !p.tags.includes(tag)) return false;
      if (!needle) return true;
      const hay = `${p.title} ${p.subtitle} ${p.excerpt} ${p.tags.join(" ")}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [posts, q, tag]);

  const hero = filtered.find((p) => p.featured) ?? filtered[0];
  const rest = hero ? filtered.filter((p) => p.id !== hero.id) : filtered;
  const latest = rest.slice(0, 6);
  const archive = rest.slice(6);

  const fadeUp = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.12 },
        transition: { duration: 0.5, ease },
      };

  return (
    <div className="relative min-h-dvh bg-[#050508] text-white">
      <AmbientBackground />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-[#2D6BFF]/40 to-transparent" />

      <div className="relative mx-auto max-w-6xl px-4 pb-32 pt-[max(5.5rem,calc(env(safe-area-inset-top)+4rem))]">
        <header className="mb-8 lg:mb-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#2D6BFF]/85">Salvya blogs</p>
              <h1 className="mt-3 text-[2.35rem] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-[3.15rem]">
                Streetwear culture,
                <span className="block text-white/55">explained.</span>
              </h1>
              <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-white/50">
                Oversized fits, Moroccan streetwear, drops, and the stories behind Salvya — written for the new generation
                of fashion.
              </p>
            </div>

            {posts.length > 0 ? (
              <ul className="flex flex-wrap gap-2 lg:max-w-xs lg:justify-end">
                {[
                  { label: "Stories", value: String(stats.articles) },
                  { label: "Topics", value: String(stats.topics) },
                  { label: "Reading", value: `${stats.readMins}m` },
                ].map((s) => (
                  <li
                    key={s.label}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-center backdrop-blur-sm"
                  >
                    <p className="text-[1.35rem] font-semibold tabular-nums tracking-tight text-white">{s.value}</p>
                    <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/38">{s.label}</p>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </header>

        <motion.div
          className="mb-8 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3 sm:p-4"
          {...fadeUp}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative flex-1">
              <span className="sr-only">Search articles</span>
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by title, topic, or keyword…"
                className="w-full rounded-xl border border-white/[0.06] bg-[#050508]/60 py-3 pl-11 pr-4 text-[14px] text-white placeholder:text-white/35 focus:border-[#2D6BFF]/50 focus:outline-none focus:ring-2 focus:ring-[#2D6BFF]/20"
              />
              <svg
                viewBox="0 0 24 24"
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <circle cx="11" cy="11" r="7" />
                <path strokeLinecap="round" d="M20 20l-3-3" />
              </svg>
            </label>
            <p className="shrink-0 px-1 text-[13px] tabular-nums text-white/40">
              {filtered.length} of {posts.length} {filtered.length === 1 ? "story" : "stories"}
            </p>
          </div>

          {allTags.length ? (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-white/[0.06] pt-4">
              <button
                type="button"
                onClick={() => setTagFilter(null)}
                className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${
                  !tag
                    ? "bg-[#2D6BFF] text-white shadow-[0_0_24px_-6px_rgba(45,107,255,0.55)]"
                    : "border border-white/10 bg-white/[0.04] text-white/55 hover:border-white/20 hover:text-white"
                }`}
              >
                All topics
              </button>
              {allTags.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTagFilter(tag === t ? null : t)}
                  className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold capitalize transition-colors ${
                    tag === t
                      ? "bg-white text-[#050508]"
                      : "border border-white/10 bg-white/[0.04] text-white/55 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          ) : null}
        </motion.div>

        {posts.length === 0 ? (
          <EmptyPanel>
            New stories are on the way.{" "}
            <Link href="/shop" className="font-semibold text-[#8eb6ff] hover:underline">
              Browse the shop
            </Link>
          </EmptyPanel>
        ) : filtered.length === 0 ? (
          <EmptyPanel>
            No stories match{tag ? ` “${tag}”` : ""}.{" "}
            <button
              type="button"
              onClick={() => {
                setQ("");
                setTagFilter(null);
              }}
              className="font-semibold text-[#8eb6ff]"
            >
              Clear filters
            </button>
          </EmptyPanel>
        ) : (
          <div className="space-y-14 lg:space-y-16">
            {hero ? (
              <motion.section {...fadeUp}>
                <BlogFeaturedHero post={hero} locale={locale} />
              </motion.section>
            ) : null}

            {latest.length ? (
              <motion.section {...fadeUp}>
                <div className="mb-6 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/35">Latest</h2>
                    <p className="mt-1 text-[14px] text-white/45">Fresh reads from the Salvya editorial desk.</p>
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {latest.map((post, i) => (
                    <motion.div
                      key={post.id}
                      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, ease, delay: i * 0.04 }}
                    >
                      <BlogPostCard post={post} locale={locale} />
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            ) : null}

            {archive.length ? (
              <motion.section {...fadeUp}>
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/35">Archive</h2>
                <p className="mt-1 mb-5 text-[14px] text-white/45">Earlier stories worth revisiting.</p>
                <div className="flex flex-col gap-3">
                  {archive.map((post) => (
                    <BlogPostCard key={post.id} post={post} locale={locale} variant="row" />
                  ))}
                </div>
              </motion.section>
            ) : null}

            <motion.section
              className="relative overflow-hidden rounded-[1.75rem] border border-[#2D6BFF]/25 bg-gradient-to-br from-[#2D6BFF]/18 via-[#0a1020]/90 to-[#050508] p-8 sm:p-10"
              {...fadeUp}
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#2D6BFF]/30 blur-3xl" aria-hidden />
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#9eb6ff]/90">Wear the story</p>
              <h2 className="mt-2 max-w-md text-[1.5rem] font-semibold leading-tight tracking-[-0.03em] text-white sm:text-[1.75rem]">
                Ready to shop the drops behind these articles?
              </h2>
              <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-white/50">
                Limited hoodies and tees from Salvya creators — same culture, on your rack.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/shop"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-white px-5 text-[14px] font-semibold text-[#050508] transition-transform hover:bg-white/95 active:scale-[0.99]"
                >
                  Shop merch
                </Link>
                <Link
                  href="/"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/20 bg-white/[0.06] px-5 text-[14px] font-semibold text-white transition-colors hover:bg-white/[0.1]"
                >
                  Back to home
                </Link>
              </div>
            </motion.section>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyPanel({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-14 text-center text-[15px] leading-relaxed text-white/45">
      {children}
    </p>
  );
}
