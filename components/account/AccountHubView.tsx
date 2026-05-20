"use client";

import Link from "next/link";
import { AccountIdentityStrip } from "@/components/account/AccountIdentityStrip";
import { CreatorUpgradeCard } from "@/components/account/CreatorUpgradeCard";
import { MemberOrdersSection } from "@/components/member/MemberOrdersSection";
import { useSalvyaSession } from "@/components/member/useSalvyaSession";
import { useSupabaseUser } from "@/components/member/useSupabaseUser";
import { loginHref } from "@/lib/auth/login-href";

export function AccountHubView() {
  const { user, loading } = useSupabaseUser();
  const { session } = useSalvyaSession();

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-[14px] text-white/45">
        Loading account…
      </div>
    );
  }

  return (
    <>
      <p className="mt-3 max-w-md text-[14px] leading-relaxed text-white/48">
        Hub for orders, alerts, and your Salvya profile. When you are signed in, your bag, likes, artist follows, and
        notifications sync to your account. Saved addresses live under Settings for checkout.
      </p>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
        <Link href="/account/profile" className="text-[14px] font-semibold text-[#8fa8e8] hover:text-[#b8c9ff]">
          Profile →
        </Link>
        <Link href="/account/settings" className="text-[14px] font-semibold text-[#8fa8e8] hover:text-[#b8c9ff]">
          Settings →
        </Link>
        <Link href="/help-center" prefetch={false} className="text-[14px] font-semibold text-white/45 hover:text-white/65">
          Help →
        </Link>
      </div>
      {!user ? (
        <p className="mt-2">
          <Link href={loginHref("/account/profile")} className="text-[14px] font-semibold text-[#8fa8e8] hover:text-[#b8c9ff]">
            Sign in to sync orders and profile →
          </Link>
        </p>
      ) : null}

      <AccountIdentityStrip />

      <CreatorUpgradeCard />

      <section className="mt-10 space-y-4" aria-label="Account sections">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
          <h2 className="m-0 text-[13px] font-semibold uppercase tracking-wide text-white/42">Orders</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-white/48">
            Orders placed while signed in sync here. Guest checkouts — use your SVY number and email on track order.
          </p>
          {user ? <MemberOrdersSection variant="account" limit={8} /> : null}
        </div>
        <div id="addresses" className="scroll-mt-28 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
          <h2 className="m-0 text-[13px] font-semibold uppercase tracking-wide text-white/42">Addresses</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-white/48">
            Save shipping destinations once — pick them at checkout when signed in.
          </p>
          <Link
            href={user ? "/account/settings" : loginHref("/account/settings")}
            className="mt-4 inline-flex text-[14px] font-semibold text-[#8fa8e8] hover:text-[#b8c9ff]"
          >
            Open address book →
          </Link>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
          <h2 className="m-0 text-[13px] font-semibold uppercase tracking-wide text-white/42">Alerts</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-white/48">Orders, drops, and account messages when signed in.</p>
          <Link href="/notifications" className="mt-4 inline-flex text-[14px] font-semibold text-[#8fa8e8] hover:text-[#b8c9ff]">
            Open notifications →
          </Link>
        </div>
      </section>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link
          href="/preview-bag"
          className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.06] px-5 text-[14px] font-semibold text-white/90 hover:bg-white/[0.1]"
        >
          Your bag
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-[46px] items-center justify-center rounded-xl bg-[#2D6BFF] px-5 text-[14px] font-semibold text-white shadow-[0_12px_36px_-14px_rgba(45,107,255,0.55)] active:scale-[0.99]"
        >
          Back to shop
        </Link>
      </div>
    </>
  );
}
