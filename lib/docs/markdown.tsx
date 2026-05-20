import type { ReactNode } from "react";
import { DocsCodeBlock } from "@/components/docs/DocsCodeBlock";
import { slugifyHeading } from "@/lib/blog/blog-headings";
import type { DocHeading } from "@/lib/docs/types";

function inlineFormat(text: string, theme: "light" | "dark"): ReactNode[] {
  const linkClass =
    theme === "light"
      ? "font-medium text-blue-700 underline decoration-blue-200 underline-offset-2 hover:text-blue-800"
      : "font-medium text-[#8eb6ff] underline decoration-[#8eb6ff]/40 underline-offset-2 hover:text-[#b8d0ff]";
  const nodes: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const token = m[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      nodes.push(
        <strong key={key++} className={theme === "light" ? "font-semibold text-neutral-950" : "font-semibold text-white"}>
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      nodes.push(
        <em key={key++} className={theme === "light" ? "text-neutral-700" : "text-white/85"}>
          {token.slice(1, -1)}
        </em>,
      );
    } else if (token.startsWith("[")) {
      const link = /\[([^\]]+)\]\(([^)]+)\)/.exec(token);
      if (link?.[2]) {
        nodes.push(
          <a
            key={key++}
            href={link[2]}
            className={linkClass}
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
  | { type: "code"; lang: string; code: string }
  | { type: "hr" };

function parseBlocks(md: string): Block[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i]!;
    if (!line.trim()) {
      i++;
      continue;
    }
    if (line.trim() === "---") {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i]!.startsWith("```")) {
        codeLines.push(lines[i]!);
        i++;
      }
      i++;
      blocks.push({ type: "code", lang, code: codeLines.join("\n") });
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
    while (i < lines.length && lines[i]!.trim() && !/^#{2,3}\s/.test(lines[i]!) && !lines[i]!.startsWith("- ") && !lines[i]!.startsWith("```")) {
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

export function extractHeadings(markdown: string): DocHeading[] {
  const blocks = parseBlocks(markdown);
  const h2Count = new Map<string, number>();
  const headings: DocHeading[] = [];
  for (const b of blocks) {
    if (b.type === "h2") {
      const n = h2Count.get(b.text) ?? 0;
      h2Count.set(b.text, n + 1);
      headings.push({ id: headingDomId(b.text, n), text: b.text, level: 2 });
    }
    if (b.type === "h3") {
      headings.push({ id: `${slugifyHeading(b.text) || "section"}-h3`, text: b.text, level: 3 });
    }
  }
  return headings;
}

export function DocsMarkdown({
  markdown,
  theme = "light",
  headingIds = true,
  className,
}: {
  markdown: string;
  theme?: "light" | "dark";
  headingIds?: boolean;
  className?: string;
}) {
  const blocks = parseBlocks(markdown);
  const h2Count = new Map<string, number>();
  const pClass = theme === "light" ? "mt-5 text-[15px] leading-[1.75] text-neutral-600" : "mt-5 text-[17px] leading-[1.75] text-white/72";
  const h2Class =
    theme === "light"
      ? "mt-12 scroll-mt-28 text-[1.5rem] font-bold tracking-tight text-neutral-950 first:mt-0"
      : "mt-12 scroll-mt-28 text-[1.65rem] font-semibold tracking-tight text-white first:mt-0";
  const h3Class =
    theme === "light" ? "mt-8 scroll-mt-28 text-xl font-semibold text-neutral-900" : "mt-8 scroll-mt-28 text-xl font-semibold text-white/95";

  return (
    <div className={className}>
      {blocks.map((b, i) => {
        if (b.type === "hr") return <hr key={i} className="my-10 border-neutral-200/80" />;
        if (b.type === "code") return <DocsCodeBlock key={i} code={b.code} lang={b.lang} />;
        if (b.type === "h2") {
          const n = h2Count.get(b.text) ?? 0;
          h2Count.set(b.text, n + 1);
          const id = headingIds ? headingDomId(b.text, n) : undefined;
          return (
            <h2 key={i} id={id} className={h2Class}>
              {inlineFormat(b.text, theme)}
            </h2>
          );
        }
        if (b.type === "h3") {
          const id = headingIds ? `${slugifyHeading(b.text) || "section"}-h3` : undefined;
          return (
            <h3 key={i} id={id} className={h3Class}>
              {inlineFormat(b.text, theme)}
            </h3>
          );
        }
        if (b.type === "quote") {
          return (
            <blockquote
              key={i}
              className="my-6 border-l-2 border-blue-500/50 bg-blue-50/50 py-1 pl-4 text-[15px] italic text-neutral-700"
            >
              {inlineFormat(b.text, theme)}
            </blockquote>
          );
        }
        if (b.type === "ul") {
          return (
            <ul key={i} className="my-5 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-neutral-600">
              {b.items.map((item, j) => (
                <li key={j}>{inlineFormat(item, theme)}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className={pClass}>
            {inlineFormat(b.text, theme)}
          </p>
        );
      })}
    </div>
  );
}
