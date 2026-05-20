"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useId, useState } from "react";
import { AccountBackButton } from "@/components/account/AccountBackButton";
import { useSupabaseUser } from "@/components/member/useSupabaseUser";
import {
  DEACTIVATE_CONFIRM_PHRASE,
  DELETE_CONFIRM_PHRASE,
} from "@/lib/account/account-status";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { USER_PROFILE_STORAGE_PREFIX } from "@/lib/member/user-profile-storage";
import { SalvyaAccountSkeleton } from "@/components/skeleton/SalvyaAccountSkeleton";

type Mode = "deactivate" | "delete" | null;

const DATA_REMOVED = [
  "Profile, username, bio, and photos",
  "Saved shipping addresses",
  "Bag, likes, and artist follows",
  "In-app notifications and preferences on this account",
  "Product reviews linked to your account",
];

const DATA_KEPT = [
  "Order records may be kept in anonymised form for legal, tax, and fraud prevention (without a restorable personal backup for you).",
];

async function clearLocalAccountData(userId: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(`${USER_PROFILE_STORAGE_PREFIX}${userId}`);
    localStorage.removeItem("salvya-account-prefs-v1");
    localStorage.removeItem("salvya-likes-v1");
    localStorage.removeItem("salvya-follows-v1");
    localStorage.removeItem("salvya-notifications-v1");
    localStorage.removeItem("salvya-cart-v1");
  } catch {
    /* ignore */
  }
}

export function AccountDangerZoneClient() {
  const router = useRouter();
  const { user } = useSupabaseUser();
  const ackId = useId();
  const phraseId = useId();

  const [mode, setMode] = useState<Mode>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [confirmPhrase, setConfirmPhrase] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<"deactivate" | "delete" | null>(null);

  const resetForm = useCallback(() => {
    setAcknowledged(false);
    setConfirmPhrase("");
    setError(null);
  }, []);

  const openMode = useCallback(
    (next: Mode) => {
      setMode(next);
      resetForm();
    },
    [resetForm],
  );

  const expectedPhrase = mode === "delete" ? DELETE_CONFIRM_PHRASE : mode === "deactivate" ? DEACTIVATE_CONFIRM_PHRASE : "";

  const submit = useCallback(async () => {
    if (!mode || !user) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/me/account", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: mode,
          confirmPhrase: confirmPhrase.trim(),
          acknowledged: true,
        }),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) {
        throw new Error(body.error ?? "Request failed");
      }

      await clearLocalAccountData(user.id);
      const sb = getSupabaseBrowserClient();
      await sb?.auth.signOut();

      setDone(mode);
      setMode(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }, [mode, user, confirmPhrase, router]);

  if (!user) {
    return <SalvyaAccountSkeleton />;
  }

  if (done) {
    return (
      <div className="relative min-h-dvh overflow-x-hidden bg-[#050508] text-white">
        <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#050508]/78 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
          <div className="mx-auto flex h-14 max-w-xl items-center px-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
            <span className="text-[13px] font-medium text-white/55">Account closed</span>
          </div>
        </header>
        <main className="mx-auto max-w-xl px-[max(1rem,env(safe-area-inset-left))] py-12 pr-[max(1rem,env(safe-area-inset-right))]">
          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-6">
            <h1 className="text-xl font-semibold text-emerald-100/95">
              {done === "delete" ? "Account deleted" : "Account deactivated"}
            </h1>
            <p className="mt-3 text-[14px] leading-relaxed text-emerald-100/75">
              {done === "delete"
                ? "Your Salvya account and linked personal data have been removed from our systems. We do not keep a restorable backup of your account for you."
                : "Your account is deactivated and you have been signed out. You cannot sign in until support reactivates your account."}
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex min-h-[46px] items-center justify-center rounded-xl bg-white px-5 text-[14px] font-semibold text-slate-950"
            >
              Return to shop
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-[#050508] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -right-[10%] top-[12%] h-[min(18rem,70vw)] w-[min(18rem,70vw)] rounded-full bg-rose-600/12 blur-[88px]" />
      </div>

      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#050508]/78 pt-[env(safe-area-inset-top)] backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-14 max-w-xl items-center justify-between gap-3 px-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
          <AccountBackButton fallbackHref="/account/settings" />
          <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-rose-100/80">
            Danger zone
          </span>
        </div>
      </header>

      <main className="relative z-[1] mx-auto max-w-xl space-y-6 px-[max(1rem,env(safe-area-inset-left))] pb-28 pr-[max(1rem,env(safe-area-inset-right))] pt-8 sm:pt-10">
        <div>
          <h1 className="text-[1.65rem] font-semibold leading-tight tracking-[-0.04em] sm:text-[1.85rem]">
            Delete or deactivate account
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-white/48">
            These actions respect your privacy: we do not offer a personal backup or export after you proceed. Read
            carefully before continuing.
          </p>
        </div>

        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 sm:p-6">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">What happens to your data</h2>
          <ul className="mt-4 space-y-2.5 text-[14px] leading-relaxed text-white/55">
            {DATA_REMOVED.map((line) => (
              <li key={line} className="flex gap-2">
                <span className="text-rose-300/90" aria-hidden>
                  •
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <ul className="mt-4 space-y-2 border-t border-white/[0.06] pt-4 text-[13px] leading-relaxed text-white/40">
            {DATA_KEPT.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>

        {!mode ? (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => openMode("deactivate")}
              className="w-full rounded-2xl border border-amber-500/25 bg-amber-500/[0.08] p-5 text-left transition-colors hover:border-amber-400/40 hover:bg-amber-500/10"
            >
              <p className="text-[15px] font-semibold text-amber-100/95">Deactivate my account</p>
              <p className="mt-2 text-[13px] leading-relaxed text-amber-100/55">
                Temporarily disable sign-in. Your data stays on file until you contact support or delete the account
                later.
              </p>
            </button>
            <button
              type="button"
              onClick={() => openMode("delete")}
              className="w-full rounded-2xl border border-rose-500/30 bg-rose-500/[0.08] p-5 text-left transition-colors hover:border-rose-400/45 hover:bg-rose-500/10"
            >
              <p className="text-[15px] font-semibold text-rose-100/95">Delete my account permanently</p>
              <p className="mt-2 text-[13px] leading-relaxed text-rose-100/55">
                Permanently erase your Salvya account and linked personal data. This cannot be undone and we do not
                keep a restorable copy for you.
              </p>
            </button>
          </div>
        ) : (
          <section className="rounded-2xl border border-rose-500/25 bg-rose-500/[0.06] p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-white/92">
              {mode === "delete" ? "Confirm permanent deletion" : "Confirm deactivation"}
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-white/50">
              {mode === "delete"
                ? "You are about to permanently delete your account. Salvya will remove your personal data from our active systems. We do not provide a downloadable backup or recovery after this step."
                : "You are about to deactivate your account. You will be signed out everywhere and will not be able to sign in until your account is reactivated by support."}
            </p>

            {error ? (
              <p className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-[13px] text-rose-100/95">
                {error}
              </p>
            ) : null}

            <label className="mt-5 flex cursor-pointer items-start gap-3">
              <input
                id={ackId}
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-1 size-4 rounded border-white/30 bg-white/10 text-rose-500 focus:ring-rose-500/30"
              />
              <span className="text-[13px] leading-relaxed text-white/70">
                I understand that this action affects my privacy, that personal data will be removed or locked as
                described above, and that Salvya does not keep a restorable personal backup of my account for me.
              </span>
            </label>

            <label className="mt-5 block">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
                Type{" "}
                <span className="font-mono text-white/70">{expectedPhrase}</span> to confirm
              </span>
              <input
                id={phraseId}
                value={confirmPhrase}
                onChange={(e) => setConfirmPhrase(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/[0.12] bg-white/[0.05] px-4 py-3 font-mono text-[14px] text-white outline-none focus:border-rose-500/45 focus:ring-2 focus:ring-rose-500/20"
                autoComplete="off"
                spellCheck={false}
              />
            </label>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setMode(null);
                  resetForm();
                }}
                disabled={busy}
                className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.05] px-5 text-[14px] font-semibold text-white/85 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={
                  busy ||
                  !acknowledged ||
                  confirmPhrase.trim() !== expectedPhrase
                }
                onClick={() => void submit()}
                className="inline-flex min-h-[46px] items-center justify-center rounded-xl bg-rose-600 px-5 text-[14px] font-semibold text-white shadow-[0_12px_36px_-14px_rgba(225,29,72,0.55)] hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy
                  ? "Processing…"
                  : mode === "delete"
                    ? "Delete my account permanently"
                    : "Deactivate my account"}
              </button>
            </div>
          </section>
        )}

        <p className="text-center text-[12px] leading-relaxed text-white/35">
          Questions about privacy? See our{" "}
          <Link href="/terms" className="font-semibold text-[#8fa8e8] hover:text-[#b8c9ff]">
            policies
          </Link>{" "}
          or{" "}
          <Link href="/help-center" className="font-semibold text-[#8fa8e8] hover:text-[#b8c9ff]">
            Help Center
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
