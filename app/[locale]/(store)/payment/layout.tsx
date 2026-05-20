import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment terms — Salvya",
  description:
    "Salvya payment terms: accepted methods, authorisation, currency, taxes, COD, failed payments, refunds, fraud prevention, and payment processors.",
};

export default function PaymentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
