"use client";

import { adminBtnSecondary } from "@/components/admin/admin-theme";
import type { MarkdownWrap } from "@/lib/blog/editor-helpers";

const TOOLS: { kind: MarkdownWrap; label: string; title: string }[] = [
  { kind: "h2", label: "H2", title: "Heading 2" },
  { kind: "h3", label: "H3", title: "Subheading" },
  { kind: "bold", label: "B", title: "Bold" },
  { kind: "italic", label: "I", title: "Italic" },
  { kind: "link", label: "Link", title: "Link" },
  { kind: "ul", label: "List", title: "Bullet list" },
  { kind: "quote", label: "Quote", title: "Blockquote" },
  { kind: "code", label: "</>", title: "Code" },
];

type Props = {
  disabled?: boolean;
  onWrap: (kind: MarkdownWrap) => void;
  onInsertImage: () => void;
};

export function AdminBlogMarkdownToolbar({ disabled, onWrap, onInsertImage }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-[#e3e5e7] bg-[#fafbfb] p-1.5">
      {TOOLS.map((t) => (
        <button
          key={t.kind}
          type="button"
          disabled={disabled}
          title={t.title}
          onClick={() => onWrap(t.kind)}
          className="min-w-[2.25rem] rounded-md px-2 py-1.5 text-[12px] font-semibold text-[#202223] transition-colors hover:bg-white disabled:opacity-45"
        >
          {t.label}
        </button>
      ))}
      <span className="mx-0.5 h-5 w-px bg-[#e3e5e7]" aria-hidden />
      <button type="button" disabled={disabled} onClick={onInsertImage} className={adminBtnSecondary}>
        Image
      </button>
    </div>
  );
}
