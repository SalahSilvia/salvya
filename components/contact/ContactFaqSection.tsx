"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown, ContactCard, ContactSectionTitle } from "@/components/contact/contact-ui";
import { filterContactFaqs, type ContactFaq } from "@/lib/contact/contact-page-data";

function FaqItem({ question, answer, links }: ContactFaq) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/[0.06] last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 py-3.5 text-left"
        aria-expanded={open}
      >
        <span className="text-[14px] font-semibold leading-snug text-white/88">{question}</span>
        <ChevronDown open={open} className="shrink-0 text-white/35" />
      </button>
      {open ? (
        <div className="pb-4">
          <p className="text-[13px] leading-relaxed text-white/50">{answer}</p>
          {links?.length ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="inline-flex rounded-lg border border-white/[0.1] bg-white/[0.05] px-2.5 py-1 text-[12px] font-semibold text-[#8fa8e8] hover:bg-white/[0.08]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function ContactFaqSection() {
  const [query, setQuery] = useState("");
  const [expandAll, setExpandAll] = useState(false);

  const filtered = useMemo(() => filterContactFaqs(query), [query]);

  return (
    <ContactCard className="px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ContactSectionTitle>Common questions</ContactSectionTitle>
        {filtered.length > 0 ? (
          <button
            type="button"
            onClick={() => setExpandAll((v) => !v)}
            className="text-[12px] font-semibold text-[#8fa8e8] hover:text-[#b8c9ff]"
          >
            {expandAll ? "Collapse all" : "Expand all"}
          </button>
        ) : null}
      </div>
      <label className="mt-3 block">
        <span className="sr-only">Search FAQs</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search questions…"
          className="w-full rounded-xl border border-white/[0.12] bg-black/30 px-4 py-2.5 text-[14px] text-white placeholder:text-white/30 outline-none focus:border-[#2D6BFF]/40 focus:ring-2 focus:ring-[#2D6BFF]/25"
        />
      </label>
      <div className="mt-1 px-1 pb-2">
        {filtered.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-white/40">No matches — try &quot;WhatsApp&quot; or &quot;order&quot;.</p>
        ) : expandAll ? (
          filtered.map((faq) => (
            <div key={faq.id} className="border-b border-white/[0.06] py-3.5 last:border-0">
              <p className="text-[14px] font-semibold text-white/88">{faq.question}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-white/50">{faq.answer}</p>
            </div>
          ))
        ) : (
          filtered.map((faq) => <FaqItem key={faq.id} {...faq} />)
        )}
      </div>
    </ContactCard>
  );
}
