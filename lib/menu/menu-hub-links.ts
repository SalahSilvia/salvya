import {
  CUSTOMER_ABOUT_STORY_HREF,
  CUSTOMER_POLICY_LINKS,
  CUSTOMER_PROFILE_HREF,
  CUSTOMER_SETTINGS_HREF,
  CUSTOMER_SHOPPING_LINKS,
  type CustomerMenuLink,
} from "@/lib/member/customer-menu-links";

export type MenuHubLink = CustomerMenuLink;

/** Discover — existing storefront routes only. */
export const MENU_DISCOVER_GUEST: MenuHubLink[] = [
  { id: "blog", href: "/blogs", label: "Blogs", hint: "Stories & culture" },
  { id: "contact", href: "/contact", label: "Contact us", hint: "Email, WhatsApp & phone" },
];

export const MENU_DISCOVER_MEMBER: MenuHubLink[] = [
  { id: "orders", href: "/orders", label: "My orders", hint: "Invoices, history & cancellation" },
  { id: "blog", href: "/blogs", label: "Blogs", hint: "Stories & drops" },
  { id: "contact", href: "/contact", label: "Contact us", hint: "Email, WhatsApp & phone" },
  { id: "likes", href: "/likes", label: "Likes", hint: "Saved pieces" },
];

export const MENU_CREATOR_DASHBOARD: MenuHubLink = {
  id: "dashboard",
  href: "/creator/dashboard",
  label: "Creator dashboard",
  hint: "Manage your store",
};

export const MENU_POLICY_GROUPS: { id: string; title: string; links: MenuHubLink[] }[] = [
  {
    id: "orders",
    title: "Orders & help",
    links: [
      { id: "help", href: "/help-center", label: "Help center" },
      { id: "contact", href: "/contact", label: "Contact us" },
      { id: "report-problem", href: "/report-problem", label: "Report a problem", hint: "Help us improve the app" },
      { id: "track", href: "/track-order", label: "Track an order" },
      { id: "terms-recovery", href: "/terms#recovery", label: "Sign-in help" },
    ],
  },
  {
    id: "shopping",
    title: "Shopping",
    links: [
      { id: "shipping", href: "/shipping", label: "Shipping" },
      { id: "payment", href: "/payment", label: "Payment" },
      { id: "returns", href: "/returns", label: "Returns" },
    ],
  },
  {
    id: "legal",
    title: "Legal",
    links: CUSTOMER_POLICY_LINKS.filter((l) =>
      ["terms", "terms-account", "terms-influencer", "cookies", "cookies-settings"].includes(l.id),
    ),
  },
];

export {
  CUSTOMER_SHOPPING_LINKS,
  CUSTOMER_PROFILE_HREF,
  CUSTOMER_SETTINGS_HREF,
  CUSTOMER_ABOUT_STORY_HREF,
};
