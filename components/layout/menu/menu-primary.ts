import type { MenuView } from "./menu-views";

export type MenuRow =
  | {
      id: string;
      kind: "route";
      label: string;
      href: string;
    }
  | {
      id: string;
      kind: "subview";
      label: string;
      view: Exclude<MenuView, "main">;
    };

export type MenuSection = {
  id: string;
  title: string;
  rows: MenuRow[];
};

export const MENU_SECTIONS: MenuSection[] = [
  {
    id: "shop",
    title: "Shopping",
    rows: [
      { id: "home", kind: "route", label: "Home", href: "/" },
      { id: "shop", kind: "route", label: "Browse the shop", href: "/shop" },
      { id: "bag", kind: "route", label: "Your bag", href: "/preview-bag" },
      { id: "track", kind: "route", label: "Track an order", href: "/track-order" },
      { id: "sizes", kind: "route", label: "Size guide", href: "/size-guide" },
      { id: "help-center", kind: "route", label: "Help center", href: "/help-center" },
    ],
  },
  {
    id: "about",
    title: "About",
    rows: [
      { id: "about-page", kind: "route", label: "Our story & team", href: "/about" },
      { id: "blog", kind: "route", label: "Blogs", href: "/blogs" },
    ],
  },
  {
    id: "artists",
    title: "Creators",
    rows: [{ id: "creator-more", kind: "subview", label: "Artist & creator tools", view: "creator" }],
  },
  {
    id: "legal",
    title: "Policies",
    rows: [{ id: "policies-more", kind: "subview", label: "Help & legal pages", view: "policies" }],
  },
];

/** Guest menu overlay / `/menu` — policies only. */
export const GUEST_MENU_SECTIONS: MenuSection[] = [
  {
    id: "legal",
    title: "Policies",
    rows: [{ id: "policies-more", kind: "subview", label: "Help & legal pages", view: "policies" }],
  },
];
