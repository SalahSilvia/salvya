import Link from "next/link";
import { formatBlogDate } from "@/lib/blog/format-blog-date";
import type { BlogPost } from "@/lib/blog/types";

type Props = {
  post: BlogPost;
  locale: string;
  variant?: "grid" | "row" | "shop-row" | "shop";
};

const coverImgClass =
  "absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]";

export function BlogPostCard({ post, locale, variant = "grid" }: Props) {
  const date = post.publishedAt ? formatBlogDate(post.publishedAt, locale, "medium") : null;

  if (variant === "shop-row") {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] transition-[border-color,background-color,transform] hover:border-white/[0.14] hover:bg-white/[0.05] active:scale-[0.995] sm:flex-row sm:gap-5 sm:p-4"
      >
        <div className="relative aspect-[4/5] w-full shrink-0 overflow-hidden rounded-t-xl bg-[#0a0a0f] sm:w-[9.5rem] sm:rounded-xl">
          {post.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.coverImage} alt="" className={coverImgClass} />
          ) : null}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050508]/50 to-transparent" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center p-3 pt-3 sm:p-0 sm:py-0.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/38">
            {post.readTimeMinutes} min{date ? ` · ${date}` : ""}
          </p>
          <h3 className="mt-1.5 line-clamp-3 text-[16px] font-semibold leading-snug tracking-[-0.02em] text-white group-hover:text-[#c5d4ff]">
            {post.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-white/45">{post.excerpt}</p>
          <p className="mt-2 text-[11px] font-medium text-[#9eb6ff]/80">On-model fit guide →</p>
        </div>
      </Link>
    );
  }

  if (variant === "row") {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="group flex gap-4 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3 transition-[border-color,background-color,transform] hover:border-white/[0.14] hover:bg-white/[0.05] active:scale-[0.995] sm:gap-5 sm:p-4"
      >
        <div className="relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-xl bg-[#0a0a0f] sm:w-36">
          {post.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050508]/60 to-transparent" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center py-0.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/38">
            {post.readTimeMinutes} min{date ? ` · ${date}` : ""}
          </p>
          <h3 className="mt-1.5 line-clamp-2 text-[16px] font-semibold leading-snug tracking-[-0.02em] text-white group-hover:text-[#c5d4ff]">
            {post.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-white/45">{post.excerpt}</p>
          <p className="mt-2 text-[11px] text-white/32">
            {post.authorName}
            {post.tags[0] ? ` · ${post.tags[0]}` : ""}
          </p>
        </div>
        <span
          className="hidden shrink-0 self-center pr-2 text-white/25 transition-[transform,color] group-hover:translate-x-0.5 group-hover:text-white/60 sm:inline"
          aria-hidden
        >
          →
        </span>
      </Link>
    );
  }

  if (variant === "shop") {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] transition-[border-color,transform] hover:border-[#2D6BFF]/25 hover:bg-white/[0.05] active:scale-[0.99]"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-[#0a0a0f]">
          {post.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.coverImage} alt="" className={coverImgClass} />
          ) : null}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050508]/70 via-transparent to-transparent" />
          {post.tags[0] ? (
            <span className="absolute left-2.5 top-2.5 rounded-full border border-white/10 bg-[#050508]/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white/90 backdrop-blur-sm">
              {post.tags[0]}
            </span>
          ) : null}
        </div>
        <div className="space-y-1.5 p-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/38">
            {post.readTimeMinutes} min{date ? ` · ${date}` : ""}
          </p>
          <h2 className="line-clamp-2 text-[14px] font-semibold leading-snug tracking-[-0.02em] text-white group-hover:text-[#c5d4ff]">
            {post.title}
          </h2>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-white/[0.08] bg-white/[0.03] shadow-[0_24px_64px_-32px_rgba(0,0,0,0.85)] transition-[border-color,transform] hover:border-[#2D6BFF]/25 hover:bg-white/[0.05] active:scale-[0.99]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[#0a0a0f]">
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/35 to-transparent" />
        {post.tags[0] ? (
          <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-[#050508]/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/90 backdrop-blur-md">
            {post.tags[0]}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col space-y-2 p-4 sm:p-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/38">
          {post.readTimeMinutes} min read{date ? ` · ${date}` : ""}
        </p>
        <h2 className="text-lg font-semibold leading-snug tracking-[-0.02em] text-white group-hover:text-[#c5d4ff]">
          {post.title}
        </h2>
        {post.subtitle ? <p className="line-clamp-1 text-[13px] text-[#8eb6ff]/80">{post.subtitle}</p> : null}
        <p className="line-clamp-2 flex-1 text-[13px] leading-relaxed text-white/45">{post.excerpt}</p>
        <div className="flex items-center justify-between gap-2 pt-2">
          <p className="truncate text-[12px] text-white/35">
            {post.authorName}
            {post.authorRole ? ` · ${post.authorRole}` : ""}
          </p>
          <span className="shrink-0 text-[12px] font-semibold text-[#2D6BFF]/80 opacity-0 transition-opacity group-hover:opacity-100">
            Read →
          </span>
        </div>
      </div>
    </Link>
  );
}
