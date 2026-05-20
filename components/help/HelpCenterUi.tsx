"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { HelpTopic } from "@/lib/help-center/types";

export function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function HighlightMatch({ text, query }: { text: string; query: string }) {
  const words = query
    .trim()
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 2);
  if (words.length === 0) return <>{text}</>;
  let re: RegExp;
  try {
    re = new RegExp(`(${words.map(escapeRegExp).join("|")})`, "gi");
  } catch {
    return <>{text}</>;
  }
  const parts = text.split(re);
  return (
    <>
      {parts.map((part, i) => {
        const hit = words.some((w) => part.toLowerCase() === w.toLowerCase());
        return hit ? (
          <mark key={i} className="rounded bg-amber-200/90 px-0.5 text-inherit">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </>
  );
}

export function TopicCard({
  topic,
  index,
  reduceMotion,
  query,
}: {
  topic: HelpTopic;
  index: number;
  reduceMotion: boolean | null;
  query: string;
}) {
  const external = topic.href.startsWith("http") || topic.href.endsWith(".xml") || topic.href.endsWith(".txt") || topic.href.endsWith(".json");

  return (
    <motion.li
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.35, delay: index * 0.03, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={topic.href}
        prefetch={false}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-100/90 bg-white/90 p-4 shadow-[0_2px_24px_-14px_rgba(15,23,42,0.12)] ring-1 ring-neutral-900/5 transition-[transform,box-shadow,border-color] hover:-translate-y-0.5 hover:border-blue-200/80 hover:shadow-[0_20px_48px_-24px_rgba(37,99,235,0.18)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 sm:p-5"
      >
        <span className="mb-3 inline-flex w-fit rounded-full bg-gradient-to-r from-blue-50 to-sky-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-blue-700 ring-1 ring-blue-100/80">
          {topic.badge}
        </span>
        <div className="flex min-h-0 flex-1 items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[16px] font-semibold leading-snug tracking-[-0.02em] text-neutral-950 sm:text-[17px]">
              <HighlightMatch text={topic.title} query={query} />
            </h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500 sm:text-[14px]">
              <HighlightMatch text={topic.blurb} query={query} />
            </p>
          </div>
          <span className="mt-0.5 shrink-0 rounded-full bg-neutral-50 p-2 ring-1 ring-neutral-100 group-hover:bg-blue-50 group-hover:ring-blue-100" aria-hidden>
            →
          </span>
        </div>
      </Link>
    </motion.li>
  );
}

export function SectionHeading({
  id,
  title,
  description,
}: {
  id: string;
  title: string;
  description: string;
}) {
  return (
    <div className="scroll-mt-28 mb-6 border-b border-neutral-200/80 pb-4">
      <h2 id={id} className="text-[clamp(1.35rem,3vw,1.75rem)] font-bold tracking-[-0.03em] text-neutral-950">
        {title}
      </h2>
      <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-neutral-600">{description}</p>
    </div>
  );
}

/** Hide scrollbar; swipe / drag scroll still works. */
export const helpTouchScrollClass =
  "overflow-x-auto touch-pan-x overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
