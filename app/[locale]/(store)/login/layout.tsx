import type { Metadata } from "next";
import { CustomerShellRedirect } from "@/components/member/CustomerShellRedirect";
import { buildPrivatePageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPrivatePageMetadata({
  title: "Sign in",
  description: "Log in to your Salvya account to manage orders and saved details.",
  path: "/login",
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CustomerShellRedirect tone="daylight" />
      {children}
    </>
  );
}