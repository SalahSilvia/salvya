export type ReportCategoryId =
  | "bug"
  | "checkout"
  | "payment"
  | "delivery"
  | "account"
  | "product"
  | "app"
  | "other";

export type ReportAreaId =
  | "home"
  | "shop"
  | "product"
  | "bag"
  | "checkout"
  | "orders"
  | "account"
  | "menu"
  | "help"
  | "other";

export type ReportImpactId = "low" | "medium" | "high";

export const REPORT_CATEGORIES: { id: ReportCategoryId; label: string; hint: string }[] = [
  { id: "bug", label: "Bug / glitch", hint: "Something broke or looks wrong" },
  { id: "checkout", label: "Checkout", hint: "Cart, address, or placing order" },
  { id: "payment", label: "Payment", hint: "Card, PayPal, or COD issues" },
  { id: "delivery", label: "Shipping & delivery", hint: "Tracking, delays, wrong address" },
  { id: "account", label: "Account & login", hint: "Profile, password, notifications" },
  { id: "product", label: "Product page", hint: "Sizes, images, stock, artist shop" },
  { id: "app", label: "App experience", hint: "Speed, layout, menu, search" },
  { id: "other", label: "Something else", hint: "We'll route it to the right team" },
];

export const REPORT_AREAS: { id: ReportAreaId; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "shop", label: "Shop" },
  { id: "product", label: "Product" },
  { id: "bag", label: "Bag" },
  { id: "checkout", label: "Checkout" },
  { id: "orders", label: "My orders" },
  { id: "account", label: "Account" },
  { id: "menu", label: "Menu" },
  { id: "help", label: "Help center" },
  { id: "other", label: "Other / not sure" },
];

export const REPORT_IMPACT: { id: ReportImpactId; label: string; tone: string }[] = [
  { id: "low", label: "Minor", tone: "border-white/[0.1] bg-white/[0.04] text-white/60" },
  { id: "medium", label: "Blocking", tone: "border-amber-500/30 bg-amber-500/[0.08] text-amber-100/90" },
  { id: "high", label: "Urgent", tone: "border-rose-500/35 bg-rose-500/[0.1] text-rose-100/95" },
];

export type ReportProblemPayload = {
  category: ReportCategoryId;
  area: ReportAreaId;
  impact: ReportImpactId;
  description: string;
  steps?: string;
  email?: string;
  orderNumber?: string;
  pageUrl?: string;
  userAgent?: string;
  locale?: string;
};

const CATEGORY_SET = new Set(REPORT_CATEGORIES.map((c) => c.id));
const AREA_SET = new Set(REPORT_AREAS.map((a) => a.id));
const IMPACT_SET = new Set(REPORT_IMPACT.map((i) => i.id));

export function validateReportPayload(body: unknown):
  | { ok: true; data: ReportProblemPayload }
  | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid request body." };

  const o = body as Record<string, unknown>;
  const category = o.category;
  const area = o.area;
  const impact = o.impact;
  const description = typeof o.description === "string" ? o.description.trim() : "";

  if (typeof category !== "string" || !CATEGORY_SET.has(category as ReportCategoryId)) {
    return { ok: false, error: "Pick a problem type." };
  }
  if (typeof area !== "string" || !AREA_SET.has(area as ReportAreaId)) {
    return { ok: false, error: "Pick where it happened." };
  }
  if (typeof impact !== "string" || !IMPACT_SET.has(impact as ReportImpactId)) {
    return { ok: false, error: "Pick how much it affects you." };
  }
  if (description.length < 12) {
    return { ok: false, error: "Tell us a bit more (at least 12 characters)." };
  }
  if (description.length > 4000) {
    return { ok: false, error: "Description is too long (max 4000 characters)." };
  }

  const email = typeof o.email === "string" ? o.email.trim() : "";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Enter a valid email or leave it blank." };
  }

  const steps = typeof o.steps === "string" ? o.steps.trim().slice(0, 2000) : undefined;
  const orderNumber = typeof o.orderNumber === "string" ? o.orderNumber.trim().slice(0, 64) : undefined;
  const pageUrl = typeof o.pageUrl === "string" ? o.pageUrl.trim().slice(0, 500) : undefined;
  const userAgent = typeof o.userAgent === "string" ? o.userAgent.trim().slice(0, 500) : undefined;
  const locale = typeof o.locale === "string" ? o.locale.trim().slice(0, 12) : undefined;

  return {
    ok: true,
    data: {
      category: category as ReportCategoryId,
      area: area as ReportAreaId,
      impact: impact as ReportImpactId,
      description,
      steps: steps || undefined,
      email: email || undefined,
      orderNumber: orderNumber || undefined,
      pageUrl: pageUrl || undefined,
      userAgent: userAgent || undefined,
      locale: locale || undefined,
    },
  };
}

export function reportReferenceId(): string {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `RP-${t}-${r}`;
}

export function labelForCategory(id: ReportCategoryId): string {
  return REPORT_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function labelForArea(id: ReportAreaId): string {
  return REPORT_AREAS.find((a) => a.id === id)?.label ?? id;
}

export function labelForImpact(id: ReportImpactId): string {
  return REPORT_IMPACT.find((i) => i.id === id)?.label ?? id;
}
