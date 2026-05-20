import { semanticKnowledgeSearch } from "@/lib/knowledge/semantic-search";
import type { DocSearchResult } from "@/lib/docs/types";

const SUGGESTED = [
  "How do refunds work?",
  "Track my SVY order",
  "How do creators get paid?",
  "Failed payment after checkout",
  "API authentication",
];

export function getSuggestedAiQuestions(): string[] {
  return SUGGESTED;
}

export function askSalvyaKnowledge(question: string): {
  answer: string;
  citations: DocSearchResult[];
  related: DocSearchResult[];
} {
  const hits = semanticKnowledgeSearch(question, 8);
  if (!hits.length) {
    return {
      answer:
        "I could not find a strong match in Salvya docs yet. Try the Help Center search, browse /docs, or contact support for order-specific cases.",
      citations: [],
      related: [],
    };
  }

  const top = hits[0]!;
  const citations = hits.slice(0, 4);
  const parts = [
    `Based on Salvya documentation, **${top.title}**: ${top.snippet}`,
    hits.length > 1
      ? `Related surfaces include ${hits
          .slice(1, 4)
          .map((h) => h.title)
          .join(", ")}.`
      : null,
  ].filter(Boolean);

  return {
    answer: parts.join("\n\n"),
    citations,
    related: hits.slice(1, 6),
  };
}
