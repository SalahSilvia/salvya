import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Salvya — Artist merch & fan-first checkout",
  description:
    "Salvya: Moroccan–Italian founders, Tarfaya to Agadir, EU growth, Italy & Morocco production. Interactive About — timeline, founders, production map, fans vs artists tabs, FAQ, impact stats.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
