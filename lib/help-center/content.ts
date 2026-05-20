import type {
  HelpAiArticle,
  HelpDevEndpoint,
  HelpFaq,
  HelpFlow,
  HelpKbCategory,
  HelpLegalGroup,
  HelpPlatformLink,
  HelpPopularAction,
  HelpSchemaType,
  HelpTabId,
} from "@/lib/help-center/types";

export const HELP_CENTER_PATH = "/help-center";
export const FAQ_PATH = "/faq";

export const HELP_FAQ_GROUP_META: { id: HelpFaq["group"] | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "customer", label: "Customers" },
  { id: "creator", label: "Creators" },
  { id: "developer", label: "Developers" },
  { id: "payment", label: "Payments" },
  { id: "ai", label: "AI & SEO" },
];

export const HELP_TAB_META: { id: HelpTabId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "customers", label: "Customers" },
  { id: "creators", label: "Creators" },
  { id: "developers", label: "Developers" },
  { id: "policies", label: "Policies" },
  { id: "platform", label: "Platform" },
  { id: "ai", label: "AI & SEO" },
  { id: "api", label: "API" },
];

export const HELP_TAB_SECTIONS: Record<HelpTabId, "all" | string[]> = {
  all: "all",
  customers: ["orders", "account"],
  creators: ["creators"],
  developers: ["developers", "api"],
  policies: ["legal"],
  platform: ["platform"],
  ai: ["ai"],
  api: ["api", "developers"],
};

export const HELP_TRENDING_SEARCHES = [
  { label: "Refund", q: "refund" },
  { label: "Tracking", q: "track" },
  { label: "Creator", q: "creator" },
  { label: "API", q: "api" },
  { label: "Shipping", q: "shipping" },
  { label: "Sign in", q: "sign in" },
  { label: "Payouts", q: "payout" },
  { label: "Webhook", q: "webhook" },
  { label: "Terms", q: "terms" },
  { label: "Policies", q: "policies" },
  { label: "Cookies", q: "cookies" },
  { label: "Privacy", q: "privacy" },
];

export type HelpQuickLink = { label: string; href: string; accent?: boolean };

export const HELP_QUICK_LINKS: HelpQuickLink[] = [
  { label: "FAQ", href: FAQ_PATH, accent: true },
  { label: "All policies", href: "/help-center#legal-policies" },
  { label: "Terms", href: "/terms" },
  { label: "Returns", href: "/returns" },
  { label: "Shipping", href: "/shipping" },
  { label: "Cookies", href: "/cookies" },
  { label: "Cookie settings", href: "/cookies/settings" },
  { label: "Payment", href: "/payment" },
  { label: "Creator terms", href: "/terms/creator" },
  { label: "Trust", href: "/trust" },
  { label: "Contact", href: "/contact" },
];

export const HELP_LEGAL_HUB: HelpLegalGroup[] = [
  {
    id: "terms-agreements",
    title: "Terms & agreements",
    description: "Core service rules, account eligibility, and creator programme legal.",
    icon: "§",
    policies: [
      {
        id: "terms-main",
        title: "Terms of Service",
        summary: "Rules for browsing, buying official merch, and using Salvya.",
        href: "/terms",
        badge: "Primary",
      },
      {
        id: "terms-account",
        title: "Account terms",
        summary: "Profile responsibilities, eligibility, suspension, and closure.",
        href: "/terms/account",
      },
      {
        id: "terms-creator",
        title: "Creator programme terms",
        summary: "Commissions, payouts, attribution, and programme conduct.",
        href: "/terms/creator",
        badge: "Creators",
      },
      {
        id: "account-recovery",
        title: "Sign-in & recovery",
        summary: "Password reset, device limits, and account lockout help.",
        href: "/terms#recovery",
      },
    ],
  },
  {
    id: "shopping-orders",
    title: "Shopping & orders",
    description: "Checkout, delivery, sizing, payments, and post-purchase policies.",
    icon: "🛍",
    policies: [
      {
        id: "returns",
        title: "Returns & refunds",
        summary: "Eligibility windows, condition rules, and refund timing.",
        href: "/returns",
        badge: "Orders",
      },
      {
        id: "shipping",
        title: "Shipping & delivery",
        summary: "Regions, carriers, production timelines, and tracking.",
        href: "/shipping",
      },
      {
        id: "payment",
        title: "Payment methods",
        summary: "Cards, PayPal, COD where offered, and failed payment help.",
        href: "/payment",
      },
      {
        id: "size-guide",
        title: "Size guide",
        summary: "Measurements and fit guidance before you choose a size.",
        href: "/size-guide",
      },
      {
        id: "track-order",
        title: "Track order",
        summary: "Lookup by SVY reference and email — no account required.",
        href: "/track-order",
      },
    ],
  },
  {
    id: "privacy-cookies",
    title: "Privacy & cookies",
    description: "How Salvya uses data, cookies, and consent controls.",
    icon: "🔒",
    policies: [
      {
        id: "cookies",
        title: "Cookies policy",
        summary: "Essential, analytics, and marketing cookies we may use.",
        href: "/cookies",
        badge: "Privacy",
      },
      {
        id: "cookies-settings",
        title: "Cookie settings",
        summary: "Update non-essential cookie and tracking preferences.",
        href: "/cookies/settings",
      },
      {
        id: "machine-readable",
        title: "AI-readable policy index",
        summary: "Structured policy summaries for search engines and assistants.",
        href: "/docs/policies/machine-readable",
        docsHref: "/docs/policies/machine-readable",
      },
    ],
  },
  {
    id: "support-compliance",
    title: "Support & compliance",
    description: "Contact channels, reporting, trust, and security disclosure.",
    icon: "✓",
    policies: [
      {
        id: "contact",
        title: "Contact support",
        summary: "Orders, account access, and general Salvya enquiries.",
        href: "/contact",
      },
      {
        id: "report-problem",
        title: "Report a problem",
        summary: "Checkout bugs, listing issues, or platform abuse reports.",
        href: "/report-problem",
      },
      {
        id: "trust",
        title: "Trust & safety",
        summary: "Fraud prevention, moderation, and payout integrity overview.",
        href: "/trust",
        docsHref: "/trust",
      },
      {
        id: "security",
        title: "Security",
        summary: "Platform security practices and responsible disclosure.",
        href: "/security",
      },
      {
        id: "security-disclosure",
        title: "Security disclosure",
        summary: "Report vulnerabilities through our responsible disclosure channel.",
        href: "/contact?topic=security-disclosure",
      },
    ],
  },
];

export const HELP_POPULAR_ACTIONS: HelpPopularAction[] = [
  { id: "legal-hub", title: "Legal & Policies", description: "All terms, privacy & shopping rules", href: "/help-center#legal-policies", icon: "legal", section: "legal" },
  { id: "track", title: "Track Order", description: "SVY reference + email lookup", href: "/track-order", icon: "track", section: "orders" },
  { id: "returns", title: "Returns & Refunds", description: "Windows, conditions, refunds", href: "/returns", icon: "returns", section: "legal" },
  { id: "shipping", title: "Shipping & Delivery", description: "Regions, carriers, timelines", href: "/shipping", icon: "shipping", section: "legal" },
  { id: "signin", title: "Sign In Help", description: "Recovery, devices, passwords", href: "/terms#recovery", icon: "signin", section: "account" },
  { id: "creator-dash", title: "Creator Dashboard", description: "Workspace analytics & links", href: "/creator/dashboard", icon: "creator", section: "creators" },
  { id: "apply", title: "Apply To Sell", description: "Creator programme onboarding", href: "/creator/apply", icon: "apply", section: "creators" },
  { id: "cookies", title: "Cookie Settings", description: "Privacy preference controls", href: "/cookies/settings", icon: "cookies", section: "legal" },
  { id: "dev-api", title: "Developer API", description: "REST endpoints & auth", href: "/developers#api", icon: "api", section: "developers" },
  { id: "sitemap", title: "Sitemap", description: "Public crawl index", href: "/sitemap.xml", icon: "sitemap", section: "platform" },
  { id: "status", title: "Platform Status", description: "Support & incident reporting", href: "/contact", icon: "status", section: "platform" },
];

export const HELP_KB_CATEGORIES: HelpKbCategory[] = [
  {
    id: "shopping",
    title: "Shopping & Orders",
    description: "Tracking, refunds, delivery, sizing, and payments.",
    topicIds: ["shop-home", "bag", "track", "sizes", "shipping", "returns", "payment", "about"],
  },
  {
    id: "account-security",
    title: "Account & Security",
    description: "Login, sessions, recovery, device limits, and passwords.",
    topicIds: ["recovery", "login", "register", "account", "forgot-password", "update-password"],
  },
  {
    id: "creators",
    title: "Creators",
    description: "Onboarding, payouts, analytics, links, and approval.",
    topicIds: ["creator-home", "creator-apply", "creator-dashboard", "creator-rewards", "creator-wallet", "creator-analytics", "creator-terms", "creator-notifications"],
  },
  {
    id: "platform",
    title: "Platform",
    description: "How Salvya works, trust, moderation, and discovery.",
    topicIds: ["about", "help-faq", "help-ai-overview", "help-trust", "help-search", "help-notifications", "menu"],
  },
  {
    id: "developers",
    title: "Developers",
    description: "API docs, authentication, SDKs, webhooks, and limits.",
    topicIds: ["dev-portal", "dev-auth", "dev-orders-api", "dev-products-api", "dev-creators-api", "dev-webhooks", "openapi-spec"],
  },
  {
    id: "legal",
    title: "Legal & Policies",
    description: "Privacy, cookies, terms, returns, and compliance.",
    topicIds: ["terms", "terms-account", "terms-influencer", "cookies", "cookies-settings", "returns", "shipping", "payment", "contact", "report-problem"],
  },
];

export const HELP_AI_ARTICLES: HelpAiArticle[] = [
  { id: "how-salvya-works", title: "How Salvya Works", summary: "Creator-commerce platform: official artist merch, limited drops, fan checkout, and creator attribution.", href: "/about", tags: ["platform", "overview"] },
  { id: "architecture", title: "Platform Architecture", summary: "Storefront, creator workspace, Supabase auth, order ledger, and payout engine.", href: "/help-center#ai-seo", tags: ["architecture", "engineering"] },
  { id: "public-index", title: "Public Pages Index", summary: "Shop, creators, policies, help center, blog, auth, tracking, and legal surfaces.", href: "/help-center#platform-index", tags: ["sitemap", "navigation"] },
  { id: "product-lifecycle", title: "Product Lifecycle", summary: "Catalog SKU → PDP → bag → checkout → production → shipment.", href: "/shop", tags: ["product", "commerce"] },
  { id: "order-lifecycle", title: "Order Lifecycle", summary: "Placement → payment verification → fulfillment → delivery → optional refund.", href: "/track-order", tags: ["orders", "fulfillment"] },
  { id: "refund-lifecycle", title: "Refund Lifecycle", summary: "Customer request → eligibility → approval → payout reversal.", href: "/returns", tags: ["refunds", "policy"] },
  { id: "shipping-lifecycle", title: "Shipping Lifecycle", summary: "Address capture → carrier assignment → tracking URL → delivery confirmation.", href: "/shipping", tags: ["shipping", "logistics"] },
  { id: "creator-ecosystem", title: "Creator Ecosystem", summary: "Apply → review → workspace → promote → attributed orders → DH payouts.", href: "/creator", tags: ["creators", "monetization"] },
  { id: "trust-safety", title: "Trust & Safety", summary: "Fraud checks, self-referral blocks, moderation, and payout holds.", href: "/terms", tags: ["trust", "safety"] },
  { id: "structured-data", title: "Structured Data Overview", summary: "Schema.org Product, FAQ, Breadcrumb, Organization, and Article coverage.", href: "/help-center#structured-data", tags: ["seo", "schema"] },
  { id: "ai-policies", title: "AI-readable Policies", summary: "Terms, creator programme, cookies, and returns written for humans and crawlers.", href: "/terms", tags: ["policies", "ai"] },
];

export const HELP_DEV_ENDPOINTS: HelpDevEndpoint[] = [
  { id: "orders-list", method: "GET", path: "/api/orders", summary: "List authenticated customer orders", auth: "Session cookie / Bearer" },
  { id: "orders-create", method: "POST", path: "/api/orders", summary: "Place checkout order with attribution", auth: "Session cookie" },
  { id: "cart", method: "GET", path: "/api/cart", summary: "Read synced bag lines", auth: "Session cookie" },
  { id: "creator-stats", method: "GET", path: "/api/creator/stats", summary: "Creator dashboard metrics", auth: "Creator session" },
  { id: "creator-wallet", method: "GET", path: "/api/creator/wallet", summary: "Balances, payouts, commission profile", auth: "Creator session" },
  { id: "creator-links", method: "GET", path: "/api/creator/product-links", summary: "Promo links and tracking codes", auth: "Creator session" },
  { id: "creator-analytics", method: "GET", path: "/api/creator/analytics", summary: "Link performance and conversion", auth: "Creator session" },
  { id: "auth-me", method: "GET", path: "/api/auth/me", summary: "Current session profile", auth: "Session cookie" },
  { id: "report-problem", method: "POST", path: "/api/report-problem", summary: "Submit support / abuse reports", auth: "Optional session" },
];

export const HELP_PLATFORM_FLOWS: HelpFlow[] = [
  {
    id: "customer",
    title: "Customer journey",
    audience: "customer",
    steps: [
      { label: "Visit product", detail: "Artist PDP or shop discovery" },
      { label: "Add to bag" },
      { label: "Checkout" },
      { label: "Payment" },
      { label: "Verification" },
      { label: "Shipment" },
      { label: "Tracking" },
      { label: "Delivered" },
      { label: "Refund (optional)" },
    ],
  },
  {
    id: "creator",
    title: "Creator journey",
    audience: "creator",
    steps: [
      { label: "Apply" },
      { label: "Review" },
      { label: "Approval" },
      { label: "Dashboard" },
      { label: "Promote" },
      { label: "Orders" },
      { label: "Payouts" },
    ],
  },
];

export const HELP_PLATFORM_INDEX: HelpPlatformLink[] = [
  { label: "Shop", href: "/shop", group: "Commerce" },
  { label: "Creators", href: "/creator", group: "Creators" },
  { label: "Help Center", href: "/help-center", group: "Support" },
  { label: "FAQ", href: FAQ_PATH, group: "Support" },
  { label: "Blog", href: "/blogs", group: "Content" },
  { label: "Sign in", href: "/login", group: "Auth" },
  { label: "Track order", href: "/track-order", group: "Orders" },
  { label: "Terms", href: "/terms", group: "Legal" },
  { label: "Privacy & cookies", href: "/cookies", group: "Legal" },
  { label: "Creator dashboard", href: "/creator/dashboard", group: "Creators" },
  { label: "Developer portal", href: "/developers", group: "Developers" },
  { label: "OpenAPI spec", href: "/openapi.json", group: "Developers" },
  { label: "Sitemap", href: "/sitemap.xml", group: "SEO" },
  { label: "Robots", href: "/robots.txt", group: "SEO" },
  { label: "LLMs.txt", href: "/llms.txt", group: "AI" },
];

export const HELP_SCHEMA_TYPES: HelpSchemaType[] = [
  { id: "product", name: "Product", description: "Official merch PDPs with offers and availability.", usedOn: ["Product pages", "Artist catalogs"] },
  { id: "faq", name: "FAQPage", description: "Question/answer pairs for help and policy summaries.", usedOn: ["Help Center", "Policy pages"] },
  { id: "breadcrumb", name: "BreadcrumbList", description: "Hierarchical navigation for crawlers.", usedOn: ["Shop", "Help", "Legal"] },
  { id: "organization", name: "Organization", description: "Salvya brand entity and publisher.", usedOn: ["Site-wide"] },
  { id: "article", name: "Article / BlogPosting", description: "Editorial and culture content.", usedOn: ["Blog"] },
  { id: "website", name: "WebSite", description: "Site search action and publisher linkage.", usedOn: ["Home", "Help Center"] },
];

export const HELP_FOOTER_COLUMNS = [
  {
    title: "Platform",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blogs" },
      { label: "Shop", href: "/shop" },
      { label: "Help Center", href: "/help-center" },
      { label: "Menu", href: "/menu" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Track order", href: "/track-order" },
      { label: "Returns & refunds", href: "/returns" },
      { label: "Shipping & delivery", href: "/shipping" },
      { label: "Size guide", href: "/size-guide" },
      { label: "Contact support", href: "/contact" },
      { label: "Report a problem", href: "/report-problem" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "Developer portal", href: "/developers" },
      { label: "API reference", href: "/developers#api" },
      { label: "OpenAPI", href: "/openapi.json" },
      { label: "Webhooks", href: "/developers#webhooks" },
    ],
  },
  {
    title: "Legal hub",
    links: [
      { label: "All policies (Help Center)", href: "/help-center#legal-policies" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Returns & refunds", href: "/returns" },
      { label: "Privacy & cookies", href: "/cookies" },
      { label: "Cookie settings", href: "/cookies/settings" },
    ],
  },
  {
    title: "AI & SEO",
    links: [
      { label: "AI overview", href: "/ai" },
      { label: "How Salvya works", href: "/platform" },
      { label: "Structured data", href: "/help-center#structured-data" },
      { label: "Architecture", href: "/architecture" },
      { label: "Trust & safety", href: "/trust" },
      { label: "Sitemap", href: "/sitemap.xml" },
      { label: "LLMs.txt", href: "/llms.txt" },
      { label: "Robots.txt", href: "/robots.txt" },
    ],
  },
] as const;

export const HELP_SUPPORT_LINKS = [
  { id: "contact-support", label: "Contact support", href: "/contact", description: "Reach the Salvya team" },
  { id: "report-problem", label: "Report a problem", href: "/report-problem", description: "Bug or checkout issue" },
  { id: "creator-support", label: "Creator support", href: "/creator/more", description: "Workspace help & policies" },
  {
    id: "security-disclosure",
    label: "Security disclosure",
    href: "/contact?topic=security-disclosure",
    description: "Responsible disclosure channel",
  },
];
