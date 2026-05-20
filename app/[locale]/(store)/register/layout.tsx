import type { Metadata } from "next";
import { CustomerShellRedirect } from "@/components/member/CustomerShellRedirect";
import { buildPrivatePageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPrivatePageMetadata({
  title: "Create account",
  description: "Create a Salvya customer account to save your details, track orders, and shop artist merch faster.",
  path: "/register",
});

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CustomerShellRedirect tone="daylight" />
      {children}
    </>
  );
}