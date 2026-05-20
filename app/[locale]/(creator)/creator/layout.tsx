import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creators — Salvya",
  description:
    "Salvya creator program — earn per sale, give fans 10% off, and unlock milestone rewards. Apply with one account.",
};

/** Root creator segment — auth is enforced under dashboard/ and onboarding/ layouts only. */
export default function CreatorRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
