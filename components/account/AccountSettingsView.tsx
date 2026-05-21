"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { AccountBackButton } from "@/components/account/AccountBackButton";
import { AddressBookPanel } from "@/components/account/AddressBookPanel";
import { AccountPreferencesPanel } from "@/components/account/AccountPreferencesPanel";
import { PersonalSettingsForm } from "@/components/account/PersonalSettingsForm";
import { useSupabaseUser } from "@/components/member/useSupabaseUser";
import { readAccountPrefs, writeAccountPrefs, type AccountPrefsV1 } from "@/lib/account/preferences-storage";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { SalvyaAccountSkeleton } from "@/components/skeleton/SalvyaAccountSkeleton";

function SectionCard({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 sm:p-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">{eyebrow}</p>
      <h2 className="mt-2 text-lg font-semibold tracking-tight text-white/92">{title}</h2>
      {description ? <p className="mt-2 text-[14px] leading-relaxed text-white/48">{description}</p> : null}
      <div className={description ? "mt-6" : "mt-5"}>{children}</div>
    </section>
  );
}

export function AccountSettingsView() {
  const t = useTranslations("account");
  const router = useRouter();
  const { user } = useSupabaseUser();
  const [prefs, setPrefs] = useState<AccountPrefsV1 | null>(null);

  useEffect(() => {
    setPrefs(readAccountPrefs());
  }, []);

  const persistPrefs = useCallback((next: AccountPrefsV1) => {
    setPrefs(next);
    writeAccountPrefs(next);
  }, []);

  const signOut = useCallback(async () => {
    const sb = getSupabaseBrowserClient();
    await sb?.auth.signOut();
    router.push("/");
    router.refresh();
  }, [router]);

  if (!user) {
    return <SalvyaAccountSkeleton />;
  }

  const prefsSafe =
    prefs ??
    ({
      language: "en",
      notificationsEnabled: true,
      marketingEmails: false,
    } satisfies AccountPrefsV1);

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-[#050508] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-[18%] top-[8%] h-[min(20rem,80vw)] w-[min(20rem,80vw)] rounded-full bg-[#2D6BFF]/12 blur-[88px]" />
        <div className="absolute -right-[14%] bottom-[18%] h-[min(16rem,65vw)] w-[min(16rem,65vw)] rounded-full bg-violet-600/10 blur-[76px]" />
      </div>

      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#050508]/78 pt-[env(safe-area-inset-top)] backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-14 max-w-xl items-center justify-between gap-3 px-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
          <AccountBackButton fallbackHref="/menu" />
          <span className="rounded-full border border-white/[0.1] bg-white/[0.05] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/50">
            {t("settings")}
          </span>
        </div>
      </header>

      <main className="relative z-[1] mx-auto max-w-xl space-y-8 px-[max(1rem,env(safe-area-inset-left))] pb-28 pr-[max(1rem,env(safe-area-inset-right))] pt-8 sm:pt-10">
        <div>
          <h1 className="text-[1.65rem] font-semibold leading-tight tracking-[-0.04em] sm:text-[1.85rem]">{t("settingsPageTitle")}</h1>
          <p className="mt-3 max-w-md text-[14px] leading-relaxed text-white/48">{t("settingsPageIntro")}</p>
        </div>

        <SectionCard eyebrow={t("sectionPersonal")} title={t("settingsYourDetails")} description={t("personalDetailsDesc")}>
          <PersonalSettingsForm user={user} />
        </SectionCard>

        <SectionCard eyebrow={t("sectionShipping")} title={t("settingsAddresses")} description={t("addressesDesc")}>
          <AddressBookPanel />
        </SectionCard>

        <SectionCard eyebrow={t("sectionExperience")} title={t("settingsPreferences")} description={t("preferencesDesc")}>
          <AccountPreferencesPanel prefs={prefsSafe} onChange={persistPrefs} />
        </SectionCard>

        <SectionCard eyebrow={t("sectionAccess")} title={t("securityTitle")} description={t("securityDesc")}>
          <div className="flex flex-col gap-3">
            <Link
              href="/update-password"
              className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-white/[0.14] bg-white/[0.06] px-4 text-[14px] font-semibold text-white/88 transition-colors hover:bg-white/[0.1]"
            >
              {t("changePassword")}
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="inline-flex min-h-[46px] items-center justify-center rounded-xl bg-white px-4 text-[14px] font-semibold text-slate-950 transition-opacity hover:opacity-95"
            >
              {t("signOutDevice")}
            </button>
            <p className="text-[12px] leading-relaxed text-white/38">{t("signOutEverywhereHint")}</p>
          </div>
        </SectionCard>

        <SectionCard eyebrow={t("sectionIrreversible")} title={t("settingsDangerZone")} description={t("dangerZoneSectionDesc")}>
          <p className="text-[14px] leading-relaxed text-white/48">{t("dangerZoneDesc")}</p>
          <Link
            href="/account/danger-zone"
            className="mt-4 inline-flex min-h-[46px] items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 text-[14px] font-semibold text-rose-100/95 transition-colors hover:border-rose-400/40 hover:bg-rose-500/15"
          >
            {t("deleteOrDeactivate")}
          </Link>
        </SectionCard>
      </main>
    </div>
  );
}
