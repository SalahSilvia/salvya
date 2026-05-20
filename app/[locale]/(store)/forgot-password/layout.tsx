import type { Metadata } from "next";
import { CustomerShellRedirect } from "@/components/member/CustomerShellRedirect";

export const metadata: Metadata = {
  title: "Reset password — Salvya",
  description: "Request a secure link to reset your Salvya account password.",
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CustomerShellRedirect tone="daylight" />
      {children}
    </>
  );
}
