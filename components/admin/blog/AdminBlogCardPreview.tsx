"use client";

import type { BlogPostStatus } from "@/lib/blog/types";
import { statusLabel } from "@/lib/blog/payload";

type Props = {
  title: string;
  subtitle: string;
  excerpt: string;
  coverImage: string;
  authorName: string;
  authorRole: string;
  tags: string[];
  status: BlogPostStatus;
  readTimeMinutes: number;
  publishedAt: string | null;
};

export function AdminBlogCardPreview({
  title,
  subtitle,
  excerpt,
  coverImage,
  authorName,
  authorRole,
  tags,
  status,
  readTimeMinutes,
  publishedAt,
}: Props) {
  const displayTitle = title.trim() || "Post title";
  const cover = coverImage.trim();

  return (
    <div className="overflow-hidden rounded-xl border border-[#e3e5e7] bg-[#050508] text-white shadow-sm">
      <div className="relative aspect-[16/10] w-full bg-[#0a0a0f]">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-[12px] text-white/35">Cover image</div>
        )}
        <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/90 backdrop-blur-sm">
          {statusLabel(status)}
        </span>
        {tags[0] ? (
          <span className="absolute right-3 top-3 rounded-full bg-[#2D6BFF]/90 px-2.5 py-1 text-[10px] font-semibold text-white">
            {tags[0]}
          </span>
        ) : null}
      </div>
      <div className="space-y-2 p-4">
        <p className="text-[11px] font-medium text-white/45">
          {readTimeMinutes} min read
          {publishedAt ? ` · ${new Date(publishedAt).toLocaleDateString()}` : ""}
        </p>
        <h3 className="text-[17px] font-semibold leading-snug tracking-tight">{displayTitle}</h3>
        {subtitle.trim() ? <p className="text-[13px] text-[#8eb6ff]/90">{subtitle.trim()}</p> : null}
        <p className="line-clamp-3 text-[13px] leading-relaxed text-white/50">
          {excerpt.trim() || "Excerpt appears on the blog index and in search previews."}
        </p>
        <p className="pt-1 text-[12px] text-white/40">
          {authorName}
          {authorRole ? ` · ${authorRole}` : ""}
        </p>
      </div>
    </div>
  );
}
