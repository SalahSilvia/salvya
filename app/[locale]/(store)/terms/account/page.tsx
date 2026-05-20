import type { Metadata } from "next";
import Link from "next/link";
import { AccountCreationTermsContent } from "@/components/legal/AccountCreationTermsContent";
import { LegalTermsSubpageShell } from "@/components/legal/LegalTermsSubpageShell";

export const metadata: Metadata = {
  title: "Account creation terms — Salvya",
  description:
    "Addendum to Salvya Terms of Service for creating a customer or creator account: accuracy, security, minors, preview environments, and related policies.",
};

export default function AccountCreationTermsPage() {
  return (
    <LegalTermsSubpageShell pill="Legal">
      <article className="mx-auto max-w-3xl px-[max(1.25rem,env(safe-area-inset-left))] pb-24 pr-[max(1.25rem,env(safe-area-inset-right))] pt-12 sm:pt-16">
        <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-slate-500">Salvya · Addendum</p>
        <h1 className="mt-2 text-[2rem] font-bold tracking-[-0.04em] text-slate-950 sm:text-[2.35rem]">
          Account creation terms
        </h1>
        <p className="mt-3 text-[14px] text-slate-600">
          For customers and creators — read together with the{" "}
          <Link href="/terms" className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600">
            Terms of Service
          </Link>
          .
        </p>
        <AccountCreationTermsContent embedded={false} />
      </article>
    </LegalTermsSubpageShell>
  );
}
