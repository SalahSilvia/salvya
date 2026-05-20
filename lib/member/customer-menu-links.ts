/** Customer-only menu destinations (no creator / influencer hub). */

export type CustomerMenuLink = {
  id: string;
  href: string;
  label: string;
  hint?: string;
};

export const CUSTOMER_PROFILE_HREF = "/account/profile";
export const CUSTOMER_SETTINGS_HREF = "/account/settings";

/** Main shopping destinations — editorial labels. */
export const CUSTOMER_SHOPPING_LINKS: CustomerMenuLink[] = [
  { id: "home", href: "/", label: "Home", hint: "Member home & personalized drops" },
  { id: "shop", href: "/shop", label: "Browse Shop", hint: "All artists & collections" },
  { id: "bag", href: "/preview-bag", label: "Your Bag", hint: "Saved lines & checkout" },
  { id: "track", href: "/track-order", label: "Track Order", hint: "SVY number + email lookup" },
  { id: "sizes", href: "/size-guide", label: "Size Guide", hint: "Oversized fit & measurements" },
];

/** Calmer “document” links — help & policy surface. */
export const CUSTOMER_HELP_LEGAL_LINKS: CustomerMenuLink[] = [
  { id: "help", href: "/help-center", label: "Help Center" },
  { id: "policies", href: "/terms", label: "Policies" },
  { id: "shipping", href: "/shipping", label: "Shipping" },
  { id: "returns", href: "/returns", label: "Returns" },
  { id: "cookies", href: "/cookies", label: "Cookies" },
];

/** About — used by editorial block (not a dense list). */
export const CUSTOMER_ABOUT_STORY_HREF = "/about";

/** Legacy exports — policies list still available for deep links elsewhere. */
export const CUSTOMER_ABOUT_LINKS: CustomerMenuLink[] = [
  { id: "about", href: "/about", label: "Our story & team", hint: "Why Salvya exists" },
];

export const CUSTOMER_POLICY_LINKS: CustomerMenuLink[] = [
  { id: "terms", href: "/terms", label: "Terms of Service" },
  { id: "terms-account", href: "/terms/account", label: "Account terms" },
  { id: "terms-recovery", href: "/terms#recovery", label: "Account & sign-in help" },
  { id: "shipping", href: "/shipping", label: "Shipping" },
  { id: "payment", href: "/payment", label: "Payment" },
  { id: "returns", href: "/returns", label: "Returns" },
  { id: "cookies", href: "/cookies", label: "Cookies" },
  { id: "cookies-settings", href: "/cookies/settings", label: "Cookie settings" },
];
