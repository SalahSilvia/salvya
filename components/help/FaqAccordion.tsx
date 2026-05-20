"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HighlightMatch } from "@/components/help/HelpCenterUi";
import type { HelpFaq } from "@/lib/help-center/types";

type Props = {
  faqs: HelpFaq[];
  query?: string;
  className?: string;
};

export function FaqAccordion({ faqs, query = "", className = "" }: Props) {
  const [hashId, setHashId] = useState<string | null>(null);

  useEffect(() => {
    function syncHash() {
      const raw = window.location.hash.replace(/^#/, "");
      setHashId(raw.startsWith("faq-") ? raw : null);
    }
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  useEffect(() => {
    if (!hashId) return;
    const el = document.getElementById(hashId);
    if (el instanceof HTMLDetailsElement) {
      el.open = true;
      window.requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [hashId, faqs.length]);

  if (!faqs.length) {
    return (
      <p className={`rounded-2xl border border-dashed border-neutral-200 bg-white/80 px-6 py-10 text-center text-[14px] text-neutral-600 ${className}`}>
        No questions match your search. Try another keyword or browse all categories.
      </p>
    );
  }

  return (
    <div className={`divide-y divide-neutral-200/90 overflow-hidden rounded-2xl border border-neutral-200/90 bg-white/95 shadow-sm ${className}`}>
      {faqs.map((f) => (
        <details
          key={f.id}
          id={`faq-${f.id}`}
          className="group scroll-mt-28 bg-white/80 px-4 py-1 open:bg-white"
          open={hashId === `faq-${f.id}` ? true : undefined}
        >
          <summary className="cursor-pointer list-none py-3 pr-8 text-[15px] font-semibold text-neutral-900 marker:content-none [&::-webkit-details-marker]:hidden">
            <HighlightMatch text={f.question} query={query} />
          </summary>
          <div className="border-t border-neutral-100 pb-4 pt-3 text-[14px] text-neutral-600">
            <p>
              <HighlightMatch text={f.answer} query={query} />
            </p>
            {f.links?.length ? (
              <ul className="mt-3 flex flex-wrap gap-2">
                {f.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="rounded-full bg-blue-50 px-3 py-1.5 text-[12px] font-semibold text-blue-800 hover:bg-blue-100">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </details>
      ))}
    </div>
  );
}
