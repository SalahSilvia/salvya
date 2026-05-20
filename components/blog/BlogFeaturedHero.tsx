import Link from "next/link";
import { formatBlogDate } from "@/lib/blog/format-blog-date";
import type { BlogPost } from "@/lib/blog/types";

type Props = { post: BlogPost; locale: string };

export function BlogFeaturedHero({ post, locale }: Props) {
  const date = post.publishedAt ? formatBlogDate(post.publishedAt, locale, "long") : null;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative block overflow-hidden rounded-[1.75rem] border border-white/[0.1] shadow-[0_40px_100px_-48px_rgba(0,0,0,0.95)] transition-[border-color,transform] hover:border-[#2D6BFF]/35 active:scale-[0.995]"
    >
      <div className="relative min-h-[min(72vw,420px)] sm:min-h-[380px]">
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a2744] to-[#050508]" aria-hidden />
        )}
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#050508]/96 via-[#050508]/72 to-[#050508]/25"
          aria-hidden
        />
        <div className="grain-overlay absolute inset-0 opacity-[0.08]" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent opacity-90" aria-hidden />

        <div className="relative z-[1] flex h-full min-h-[inherit] flex-col justify-end p-6 sm:p-9 lg:p-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#2D6BFF] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
              Featured
            </span>
            {post.tags.slice(0, 2).map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/15 bg-white/[0.08] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/70 backdrop-blur-sm"
              >
                {t}
              </span>
            ))}
          </div>

          <p className="mt-5 text-[12px] font-medium uppercase tracking-[0.2em] text-white/45">
            {post.readTimeMinutes} min read{date ? ` · ${date}` : ""}
          </p>
          <h2 className="mt-2 max-w-3xl text-[clamp(1.65rem,5vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-white">
            {post.title}
          </h2>
          {post.subtitle ? (
            <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-[#9eb6ff]/90 sm:text-[17px]">{post.subtitle}</p>
          ) : null}
          <p className="mt-3 line-clamp-2 max-w-2xl text-[14px] leading-relaxed text-white/50">{post.excerpt}</p>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.1] px-5 py-2.5 text-[13px] font-semibold text-white backdrop-blur-md transition-[background-color,transform] group-hover:bg-white/[0.16]">
              Read story
              <span className="transition-transform group-hover:translate-x-0.5" aria-hidden>
                →
              </span>
            </span>
            <span className="text-[13px] text-white/40">
              {post.authorName}
              {post.authorRole ? ` · ${post.authorRole}` : ""}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
