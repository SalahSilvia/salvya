import "server-only";

import { getAllDocs } from "@/lib/docs/loader";
import { HELP_DEV_ENDPOINTS } from "@/lib/help-center/content";
import { HELP_TOPICS } from "@/lib/help-center/topics";

export type KnowledgeEntityType =
  | "doc"
  | "help-topic"
  | "policy"
  | "api"
  | "creator"
  | "product"
  | "category";

export type KnowledgeEntity = {
  id: string;
  type: KnowledgeEntityType;
  name: string;
  href: string;
  description?: string;
  relatedIds: string[];
};

/** Build a lightweight public knowledge graph for internal linking. */
export function buildKnowledgeGraph(): KnowledgeEntity[] {
  const entities: KnowledgeEntity[] = [];

  for (const doc of getAllDocs()) {
    const id = `doc:${doc.path}`;
    const relatedIds: string[] = [];
    for (const p of doc.relatedPaths ?? []) {
      relatedIds.push(`doc:${p.startsWith("/docs") ? p : `/docs/${doc.category}/${p}`}`);
    }
    if (doc.entities?.policies) {
      doc.entities.policies.forEach((pol) => relatedIds.push(`policy:${pol}`));
    }
    if (doc.entities?.apis) {
      doc.entities.apis.forEach((api) => relatedIds.push(`api:${api}`));
    }
    entities.push({
      id,
      type: "doc",
      name: doc.title,
      href: doc.path,
      description: doc.summary,
      relatedIds,
    });
  }

  for (const t of HELP_TOPICS) {
    entities.push({
      id: `help:${t.id}`,
      type: "help-topic",
      name: t.title,
      href: t.href,
      description: t.blurb,
      relatedIds: t.href.startsWith("/docs") ? [`doc:${t.href}`] : [],
    });
  }

  const policyPaths = ["/terms", "/returns", "/shipping", "/cookies", "/terms/creator", "/payment"];
  for (const p of policyPaths) {
    entities.push({
      id: `policy:${p}`,
      type: "policy",
      name: p,
      href: p,
      relatedIds: getAllDocs()
        .filter((d) => d.entities?.policies?.includes(p))
        .map((d) => `doc:${d.path}`),
    });
  }

  for (const ep of HELP_DEV_ENDPOINTS) {
    entities.push({
      id: `api:${ep.id}`,
      type: "api",
      name: `${ep.method} ${ep.path}`,
      href: `/developers#${ep.id}`,
      description: ep.summary,
      relatedIds: getAllDocs()
        .filter((d) => d.category === "api" || d.tags.includes("api"))
        .map((d) => `doc:${d.path}`),
    });
  }

  return entities;
}

export function getRelatedEntities(entityId: string, limit = 6): KnowledgeEntity[] {
  const graph = buildKnowledgeGraph();
  const map = new Map(graph.map((e) => [e.id, e]));
  const node = map.get(entityId);
  if (!node) return [];
  const out: KnowledgeEntity[] = [];
  for (const rid of node.relatedIds) {
    const rel = map.get(rid);
    if (rel) out.push(rel);
    if (out.length >= limit) break;
  }
  return out;
}
