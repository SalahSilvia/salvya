import type { CustomerMenuLink } from "@/lib/member/customer-menu-links";

type MenuTranslator = (key: string) => string;

function tr(t: MenuTranslator, key: string): string {
  const dot = key.indexOf(".");
  if (dot === -1) return t(key);
  return t(key.slice(dot + 1));
}

/** Maps menu link `id` → next-intl keys under `menu` (and `common` where noted). */
const MENU_LINK_KEYS: Record<string, { label: string; hint?: string }> = {
  blog: { label: "blogs", hint: "blogsHint" },
  contact: { label: "contactUs", hint: "contactHint" },
  orders: { label: "myOrders", hint: "myOrdersHint" },
  likes: { label: "likes", hint: "likesHint" },
  dashboard: { label: "creatorDashboard", hint: "creatorDashboardHint" },
  help: { label: "helpCenter" },
  "report-problem": { label: "reportProblem", hint: "reportProblemHint" },
  track: { label: "trackOrder" },
  "terms-recovery": { label: "signInHelp" },
  shipping: { label: "shipping" },
  payment: { label: "payment" },
  returns: { label: "returns" },
  terms: { label: "terms" },
  "terms-account": { label: "accountTerms" },
  "terms-influencer": { label: "creatorTerms" },
  cookies: { label: "cookies" },
  "cookies-settings": { label: "cookieSettings" },
  home: { label: "common.home", hint: "homeHintMember" },
  shop: { label: "browseShop", hint: "browseShopHint" },
  bag: { label: "yourBag", hint: "yourBagHint" },
  sizes: { label: "sizeGuide", hint: "sizeGuideHint" },
  about: { label: "ourStory", hint: "ourStoryHint" },
  policies: { label: "policies" },
};

const MENU_GROUP_TITLE_KEYS: Record<string, string> = {
  orders: "ordersHelp",
  shopping: "shopping",
  legal: "legal",
};

export function localizeMenuLinks(
  links: CustomerMenuLink[],
  tMenu: MenuTranslator,
  tCommon?: MenuTranslator,
): CustomerMenuLink[] {
  const resolve = (key: string) => {
    if (key.startsWith("common.") && tCommon) return tCommon(key.slice(7));
    return tr(tMenu, key);
  };
  return links.map((link) => {
    const keys = MENU_LINK_KEYS[link.id];
    if (!keys) return link;
    return {
      ...link,
      label: resolve(keys.label),
      hint: keys.hint ? tr(tMenu, keys.hint) : undefined,
    };
  });
}

export function localizeMenuGroupTitle(groupId: string, tMenu: MenuTranslator): string {
  const key = MENU_GROUP_TITLE_KEYS[groupId];
  return key ? tMenu(key) : groupId;
}
