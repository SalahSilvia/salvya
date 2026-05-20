import type { DocCategory, DocCategoryId } from "@/lib/docs/types";

export const DOC_CATEGORIES: DocCategory[] = [
  { id: "orders", title: "Orders & commerce", description: "Tracking, refunds, checkout, and fulfillment.", icon: "📦" },
  { id: "creators", title: "Creators", description: "Payouts, onboarding, links, and workspace.", icon: "✦" },
  { id: "api", title: "API & developers", description: "Authentication, REST endpoints, webhooks.", icon: "{ }" },
  { id: "platform", title: "Platform", description: "Architecture, trust, security, and how Salvya works.", icon: "◇" },
  { id: "policies", title: "Policies", description: "Machine-readable legal and compliance surfaces.", icon: "§" },
  { id: "glossary", title: "Glossary", description: "Ecommerce and creator-economy terminology.", icon: "Aa" },
  { id: "onboarding", title: "Onboarding", description: "Customer, creator, and developer getting started.", icon: "→" },
];

export function getDocCategory(id: DocCategoryId): DocCategory | undefined {
  return DOC_CATEGORIES.find((c) => c.id === id);
}

export function isDocCategoryId(value: string): value is DocCategoryId {
  return DOC_CATEGORIES.some((c) => c.id === value);
}
