import { HELP_TAB_SECTIONS } from "@/lib/help-center/content";
import type { HelpFaq, HelpSection, HelpTabId, HelpTopic } from "@/lib/help-center/types";
import { HELP_FAQS, HELP_FEATURED_IDS, HELP_TOPICS } from "@/lib/help-center/topics";

function wordMatchesTopic(t: HelpTopic, w: string): boolean {
  if (w.length < 2) return false;
  const title = t.title.toLowerCase();
  const blurb = t.blurb.toLowerCase();
  if (title.includes(w) || blurb.includes(w)) return true;
  if (t.badge.toLowerCase().includes(w)) return true;
  if (t.href.toLowerCase().includes(w)) return true;
  if (t.keywords.some((k) => k.includes(w))) return true;
  return false;
}

function scoreTopic(t: HelpTopic, qRaw: string): number {
  const q = qRaw.trim().toLowerCase();
  if (!q) return 1;
  const words = q.split(/\s+/).filter((w) => w.length > 0);

  if (words.length > 1) {
    const meaningful = words.filter((w) => w.length >= 2);
    if (meaningful.length === 0) return 0;
    const allMatch = meaningful.every((w) => wordMatchesTopic(t, w));
    if (!allMatch) return 0;
    let s = 88;
    if (meaningful.some((w) => t.title.toLowerCase().includes(w))) s += 22;
    if (meaningful.some((w) => t.keywords.some((k) => k.includes(w)))) s += 8;
    return s;
  }

  const title = t.title.toLowerCase();
  const blurb = t.blurb.toLowerCase();
  if (title === q) return 200;
  if (title.startsWith(q)) return 175;
  if (title.includes(q)) return 150;
  if (t.keywords.some((k) => k === q)) return 142;
  if (t.keywords.some((k) => k.startsWith(q))) return 128;
  if (t.keywords.some((k) => k.includes(q))) return 118;
  if (blurb.includes(q)) return 82;
  if (t.badge.toLowerCase().includes(q)) return 72;
  if (t.href.toLowerCase().includes(q)) return 62;
  if (t.id.includes(q)) return 55;
  return 0;
}

function sectionsForTab(tab: HelpTabId): HelpSection[] | "all" {
  const mapped = HELP_TAB_SECTIONS[tab];
  return mapped === "all" ? "all" : (mapped as HelpSection[]);
}

export function filterHelpTopics(query: string, tab: HelpTabId = "all"): HelpTopic[] {
  const allowed = sectionsForTab(tab);
  const base =
    allowed === "all" ? HELP_TOPICS : HELP_TOPICS.filter((t) => allowed.includes(t.section));
  const q = query.trim();
  if (!q) return base;
  return base
    .map((t) => ({ t, s: scoreTopic(t, q) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.t);
}

export function getFeaturedTopics(): HelpTopic[] {
  return HELP_FEATURED_IDS.map((id) => HELP_TOPICS.find((t) => t.id === id)).filter(
    (t): t is HelpTopic => Boolean(t),
  );
}

export function filterFaqs(query: string, group?: HelpFaq["group"] | "all"): HelpFaq[] {
  const q = query.trim().toLowerCase();
  const base = group && group !== "all" ? HELP_FAQS.filter((f) => f.group === group) : HELP_FAQS;
  if (!q) return base;
  return base.filter((f) => {
    if (f.question.toLowerCase().includes(q)) return true;
    if (f.answer.toLowerCase().includes(q)) return true;
    if (f.links?.some((l) => l.label.toLowerCase().includes(q))) return true;
    return false;
  });
}

export function getTopicsByIds(ids: string[]): HelpTopic[] {
  return ids.map((id) => HELP_TOPICS.find((t) => t.id === id)).filter((t): t is HelpTopic => Boolean(t));
}
