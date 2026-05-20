"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { formatBlogDate } from "@/lib/blog/format-blog-date";
import type { BlogPost } from "@/lib/blog/types";

const ease = [0.22, 1, 0.36, 1] as const;

type Props = {
  posts: BlogPost[];
  locale: string;
};

export function ShopBlogSection({ posts, locale }: Props) {
  const reduceMotion = useReducedMotion();
  if (!posts.length) return null;

  const featured = posts[0]!;
  const strip = posts.slice(1, 5);

  const fade = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.2 },
        transition: { duration: 0.65, ease },
      };

  return (
    <section
      className="relative overflow-hidden border-t border-white/[0.06] bg-[#050508] pb-14 pt-12"
      aria-labelledby="shop-journal"
    >
      <div
        className="pointer-events-none absolute -right-1/3 top-8 h-72 w-72 rounded-full bg-violet-600/12 blur-[90px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-1/4 bottom-0 h-80 w-80 rounded-full bg-[#2D6BFF]/15 blur-[100px]"
        aria-hidden
      />
      <div className="grain-overlay pointer-events-none absolute inset-0 opacity-[0.035]" aria-hidden />

      <div className="relative mx-auto max-w-md px-5">
        <motion.div {...fade} className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#7ea3ff]/90">
              Fit journal
            </p>
            <h2
              id="shop-journal"
              className="mt-2 text-[clamp(1.45rem,5.8vw,1.8rem)] font-semibold leading-[1.06] tracking-[-0.045em] text-white"
            >
              How the pieces{" "}
              <span className="bg-gradient-to-r from-white via-[#d4e0ff] to-[#5b8cff] bg-clip-text text-transparent">
                wear
              </span>
            </h2>
            <p className="mt-2 max-w-[16.5rem] text-[13px] leading-relaxed text-white/45">
              On-body styling notes for live hoodies and tees — shot on model, linked to the rack.
            </p>
          </div>
          <Link
            href="/blogs"
            className="shrink-0 rounded-full border border-white/[0.14] bg-white/[0.06] px-4 py-2 text-[11px] font-semibold text-white/85 backdrop-blur-sm transition-[background-color,color] hover:bg-white/[0.11] hover:text-white"
          >
            All stories
          </Link>
        </motion.div>

        <JournalFeatureCard post={featured} locale={locale} reduceMotion={reduceMotion} />

        {strip.length > 0 ? (
          <div className="mt-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
                More looks
              </p>
              <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" aria-hidden />
            </div>
            <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-2 [scroll-snap-type:x_mandatory] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {strip.map((post, i) => (
                <JournalStripCard
                  key={post.id}
                  post={post}
                  locale={locale}
                  index={String(i + 2).padStart(2, "0")}
                  reduceMotion={reduceMotion}
                  delay={i * 0.07}
                />
              ))}
            </div>
          </div>
        ) : null}

        <motion.p
          {...(reduceMotion
            ? {}
            : { initial: { opacity: 0 }, whileInView: { opacity: 1 }, viewport: { once: true } })}
          className="mt-6 text-center text-[10px] font-medium uppercase tracking-[0.22em] text-white/22"
        >
          {posts.length} fit guides · Swipe the strip
        </motion.p>
      </div>
    </section>
  );
}

function JournalFeatureCard({
  post,
  locale,
  reduceMotion,
}: {
  post: BlogPost;
  locale: string;
  reduceMotion: boolean | null;
}) {
  const date = post.publishedAt ? formatBlogDate(post.publishedAt, locale, "medium") : null;
  const tag = post.tags[0];

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease, delay: 0.06 }}
    >
      <Link
        href={`/blog/${post.slug}`}
        className="group relative block overflow-hidden rounded-[1.35rem] border border-white/[0.1] bg-[#0a0a10] shadow-[0_32px_80px_-42px_rgba(45,107,255,0.5)]"
      >
        <div className="relative min-h-[min(105vw,26rem)]">
          {post.coverImage ? (
            <img
              src={post.coverImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a2744] to-[#050508]" />
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/40 to-[#050508]/15" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#050508]/75 via-transparent to-transparent" />

          <div className="absolute left-0 top-0 z-10 flex w-full items-start justify-between gap-2 p-4">
            <span className="font-mono text-[11px] font-medium tracking-[0.2em] text-white/35">01</span>
            <div className="flex flex-wrap justify-end gap-1.5">
              <span className="rounded-full border border-[#2D6BFF]/35 bg-[#2D6BFF]/20 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#c8d6ff] backdrop-blur-md">
                On model
              </span>
              {tag ? (
                <span className="rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-white/90 backdrop-blur-md">
                  {tag}
                </span>
              ) : null}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-10 p-5 pb-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9eb6ff]">
              {post.readTimeMinutes} min read{date ? ` · ${date}` : ""}
            </p>
            <h3 className="mt-2 line-clamp-3 text-[1.35rem] font-semibold leading-[1.1] tracking-[-0.04em] text-white sm:text-[1.45rem]">
              {post.title}
            </h3>
            {post.subtitle ? (
              <p className="mt-1.5 line-clamp-1 text-[13px] text-[#8eb6ff]/85">{post.subtitle}</p>
            ) : null}
            <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-white/50">{post.excerpt}</p>

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
              <p className="truncate text-[11px] text-white/38">
                {post.authorName}
                {post.authorRole ? ` · ${post.authorRole}` : ""}
              </p>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.08] px-4 py-2 text-[12px] font-semibold text-white backdrop-blur-md transition-[background-color,transform] group-hover:bg-white/[0.14] group-active:scale-[0.98]">
                Read guide
                <span className="transition-transform group-hover:translate-x-0.5" aria-hidden>
                  →
                </span>
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function JournalStripCard({
  post,
  locale,
  index,
  reduceMotion,
  delay,
}: {
  post: BlogPost;
  locale: string;
  index: string;
  reduceMotion: boolean | null;
  delay: number;
}) {
  const date = post.publishedAt ? formatBlogDate(post.publishedAt, locale, "medium") : null;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, ease, delay }}
      className="w-[min(44vw,9.25rem)] shrink-0 [scroll-snap-align:start]"
    >
      <Link
        href={`/blog/${post.slug}`}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0a0a10] transition-[border-color,transform] hover:border-[#2D6BFF]/30 active:scale-[0.99]"
      >
        <div className="relative aspect-[4/5] overflow-hidden">
          {post.coverImage ? (
            <img
              src={post.coverImage}
              alt=""
              className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.05]"
            />
          ) : (
            <div className="h-full bg-white/[0.04]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/20 to-transparent" />
          <span className="absolute left-2.5 top-2.5 font-mono text-[10px] font-medium text-white/35">
            {index}
          </span>
          {post.tags[0] ? (
            <span className="absolute right-2.5 top-2.5 max-w-[70%] truncate rounded-full border border-white/10 bg-[#050508]/65 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white/85 backdrop-blur-sm">
              {post.tags[0]}
            </span>
          ) : null}
        </div>
        <div className="space-y-1 p-3">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/35">
            {post.readTimeMinutes}m{date ? ` · ${date}` : ""}
          </p>
          <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug tracking-[-0.02em] text-white group-hover:text-[#c5d4ff]">
            {post.title}
          </h3>
        </div>
      </Link>
    </motion.div>
  );
}
