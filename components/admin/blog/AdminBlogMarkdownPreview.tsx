"use client";

import { BlogMarkdown } from "@/lib/blog/markdown";

/** Light-theme markdown preview for the admin editor. */
export function AdminBlogMarkdownPreview({ markdown }: { markdown: string }) {
  return (
    <div className="prose-admin-preview rounded-xl border border-[#e3e5e7] bg-white p-5">
      <BlogMarkdown
        markdown={markdown || "_Start writing — use **bold**, ## headings, - lists, and `![alt](url)` for images._"}
        className="[&_h2]:!text-[#202223] [&_h3]:!text-[#303233] [&_p]:!text-[#454749] [&_li]:!text-[#454749] [&_strong]:!text-[#202223] [&_blockquote]:!border-[#2D6BFF] [&_blockquote]:!text-[#6d7175]"
      />
    </div>
  );
}
