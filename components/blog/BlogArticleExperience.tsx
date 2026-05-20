"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { extractBlogHeadings } from "@/lib/blog/blog-headings";
import { BlogMarkdown } from "@/lib/blog/markdown";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { AmbientBackground } from "@/components/home/AmbientBackground";
import { formatBlogDate } from "@/lib/blog/format-blog-date";
import type { BlogPost } from "@/lib/blog/types";

type Props = { post: BlogPost; related: BlogPost[]; locale: string };

const ease = [0.22, 1, 0.36, 1] as const;

export function BlogArticleExperience({ post, related, locale }: Props) {
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const reduceMotion = useReducedMotion();
  const headings = useMemo(() => extractBlogHeadings(post.bodyMd), [post.bodyMd]);

  const date = post.publishedAt ? formatBlogDate(post.publishedAt, locale, "long") : null;

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? Math.min(100, (el.scrollTop / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <article className="relative min-h-dvh bg-[#050508] text-white">
      <div className="fixed inset-x-0 top-0 z-50 h-0.5 bg-[#2D6BFF]/30" aria-hidden>
        <div className="h-full bg-[#2D6BFF] transition-[width] duration-150" style={{ width: `${progress}%` }} />
      </div>

      <AmbientBackground />

      <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-[max(5.5rem,calc(env(safe-area-inset-top)+4rem))]">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-14">
          <div className="min-w-0 max-w-3xl lg:max-w-none">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link
                href="/blogs"
                className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#8eb6ff] transition-colors hover:text-white"
              >
                <span aria-hidden>←</span> All blogs
              </Link>
              <button
                type="button"
                onClick={() => void copyLink()}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[12px] font-semibold text-white/55 transition-colors hover:border-white/20 hover:text-white"
              >
                {copied ? "Link copied" : "Share"}
              </button>
            </div>

            <header className="mt-8">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((t) => (
                  <Link
                    key={t}
                    href={`/blogs?tag=${encodeURIComponent(t)}`}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/55 transition-colors hover:border-[#2D6BFF]/40 hover:text-white"
                  >
                    {t}
                  </Link>
                ))}
              </div>
              <p className="mt-5 text-[12px] font-medium uppercase tracking-[0.18em] text-white/40">
                {post.readTimeMinutes} min read{date ? ` · ${date}` : ""}
              </p>
              <h1 className="mt-3 text-[2.1rem] font-semibold leading-[1.06] tracking-[-0.04em] sm:text-[2.85rem]">
                {post.title}
              </h1>
              {post.subtitle ? (
                <p className="mt-4 text-[18px] leading-relaxed text-[#8eb6ff]/90 sm:text-[20px]">{post.subtitle}</p>
              ) : null}
            </header>

            {post.coverImage ? (
              <motion.div
                className="relative mt-10 aspect-[16/10] overflow-hidden rounded-[1.35rem] border border-white/[0.08] shadow-[0_32px_80px_-40px_rgba(0,0,0,0.9)]"
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.coverImage} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050508]/40 to-transparent" aria-hidden />
              </motion.div>
            ) : null}

            <div className="mt-8 flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2D6BFF]/20 text-[14px] font-bold text-[#9eb6ff]">
                {post.authorName.slice(0, 1).toUpperCase()}
              </span>
              <div>
                <p className="text-[14px] font-semibold text-white">{post.authorName}</p>
                <p className="text-[12px] text-white/45">{post.authorRole || "Salvya Editorial"}</p>
              </div>
            </div>

            <div className="mt-10 lg:mt-12">
              <BlogMarkdown markdown={post.bodyMd} headingIds />
            </div>

            <footer className="mt-16 flex flex-wrap items-center gap-3 border-t border-white/10 pt-8">
              <Link
                href="/shop"
                className="rounded-lg bg-[#2D6BFF] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#1a5ae8]"
              >
                Shop Salvya merch
              </Link>
              <Link href="/blogs" className="text-[13px] font-semibold text-[#8eb6ff] hover:text-white">
                More blogs
              </Link>
            </footer>
          </div>

          {headings.length ? (
            <aside className="hidden lg:block">
              <div className="sticky top-24 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">On this page</p>
                <nav className="mt-3 max-h-[min(50vh,320px)] space-y-2 overflow-y-auto [scrollbar-width:thin]">
                  {headings.map((h) => (
                    <a
                      key={h.id}
                      href={`#${h.id}`}
                      className={`block text-[12px] leading-snug text-white/50 transition-colors hover:text-[#8eb6ff] ${
                        h.level === 3 ? "pl-3" : ""
                      }`}
                    >
                      {h.text}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          ) : null}
        </div>

        {related.length ? (
          <section className="mt-20 border-t border-white/10 pt-12">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/38">Keep reading</h2>
            <p className="mt-1 text-[14px] text-white/45">More from the Salvya blog.</p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <BlogPostCard key={p.id} post={p} locale={locale} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </article>
  );
}
