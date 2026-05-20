import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping & Delivery — Salvya",
  description:
    "Salvya shipping regions, carriers, processing times, international duties, tracking, and delivery terms.",
};

export default function ShippingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
