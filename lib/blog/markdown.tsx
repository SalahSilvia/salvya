import type { ReactNode } from "react";
import { slugifyHeading } from "@/lib/blog/blog-headings";

function inlineFormat(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const token = m[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      nodes.push(
        <strong key={key++} className="font-semibold text-white">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      nodes.push(
        <em key={key++} className="text-white/85">
          {token.slice(1, -1)}
        </em>,
      );
    } else if (token.startsWith("![")) {
      const img = /!\[([^\]]*)\]\(([^)]+)\)/.exec(token);
      if (img?.[2]) {
        nodes.push(
          <span key={key++} className="my-6 block overflow-hidden rounded-2xl border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img[2]} alt={img[1] ?? ""} className="w-full object-cover" />
          </span>,
        );
      }
    } else if (token.startsWith("[")) {
      const link = /\[([^\]]+)\]\(([^)]+)\)/.exec(token);
      if (link?.[2]) {
        nodes.push(
          <a
            key={key++}
            href={link[2]}
            className="font-medium text-[#8eb6ff] underline decoration-[#8eb6ff]/40 underline-offset-2 hover:text-[#b8d0ff]"
            target={link[2].startsWith("http") ? "_blank" : undefined}
            rel={link[2].startsWith("http") ? "noopener noreferrer" : undefined}
          >
            {link[1]}
          </a>,
        );
      }
    }
    last = m.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes.length ? nodes : [text];
}

type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "quote"; text: string }
  | { type: "hr" };

function parseBlocks(md: string): Block[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i]!.trimEnd();
    if (!line.trim()) {
      i++;
      continue;
    }
    if (line.trim() === "---") {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push({ type: "h2", text: line.slice(3).trim() });
      i++;
      continue;
    }
    if (line.startsWith("### ")) {
      blocks.push({ type: "h3", text: line.slice(4).trim() });
      i++;
      continue;
    }
    if (line.startsWith("> ")) {
      blocks.push({ type: "quote", text: line.slice(2).trim() });
      i++;
      continue;
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i]!.startsWith("- ") || lines[i]!.startsWith("* "))) {
        items.push(lines[i]!.slice(2).trim());
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }
    const para: string[] = [line.trim()];
    i++;
    while (i < lines.length && lines[i]!.trim() && !/^#{2,3}\s/.test(lines[i]!) && !lines[i]!.startsWith("- ")) {
      para.push(lines[i]!.trim());
      i++;
    }
    blocks.push({ type: "p", text: para.join(" ") });
  }
  return blocks;
}

function headingDomId(text: string, index: number): string {
  const base = slugifyHeading(text) || "section";
  return index > 0 ? `${base}-${index + 1}` : base;
}

export function BlogMarkdown({
  markdown,
  className,
  headingIds = false,
}: {
  markdown: string;
  className?: string;
  headingIds?: boolean;
}) {
  const blocks = parseBlocks(markdown);
  const h2Count = new Map<string, number>();
  return (
    <div className={className}>
      {blocks.map((b, i) => {
        if (b.type === "hr") {
          return <hr key={i} className="my-10 border-white/10" />;
        }
        if (b.type === "h2") {
          const n = h2Count.get(b.text) ?? 0;
          h2Count.set(b.text, n + 1);
          const id = headingIds ? headingDomId(b.text, n) : undefined;
          return (
            <h2
              key={i}
              id={id}
              className="mt-12 scroll-mt-28 text-[1.65rem] font-semibold tracking-tight text-white first:mt-0 sm:text-2xl"
            >
              {inlineFormat(b.text)}
            </h2>
          );
        }
        if (b.type === "h3") {
          const id = headingIds ? `${slugifyHeading(b.text) || "section"}-h3` : undefined;
          return (
            <h3
              key={i}
              id={id}
              className="mt-8 scroll-mt-28 text-xl font-semibold tracking-tight text-white/95"
            >
              {inlineFormat(b.text)}
            </h3>
          );
        }
        if (b.type === "quote") {
          return (
            <blockquote
              key={i}
              className="my-6 border-l-2 border-[#2D6BFF]/60 pl-4 text-[17px] leading-relaxed text-white/70 italic"
            >
              {inlineFormat(b.text)}
            </blockquote>
          );
        }
        if (b.type === "ul") {
          return (
            <ul key={i} className="my-5 list-disc space-y-2 pl-5 text-[17px] leading-relaxed text-white/72">
              {b.items.map((item, j) => (
                <li key={j}>{inlineFormat(item)}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="mt-5 text-[17px] leading-[1.75] text-white/72 first:mt-0">
            {inlineFormat(b.text)}
          </p>
        );
      })}
    </div>
  );
}
