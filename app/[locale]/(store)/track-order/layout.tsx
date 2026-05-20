import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track your order — Salvya",
  description: "Look up order status and delivery updates with your order number and email.",
};

export default function TrackOrderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
