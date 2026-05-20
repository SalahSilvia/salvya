import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Size guide — Salvya",
  description:
    "Salvya size guide: oversize fit, flat-lay diagram, body-chest size finder, cm/in chart with copy, care tips, and links to returns.",
};

export default function SizeGuideLayout({ children }: { children: React.ReactNode }) {
  return children;
}
