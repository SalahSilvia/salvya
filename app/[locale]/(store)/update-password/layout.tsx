import type { Metadata } from "next";
import { CustomerShellRedirect } from "@/components/member/CustomerShellRedirect";

export const metadata: Metadata = {
  title: "New password — Salvya",
  description: "Choose a new password for your Salvya account.",
};

export default function UpdatePasswordLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CustomerShellRedirect tone="daylight" />
      {children}
    </>
  );
}
