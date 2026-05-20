export type HelpSection =
  | "orders"
  | "account"
  | "legal"
  | "creators"
  | "platform"
  | "developers"
  | "ai"
  | "api";

export type HelpTabId =
  | "all"
  | "customers"
  | "creators"
  | "developers"
  | "policies"
  | "platform"
  | "ai"
  | "api";

export type HelpTopic = {
  id: string;
  title: string;
  blurb: string;
  href: string;
  badge: string;
  section: HelpSection;
  keywords: string[];
  /** Knowledge-base category slug */
  category?: string;
};

export type HelpFaq = {
  id: string;
  question: string;
  answer: string;
  group: "customer" | "creator" | "developer" | "ai" | "payment";
  links?: { href: string; label: string }[];
};

export type HelpPopularAction = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: string;
  section: HelpSection;
};

export type HelpKbCategory = {
  id: string;
  title: string;
  description: string;
  topicIds: string[];
};

export type HelpFlowStep = { label: string; detail?: string };

export type HelpFlow = {
  id: string;
  title: string;
  audience: "customer" | "creator";
  steps: HelpFlowStep[];
};

export type HelpAiArticle = {
  id: string;
  title: string;
  summary: string;
  href: string;
  tags: string[];
};

export type HelpDevEndpoint = {
  id: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  summary: string;
  auth: string;
};

export type HelpPlatformLink = {
  label: string;
  href: string;
  group: string;
};

export type HelpSchemaType = {
  id: string;
  name: string;
  description: string;
  usedOn: string[];
};

export type HelpLegalPolicy = {
  id: string;
  title: string;
  summary: string;
  href: string;
  badge?: string;
  /** Optional docs deep-dive */
  docsHref?: string;
};

export type HelpLegalGroup = {
  id: string;
  title: string;
  description: string;
  icon: string;
  policies: HelpLegalPolicy[];
};
