import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Returns & Refunds — Salvya",
  description:
    "Salvya: no change-of-mind returns for on-demand goods; cancel within 12 hours; exchanges Morocco-only unless team-approved with proof; defects under mandatory law.",
};

export default function ReturnsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
