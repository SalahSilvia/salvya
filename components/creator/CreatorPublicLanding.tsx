import Link from "next/link";
import { CreatorCommissionRulesTable } from "@/components/creator/CreatorCommissionRulesTable";
import {
  CREATOR_APPLY_PATH,
  creatorApplyCtaLabel,
  creatorApplyGuestHint,
} from "@/lib/creator/apply-navigation";
import { creatorCtaButton } from "@/lib/theme/creator-accent";
import { loginHref, registerHref } from "@/lib/auth/login-href";

const BENEFITS = [
  { title: "Promote the catalog", body: "Share trackable links to official Salvya drops." },
  { title: "Creator workspace", body: "Manage links, clicks, and promoted products in one place." },
  { title: "Built for artists", body: "A dedicated space separate from the customer storefront." },
] as const;

type Props = {
  variant: "guest" | "customer";
};

export function CreatorPublicLanding({ variant }: Props) {
  const isGuest = variant === "guest";

  return (
    <div className="min-h-dvh bg-[#050508] text-white antialiased">
      <header className="border-b border-white/[0.06] bg-[#050508]/90 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/shop" className="text-[13px] font-semibold text-white/50 transition-colors hover:text-white">
            ← Shop
          </Link>
          <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-violet-200/90">
            Creator programme
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-20 pt-10 sm:px-6 sm:pt-14">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet-300/80">Salvya creators</p>
        <h1 className="mt-2 text-balance text-[2rem] font-bold leading-tight tracking-[-0.04em] sm:text-[2.35rem]">
          {isGuest ? "Become a Salvya Creator" : "Apply to the creator programme"}
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/50">
          {isGuest
            ? "Partner with Salvya to promote official drops and earn a fixed DH amount for every qualifying item sold through your links."
            : "You are signed in. Submit your application and we will review it shortly."}
        </p>

        <section className="mt-10 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 sm:p-6">
          <h2 className="text-[15px] font-semibold text-white/92">How you get paid</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-white/48">
            Your commission is a fixed amount in Moroccan dirhams (DH) per qualifying item sold — based on the
            Instagram follower count you provide when you apply. Each unit in an attributed order counts as one item.
          </p>
          <div className="mt-5">
            <CreatorCommissionRulesTable />
          </div>
          <p className="mt-4 text-[13px] leading-relaxed text-white/38">
            Full programme rules are in the{" "}
            <Link href="/terms/creator" className="font-semibold text-fuchsia-200/90 underline decoration-fuchsia-400/30 underline-offset-2 hover:text-fuchsia-100">
              Creator programme terms
            </Link>
            . Approved creators see their personal band and rate in Wallet.
          </p>
        </section>

        <ul className="mt-10 grid gap-3 sm:grid-cols-3">
          {BENEFITS.map((b) => (
            <li
              key={b.title}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-sm"
            >
              <p className="text-[13px] font-semibold text-white/90">{b.title}</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-white/45">{b.body}</p>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href={isGuest ? registerHref("/menu") : CREATOR_APPLY_PATH}
            className={`inline-flex min-h-11 items-center justify-center rounded-xl px-6 text-[14px] font-semibold text-white ${creatorCtaButton}`}
          >
            {isGuest ? "Become a creator" : creatorApplyCtaLabel(true)}
          </Link>
          {isGuest ? (
            <Link
              href={loginHref(CREATOR_APPLY_PATH)}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/12 px-5 text-[14px] font-semibold text-white/70 hover:bg-white/[0.04]"
            >
              Sign in to apply
            </Link>
          ) : null}
        </div>

        {isGuest ? (
          <p className="mt-6 text-[13px] leading-relaxed text-violet-200/55">{creatorApplyGuestHint()}</p>
        ) : null}
      </main>
    </div>
  );
}
