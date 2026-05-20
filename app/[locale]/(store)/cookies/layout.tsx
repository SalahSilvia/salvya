import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie policy — Salvya",
  description:
    "How Salvya uses cookies and similar technologies: essential cookies, preferences, analytics, third parties (e.g. checkout), retention, and your choices. Manage optional categories in Cookie settings.",
};

export default function CookiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
