"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useId, useMemo, useState, type KeyboardEvent } from "react";

const faqs = [
  {
    id: "preview",
    q: "What does “preview checkout” mean?",
    a: "Some storefront flows are demonstration builds. When checkout is labelled preview, it is a rehearsal—no charge or shipment until Salvya confirms a live production transaction.",
  },
  {
    id: "ship",
    q: "Where do you ship?",
    a: "EU-friendly options are outlined in our shipping policy. Exact regions expand as operations go live—check the shipping page for the latest list.",
  },
  {
    id: "artist",
    q: "How can artists sell merch?",
    a: "Start with the creator program overview and apply when you are ready to pitch a storefront. Salvya is built as a partner surface for labels and independent artists.",
  },
] as const;

function useScrollChrome() {
  const [progress, setProgress] = useState(0);
  const [showBackTop, setShowBackTop] = useState(false);

  useEffect(() => {
    const tick = () => {
      const root = document.documentElement;
      const top = root.scrollTop;
      const range = root.scrollHeight - root.clientHeight;
      setProgress(range <= 0 ? 0 : Math.min(100, (top / range) * 100));
      setShowBackTop(top > 400);
    };
    tick();
    window.addEventListener("scroll", tick, { passive: true });
    window.addEventListener("resize", tick, { passive: true });
    return () => {
      window.removeEventListener("scroll", tick);
      window.removeEventListener("resize", tick);
    };
  }, []);

  return { progress, showBackTop };
}

const sections = [
  { id: "top", label: "Overview" },
  { id: "story", label: "Story" },
  { id: "timeline", label: "Timeline" },
  { id: "founders", label: "Founders" },
  { id: "hubs", label: "Production" },
  { id: "stats", label: "Impact" },
  { id: "audiences", label: "Fans & artists" },
  { id: "mission", label: "Mission" },
  { id: "principles", label: "Values" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Contact" },
] as const;

const timeline = [
  {
    when: "1 Dec 2025",
    title: "Salvya is founded",
    body: "Salah (Morocco) and Silvia (Italy)—husband and wife—register the brand they had been sketching for months.",
  },
  {
    when: "Origins",
    title: "Tarfaya",
    body: "The idea takes shape on Morocco’s southern Atlantic coast: quiet enough to define what artist-led streetwear should feel like.",
  },
  {
    when: "Growth",
    title: "Agadir",
    body: "The team moves north for premium fabrics, cut-and-sew partners, and print houses that match their quality bar for hoodies and tees.",
  },
  {
    when: "Mar 2026",
    title: "EU momentum",
    body: "European demand accelerates. Salvya formalises dual production in Italy and Morocco—one pipeline, shared QC.",
  },
  {
    when: "Today",
    title: "Wearing your favourite artist",
    body: "Industry partners and fans increasingly classify Salvya as Morocco’s first streetwear brand built around that emotional line—not generic blanks.",
  },
] as const;

function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState(ids[0] ?? "top");

  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (els.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];
        if (visible?.target?.id) setActive(visible.target.id);
      },
      { rootMargin: "-12% 0px -55% 0px", threshold: [0.12, 0.25, 0.4] },
    );

    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [ids]);

  return active;
}

const heroContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.06 },
  },
} as const;

const heroItem = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const } },
} as const;

const heroContainerInstant = {
  hidden: {},
  show: { transition: { staggerChildren: 0, delayChildren: 0 } },
} as const;

const heroItemInstant = {
  hidden: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0, transition: { duration: 0 } },
} as const;

export function AboutSalvyaExperience() {
  const reduceMotion = useReducedMotion();
  const baseId = useId();
  const [tab, setTab] = useState<"fans" | "artists">("fans");
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const { progress, showBackTop } = useScrollChrome();

  const sectionIds = useMemo(() => sections.map((s) => s.id), []);
  const active = useActiveSection(sectionIds);

  const scrollToId = useCallback((id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }, [reduceMotion]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }, [reduceMotion]);

  const focusTab = useCallback((next: "fans" | "artists") => {
    setTab(next);
    queueMicrotask(() => document.getElementById(`${baseId}-tab-${next}`)?.focus());
  }, [baseId]);

  const onTabListKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        if (tab === "fans") focusTab("artists");
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        if (tab === "artists") focusTab("fans");
      } else if (e.key === "Home") {
        e.preventDefault();
        focusTab("fans");
      } else if (e.key === "End") {
        e.preventDefault();
        focusTab("artists");
      }
    },
    [focusTab, tab],
  );

  return (
    <div className="min-h-dvh scroll-smooth bg-white text-slate-900 antialiased">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[45] h-1" aria-hidden>
        <div
          className="h-0.5 bg-gradient-to-r from-[#2D6BFF] via-teal-500 to-[#1e40af] transition-[width] duration-100 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white pt-[env(safe-area-inset-top)] shadow-[0_1px_0_rgba(15,23,42,0.04)]">
        <div className="mx-auto flex h-14 max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))]">
          <Link href="/" className="text-[14px] font-semibold text-slate-600 transition-colors hover:text-slate-900">
            ← Home
          </Link>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-semibold sm:gap-x-4">
            <Link href="/terms" className="text-slate-500 transition-colors hover:text-slate-800">
              Terms
            </Link>
            <span className="text-slate-300" aria-hidden>
              |
            </span>
            <Link href="/shipping" className="text-slate-500 transition-colors hover:text-slate-800">
              Shipping
            </Link>
            <span className="text-slate-300" aria-hidden>
              |
            </span>
            <Link href="/size-guide" className="text-slate-500 transition-colors hover:text-slate-800">
              Size guide
            </Link>
            <span className="hidden text-slate-300 sm:inline" aria-hidden>
              |
            </span>
            <span className="hidden rounded-full bg-slate-900 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white sm:inline">
              About
            </span>
          </div>
        </div>

        <div className="border-t border-slate-100 bg-white" style={{ scrollbarGutter: "stable" }}>
          <nav
            className="mx-auto max-w-5xl px-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]"
            aria-label="About page sections"
          >
            <ul className="flex snap-x snap-mandatory gap-1 overflow-x-auto py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {sections.map((s) => (
                <li key={s.id} className="snap-start shrink-0">
                  <button
                    type="button"
                    onClick={() => scrollToId(s.id)}
                    className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${
                      active === s.id
                        ? "bg-[#2D6BFF] text-white shadow-[0_6px_20px_-8px_rgba(45,107,255,0.55)]"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                    }`}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl bg-white px-[max(1.25rem,env(safe-area-inset-left))] pb-28 pr-[max(1.25rem,env(safe-area-inset-right))] pt-8 sm:pt-12">
        {/* Hero */}
        <motion.section
          id="top"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative scroll-mt-36 overflow-hidden rounded-[1.75rem] border border-slate-900/10 bg-gradient-to-br from-slate-950 via-[#0f172a] to-[#1e3a5f] px-6 py-10 text-white shadow-[0_24px_80px_-32px_rgba(15,23,42,0.65)] sm:scroll-mt-40 sm:px-10 sm:py-14"
        >
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#2D6BFF]/25 blur-3xl"
            aria-hidden
          />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-teal-500/15 blur-3xl" aria-hidden />
          <motion.div
            className="relative"
            variants={reduceMotion ? heroContainerInstant : heroContainer}
            initial={reduceMotion ? false : "hidden"}
            animate="show"
          >
            <motion.p
              variants={reduceMotion ? heroItemInstant : heroItem}
              className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/55"
            >
              Salvya
            </motion.p>
            <motion.h1
              variants={reduceMotion ? heroItemInstant : heroItem}
              className="mt-3 max-w-[22ch] text-[2.1rem] font-bold leading-[1.05] tracking-[-0.045em] sm:text-[2.75rem]"
            >
              Wear the artist you love—built in Morocco &amp; Italy.
            </motion.h1>
            <motion.p
              variants={reduceMotion ? heroItemInstant : heroItem}
              className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/75 sm:text-[16px]"
            >
              Fan-first streetwear, premium blanks, and checkout that respects thumbs and timezones. Founded{" "}
              <strong className="font-semibold text-white/95">1 December 2025</strong> by Salah &amp; Silvia.
            </motion.p>
            <motion.div variants={reduceMotion ? heroItemInstant : heroItem} className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-7 text-[14px] font-semibold text-slate-900 shadow-lg transition-[transform,box-shadow] hover:shadow-xl active:scale-[0.98]"
              >
                Browse drops
              </Link>
              <Link
                href="/creator"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/25 bg-white/5 px-7 text-[14px] font-semibold text-white backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-white/10"
              >
                Creator program
              </Link>
              <Link
                href="/track-order"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-5 text-[14px] font-semibold text-white/85 transition-colors hover:text-white"
              >
                Track an order
              </Link>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Stats */}
        <section id="stats" className="scroll-mt-36 pt-10 sm:scroll-mt-40 sm:pt-12">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { k: "20K+", sub: "Items sold", hint: "More than 20,000 — first year (brand narrative)" },
              { k: "2", sub: "Production countries", hint: "Morocco + Italy" },
              { k: "Dec ’25", sub: "Founded", hint: "Salah & Silvia" },
              { k: "EU+", sub: "Core growth", hint: "From Mar 2026" },
            ].map((card, i) => (
              <motion.div
                key={card.k}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: reduceMotion ? 0 : 0.06 * i, duration: 0.35 }}
                whileHover={reduceMotion ? undefined : { y: -3, boxShadow: "0 12px 40px -16px rgba(15,23,42,0.12)" }}
                className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_1px_0_rgba(15,23,42,0.04)] transition-colors hover:border-slate-300/90"
              >
                <p className="text-[2rem] font-bold tabular-nums tracking-[-0.04em] text-slate-950 sm:text-[2.25rem]">{card.k}</p>
                <p className="mt-1 text-[13px] font-semibold text-slate-800">{card.sub}</p>
                <p className="mt-2 text-[12px] leading-snug text-slate-500">{card.hint}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Story */}
        <section id="story" className="scroll-mt-36 pt-14 sm:scroll-mt-40 sm:pt-16">
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-[#2D6BFF]">Our story</h2>
          <p className="mt-2 max-w-3xl text-[1.65rem] font-semibold leading-snug tracking-[-0.03em] text-slate-950 sm:text-[1.85rem]">
            From Tarfaya’s wind to Agadir’s mills—then straight into European wardrobes.
          </p>
          <div className="mt-6 space-y-4 text-[15px] leading-[1.75] text-slate-700">
            <p>
              Salvya was founded on <strong className="font-semibold text-slate-900">1 December 2025</strong> by{" "}
              <strong className="font-semibold text-slate-900">Salah</strong> (Morocco) and his wife{" "}
              <strong className="font-semibold text-slate-900">Silvia</strong> (Italy)—a Moroccan–Italian couple who
              wanted merch to feel as considered as the music behind it.
            </p>
            <p>
              The idea first took shape in <strong className="font-semibold text-slate-900">Tarfaya</strong>, on
              Morocco’s southern Atlantic coast. To access <strong className="font-semibold text-slate-900">premium fabrics</strong>{" "}
              and reliable <strong className="font-semibold text-slate-900">cut, sew, and print</strong> for hoodies and tees, the
              project moved to <strong className="font-semibold text-slate-900">Agadir</strong>.
            </p>
            <p>
              By <strong className="font-semibold text-slate-900">March 2026</strong>, Salvya had serious momentum with{" "}
              <strong className="font-semibold text-slate-900">more customers across the European Union</strong>. Production now
              runs as a <strong className="font-semibold text-slate-900">two-country model</strong> in{" "}
              <strong className="font-semibold text-slate-900">Italy and Morocco</strong>—one creative direction, shared quality
              control.
            </p>
          </div>
        </section>

        {/* Quote */}
        <motion.figure
          initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mt-10 rounded-2xl border border-[#2D6BFF]/25 bg-white px-6 py-8 shadow-sm sm:px-10"
        >
          <blockquote className="text-center text-[1.35rem] font-semibold italic leading-snug tracking-[-0.02em] text-slate-900 sm:text-[1.55rem]">
            “Wearing my favourite artist.”
          </blockquote>
          <figcaption className="mt-4 text-center text-[13px] text-slate-600">
            The line Salvya is classified around—as Morocco’s first streetwear brand built for fan-first artist merch, not
            anonymous blanks.
          </figcaption>
        </motion.figure>

        {/* Timeline */}
        <section id="timeline" className="scroll-mt-36 pt-14 sm:scroll-mt-40 sm:pt-16">
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-[#2D6BFF]">Timeline</h2>
          <p className="mt-2 text-[1.35rem] font-semibold tracking-[-0.02em] text-slate-950 sm:text-[1.5rem]">How we got here</p>
          <ol className="relative mt-8 space-y-0 border-l-2 border-slate-200 pl-8 sm:pl-10">
            {timeline.map((item, i) => (
              <motion.li
                key={item.title}
                initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ delay: reduceMotion ? 0 : 0.05 * i }}
                className="relative pb-10 last:pb-0"
              >
                <span
                  className="absolute -left-[calc(0.5rem+2px)] top-1.5 flex h-4 w-4 -translate-x-[calc(50%+1px)] items-center justify-center rounded-full border-2 border-white bg-[#2D6BFF] shadow-[0_0_0_3px_rgba(45,107,255,0.2)]"
                  aria-hidden
                />
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#2D6BFF]">{item.when}</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-2 max-w-prose text-[15px] leading-relaxed text-slate-700">{item.body}</p>
              </motion.li>
            ))}
          </ol>
        </section>

        {/* Founders */}
        <section id="founders" className="scroll-mt-36 pt-14 sm:scroll-mt-40 sm:pt-16">
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-[#2D6BFF]">Founders</h2>
          <p className="mt-2 text-[1.35rem] font-semibold tracking-[-0.02em] text-slate-950 sm:text-[1.5rem]">Two countries, one table</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={reduceMotion ? undefined : { y: -4 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600/90 to-red-800 text-xl font-bold text-white">
                S
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-950">Salah</h3>
              <p className="mt-1 text-[12px] font-semibold uppercase tracking-wide text-slate-500">Morocco · Co-founder</p>
              <p className="mt-3 text-[14px] leading-relaxed text-slate-700">
                Production rigour, fabric sourcing, and keeping promises to artists and fans on the factory floor.
              </p>
            </motion.div>
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: reduceMotion ? 0 : 0.08 }}
              whileHover={reduceMotion ? undefined : { y: -4 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600/90 to-emerald-900 text-xl font-bold text-white">
                Si
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-950">Silvia</h3>
              <p className="mt-1 text-[12px] font-semibold uppercase tracking-wide text-slate-500">Italy · Co-founder</p>
              <p className="mt-3 text-[14px] leading-relaxed text-slate-700">
                Brand voice, visual systems, and the emotional arc of every drop—from lookbook to confirmation email.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Dual hubs */}
        <section id="hubs" className="scroll-mt-36 pt-14 sm:scroll-mt-40 sm:pt-16">
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-[#2D6BFF]">Production</h2>
          <p className="mt-2 text-[1.35rem] font-semibold tracking-[-0.02em] text-slate-950 sm:text-[1.5rem]">Morocco × Italy</p>
          <div className="mt-6 flex justify-center" aria-hidden>
            <svg viewBox="0 0 360 72" className="h-14 w-full max-w-lg text-slate-200" fill="none">
              <path
                d="M8 48 Q40 8 72 36 T120 44 Q140 20 168 38 L168 52 Q120 58 88 52 Q48 46 8 48Z"
                fill="currentColor"
                className="text-[#2D6BFF]/20"
              />
              <path
                d="M200 36 H248 M248 36 L268 20 M248 36 L268 52"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="text-slate-300"
              />
              <path
                d="M292 12 Q308 8 324 18 Q340 32 338 52 Q320 62 300 58 Q284 48 288 28 Q290 16 292 12Z"
                fill="currentColor"
                className="text-emerald-600/25"
              />
              <text x="24" y="66" className="fill-slate-400 text-[9px] font-bold uppercase tracking-wider">
                MA
              </text>
              <text x="308" y="66" className="fill-slate-400 text-[9px] font-bold uppercase tracking-wider">
                IT
              </text>
            </svg>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-[13px] font-bold uppercase tracking-wide text-slate-500">Morocco</p>
              <ul className="mt-4 space-y-2.5 text-[14px] leading-relaxed text-slate-700">
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2D6BFF]" aria-hidden />
                  Coastal craft culture from Tarfaya → Agadir logistics hub.
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2D6BFF]" aria-hidden />
                  Hoodies &amp; tees: cut, sew, and specialty finishes close to North African fans.
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-[13px] font-bold uppercase tracking-wide text-slate-500">Italy</p>
              <ul className="mt-4 space-y-2.5 text-[14px] leading-relaxed text-slate-700">
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" aria-hidden />
                  Premium jersey &amp; fleece supply chains for EU-grade quality.
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" aria-hidden />
                  Shared QC with Morocco so every SKU meets the same Salvya standard.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Tabbed audiences */}
        <section id="audiences" className="scroll-mt-36 pt-14 sm:scroll-mt-40 sm:pt-16">
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-[#2D6BFF]">Who Salvya is for</h2>
          <p className="mt-2 text-[1.35rem] font-semibold tracking-[-0.02em] text-slate-950 sm:text-[1.5rem]">Fans &amp; artists</p>

          <div
            className="mt-6 inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm"
            role="tablist"
            aria-label="Audience"
            onKeyDown={onTabListKeyDown}
          >
            {(["fans", "artists"] as const).map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                tabIndex={tab === key ? 0 : -1}
                id={`${baseId}-tab-${key}`}
                aria-controls={`${baseId}-panel-${key}`}
                onClick={() => setTab(key)}
                className={`relative rounded-xl px-5 py-2.5 text-[13px] font-semibold transition-colors outline-none ring-[#2D6BFF] focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  tab === key ? "text-slate-900" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab === key ? (
                  <motion.span
                    layoutId="aboutTabBg"
                    className="absolute inset-0 rounded-xl bg-white shadow-sm ring-1 ring-slate-200/80"
                    transition={{ type: "spring", stiffness: 400, damping: 34 }}
                  />
                ) : null}
                <span className="relative z-10 capitalize">{key}</span>
              </button>
            ))}
          </div>

          <div className="relative mt-6 min-h-[12rem] rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <AnimatePresence mode="wait">
              {tab === "fans" ? (
                <motion.div
                  key="fans"
                  role="tabpanel"
                  id={`${baseId}-panel-fans`}
                  aria-labelledby={`${baseId}-tab-fans`}
                  initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-3 text-[15px] leading-relaxed text-slate-700"
                >
                  <p>
                    <strong className="font-semibold text-slate-900">Official drops</strong>, clear sizing via our{" "}
                    <Link href="/size-guide" className="font-semibold text-[#1d4ed8] underline decoration-[#2D6BFF]/30 underline-offset-2 hover:decoration-[#2D6BFF]">
                      size guide
                    </Link>
                    , and EU-friendly shipping in our{" "}
                    <Link href="/shipping" className="font-semibold text-[#1d4ed8] underline decoration-[#2D6BFF]/30 underline-offset-2 hover:decoration-[#2D6BFF]">
                      shipping policy
                    </Link>
                    .
                  </p>
                  <p>
                    Transparent{" "}
                    <Link href="/payment" className="font-semibold text-[#1d4ed8] underline decoration-[#2D6BFF]/30 underline-offset-2 hover:decoration-[#2D6BFF]">
                      payment
                    </Link>
                    ,{" "}
                    <Link href="/returns" className="font-semibold text-[#1d4ed8] underline decoration-[#2D6BFF]/30 underline-offset-2 hover:decoration-[#2D6BFF]">
                      returns
                    </Link>
                    , and{" "}
                    <Link href="/cookies" className="font-semibold text-[#1d4ed8] underline decoration-[#2D6BFF]/30 underline-offset-2 hover:decoration-[#2D6BFF]">
                      cookies
                    </Link>{" "}
                    —so you always know what you are agreeing to.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="artists"
                  role="tabpanel"
                  id={`${baseId}-panel-artists`}
                  aria-labelledby={`${baseId}-tab-artists`}
                  initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-3 text-[15px] leading-relaxed text-slate-700"
                >
                  <p>
                    A <strong className="font-semibold text-slate-900">partner surface</strong> for artists and labels:
                    premium layouts, structured checkout, and room for the story behind each piece.
                  </p>
                  <p>
                    Start from the{" "}
                    <Link href="/creator" className="font-semibold text-[#1d4ed8] underline decoration-[#2D6BFF]/30 underline-offset-2 hover:decoration-[#2D6BFF]">
                      creator program overview
                    </Link>{" "}
                    or apply from the main menu when you are ready to pitch a storefront.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Mission */}
        <section id="mission" className="scroll-mt-36 pt-14 sm:scroll-mt-40 sm:pt-16">
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-[#2D6BFF]">Mission</h2>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-[15px] leading-[1.75] text-slate-700">
              Too much merch still feels like an afterthought: blurry photos, confusing sizes, checkout that fights you
              on a phone. Salvya exists to raise the bar for{" "}
              <strong className="font-semibold text-slate-900">how artists and labels sell physical goods online</strong>
              —with UX and UI treated as part of the product, not an afterthought.
            </p>
            <p className="mt-4 text-[15px] leading-[1.75] text-slate-700">
              Some storefront flows are still <strong className="font-semibold text-slate-900">preview or demonstration</strong>{" "}
              builds. When checkout is labelled preview, it is a rehearsal—no charge or shipment until Salvya confirms a
              live production transaction.
            </p>
          </div>
        </section>

        {/* Principles */}
        <section id="principles" className="scroll-mt-36 pt-14 sm:scroll-mt-40 sm:pt-16">
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-[#2D6BFF]">Values</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              {
                t: "Fan-first UX",
                d: "Fewer dead ends, clearer steps, respectful copy.",
                icon: (
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M12 3l7 4v5c0 5-3.5 9-7 11-3.5-2-7-6-7-11V7l7-4z" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                ),
              },
              {
                t: "IP respect",
                d: "Official collaborations only — see Terms.",
                icon: (
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                ),
              },
              {
                t: "Honest preview",
                d: "Simulated checkout is labelled, never disguised.",
                icon: (
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M2 12h4M18 12h4M12 2v4M12 18v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                ),
              },
            ].map((c) => (
              <div key={c.t} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2D6BFF]/10 text-[#1d4ed8]">{c.icon}</div>
                <h3 className="mt-4 text-[15px] font-semibold text-slate-950">{c.t}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{c.d}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-[13px] text-slate-500">
            Legal detail:{" "}
            <Link href="/terms" className="font-semibold text-[#1d4ed8] underline underline-offset-2 hover:text-slate-900">
              Terms of Service
            </Link>
          </p>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-36 pt-14 sm:scroll-mt-40 sm:pt-16">
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-[#2D6BFF]">FAQ</h2>
          <p className="mt-2 text-[1.35rem] font-semibold tracking-[-0.02em] text-slate-950 sm:text-[1.5rem]">Quick answers</p>
          <ul className="mt-6 space-y-3">
            {faqs.map((item, i) => {
              const open = openFaq === item.id;
              const panelId = `${baseId}-faq-${item.id}`;
              const btnId = `${baseId}-faq-btn-${item.id}`;
              return (
                <motion.li
                  key={item.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ delay: reduceMotion ? 0 : 0.04 * i }}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <h3 className="m-0 text-left text-[15px] font-semibold leading-snug">
                    <button
                      type="button"
                      id={btnId}
                      aria-expanded={open}
                      aria-controls={panelId}
                      onClick={() => setOpenFaq((prev) => (prev === item.id ? null : item.id))}
                      className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-slate-950 transition-colors hover:bg-slate-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6BFF] focus-visible:ring-offset-2"
                    >
                      <span>{item.q}</span>
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition-transform ${
                          open ? "rotate-180" : ""
                        }`}
                        aria-hidden
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {open ? (
                      <motion.div
                        id={panelId}
                        role="region"
                        aria-labelledby={btnId}
                        initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden border-t border-slate-100"
                      >
                        <p className="px-5 pb-4 pt-3 text-[14px] leading-relaxed text-slate-600">{item.a}</p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </motion.li>
              );
            })}
          </ul>
        </section>

        {/* Contact */}
        <section id="contact" className="scroll-mt-36 pt-14 sm:scroll-mt-40 sm:pt-16">
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-[#2D6BFF]">Contact</h2>
          <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="max-w-xl text-[15px] leading-relaxed text-slate-700">
              Order questions → support channel in your confirmation when checkout is live. General enquiries → official
              routes as we publish them per region.
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:items-end">
              <Link
                href="/track-order"
                className="inline-flex min-h-10 items-center justify-center rounded-full bg-slate-900 px-5 text-[13px] font-semibold text-white transition-colors hover:bg-slate-800"
              >
                Track your order
              </Link>
              <Link
                href="/cookies/settings"
                className="text-[13px] font-semibold text-[#1d4ed8] underline decoration-[#2D6BFF]/25 underline-offset-2 hover:decoration-[#2D6BFF]"
              >
                Cookie settings
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="mt-16 flex flex-col gap-4 border-t border-slate-200 pt-10 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-[13px] font-semibold sm:gap-x-5">
            <Link href="/terms" className="text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900">
              Terms
            </Link>
            <Link href="/creator" className="text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900">
              Creators
            </Link>
            <Link href="/size-guide" className="text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900">
              Size guide
            </Link>
            <Link href="/shipping" className="text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900">
              Shipping
            </Link>
            <Link href="/payment" className="text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900">
              Payment
            </Link>
          </div>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-8 text-[14px] font-semibold text-slate-800 shadow-sm transition-colors hover:border-slate-400 hover:bg-slate-50"
          >
            Browse Salvya home
          </Link>
        </div>
      </main>

      <AnimatePresence>
        {showBackTop ? (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            onClick={scrollToTop}
            className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-40 flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg ring-1 ring-white/10 transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6BFF] focus-visible:ring-offset-2"
            aria-label="Back to top"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
