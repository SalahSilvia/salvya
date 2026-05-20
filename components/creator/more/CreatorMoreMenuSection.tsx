"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { MoreIcon } from "@/components/creator/more/CreatorMoreIcons";
import { creatorCardSurface, creatorSectionTitle } from "@/lib/theme/creator-accent";

export type MoreMenuItem = {
  href: string;
  icon: string;
  label: string;
  description?: string;
  external?: boolean;
};

type Props = {
  title: string;
  items: MoreMenuItem[];
  index: number;
};

export function CreatorMoreMenuSection({ title, items, index }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.05, duration: 0.4 }}
    >
      <h2 className={`mb-3 ${creatorSectionTitle}`}>{title}</h2>
      <ul className={`overflow-hidden rounded-[1.25rem] ${creatorCardSurface}`}>
        {items.map((item, i) => {
          const inner = (
            <>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/70">
                <MoreIcon id={item.icon} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold text-white/90">{item.label}</span>
                {item.description ? (
                  <span className="mt-0.5 block text-[12px] leading-snug text-white/40">{item.description}</span>
                ) : null}
              </span>
              <span className="shrink-0 text-white/25" aria-hidden>
                {item.external ? "↗" : "→"}
              </span>
            </>
          );

          return (
            <li key={item.href} className={i > 0 ? "border-t border-white/[0.06]" : undefined}>
              {item.external ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[4.25rem] items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.04]"
                >
                  {inner}
                </a>
              ) : (
                <Link
                  href={item.href}
                  className="flex min-h-[4.25rem] items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.04]"
                >
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </motion.section>
  );
}
