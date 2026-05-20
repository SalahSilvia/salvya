import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Salvya",
  description:
    "Salvya Terms of Service: eligibility, accounts, marketplace, orders, shipping, payment, returns, liability, governing law, plus Account creation and Influencer programme addenda. See also Shipping, Payment, Returns, and Cookie policies.",
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
