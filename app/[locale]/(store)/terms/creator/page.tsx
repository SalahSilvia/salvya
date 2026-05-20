import type { Metadata } from "next";
import Link from "next/link";
import { InfluencerTermsContent } from "@/components/legal/InfluencerTermsContent";
import { LegalTermsSubpageShell } from "@/components/legal/LegalTermsSubpageShell";

export const metadata: Metadata = {
  title: "Creator programme terms — Salvya",
  description:
    "Addendum to Salvya Terms of Service for creators: promo codes, fan discounts, commissions, payouts, brand safety, and programme rules.",
};

export default function CreatorTermsPage() {
  return (
    <LegalTermsSubpageShell pill="Legal">
      <article className="mx-auto max-w-3xl px-[max(1.25rem,env(safe-area-inset-left))] pb-24 pr-[max(1.25rem,env(safe-area-inset-right))] pt-12 sm:pt-16">
        <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-slate-500">Salvya · Addendum</p>
        <h1 className="mt-2 text-[2rem] font-bold tracking-[-0.04em] text-slate-950 sm:text-[2.35rem]">
          Creator programme terms
        </h1>
        <p className="mt-3 text-[14px] text-slate-600">
          For creators participating in Salvya promo codes and commissions — read with the{" "}
          <Link href="/terms" className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/terms/account"
            className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
          >
            Account creation addendum
          </Link>
          .
        </p>
        <InfluencerTermsContent embedded={false} />
      </article>
    </LegalTermsSubpageShell>
  );
}
