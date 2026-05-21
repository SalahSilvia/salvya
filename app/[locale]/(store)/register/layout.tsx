import type { Metadata } from "next";
import { CustomerShellRedirect } from "@/components/member/CustomerShellRedirect";
import { buildAuthPageMetadata } from "@/lib/auth/auth-metadata";

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildAuthPageMetadata(locale, "register");
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CustomerShellRedirect tone="daylight" />
      {children}
    </>
  );
}