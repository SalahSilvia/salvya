import type { Metadata } from "next";
import { CustomerShellRedirect } from "@/components/member/CustomerShellRedirect";
import { buildAuthPageMetadata } from "@/lib/auth/auth-metadata";

export const dynamic = "force-dynamic";

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildAuthPageMetadata(locale, "login");
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CustomerShellRedirect tone="daylight" />
      {children}
    </>
  );
}