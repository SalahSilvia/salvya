"use client";

import type { DocHeading } from "@/lib/docs/types";

export function DocsToc({ headings }: { headings: DocHeading[] }) {
  if (!headings.length) return null;
  return (
    <nav className="sticky top-36 rounded-2xl border border-neutral-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-md" aria-label="Table of contents">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">On this page</p>
      <ol className="mt-3 space-y-2">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? "pl-3" : undefined}>
            <a href={`#${h.id}`} className="text-[13px] font-medium text-neutral-600 hover:text-blue-700">
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
