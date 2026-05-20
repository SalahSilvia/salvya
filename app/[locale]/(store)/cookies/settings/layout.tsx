import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie settings — Salvya",
  description:
    "Choose which optional cookie categories Salvya may use on this browser: functional, analytics, and marketing. Essential cookies always stay on.",
};

export default function CookieSettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
