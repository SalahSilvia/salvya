export type MenuView = "main" | "creator" | "policies";

export type SubLink = {
  href: string;
  label: string;
};

export const SUBVIEW_LINKS: Record<Exclude<MenuView, "main">, { title: string; links: SubLink[] }> = {
  creator: {
    title: "Creator programme",
    links: [
      { href: "/creator/dashboard", label: "Creator Workspace" },
      { href: "/creator/products", label: "Promoted products" },
      { href: "/creator/links", label: "My links" },
      { href: "/creator", label: "Creator home" },
    ],
  },
  policies: {
    title: "Help & policies",
    links: [
      { href: "/terms", label: "Terms of Service" },
      { href: "/terms/account", label: "Account terms" },
      { href: "/terms/creator", label: "Creator programme terms" },
      { href: "/terms#recovery", label: "Account & sign-in help" },
      { href: "/shipping", label: "Shipping" },
      { href: "/payment", label: "Payment" },
      { href: "/returns", label: "Returns" },
      { href: "/cookies", label: "Cookies" },
      { href: "/cookies/settings", label: "Cookie settings" },
    ],
  },
};
