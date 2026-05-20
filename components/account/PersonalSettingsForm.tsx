"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EditProfileSheet } from "@/components/member/profile/EditProfileSheet";
import { useProfileExtension } from "@/components/member/profile/useProfileExtension";
import { phoneDigitsOk } from "@/lib/addresses/validate";
import { CHECKOUT_COUNTRY_OPTIONS } from "@/lib/checkout-country";
import { firstNameFromUser } from "@/lib/member/welcome-copy";
import type { User } from "@supabase/supabase-js";

function authAvatarUrl(user: User): string | null {
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const u = meta?.avatar_url;
  return typeof u === "string" && u.length > 0 ? u : null;
}

function authMetaString(user: User, key: string): string {
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const v = meta?.[key];
  return typeof v === "string" ? v.trim() : "";
}

const inputClass =
  "mt-2 w-full rounded-xl border border-white/[0.1] bg-white/[0.06] px-4 py-3 text-[15px] text-white outline-none ring-0 placeholder:text-white/30 focus:border-[#2D6BFF]/45";

type Props = {
  user: User;
};

export function PersonalSettingsForm({ user }: Props) {
  const { extension, reload, save, syncing } = useProfileExtension(user.id);
  const [editOpen, setEditOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const authPhoto = authAvatarUrl(user);
  const authDisplayName = firstNameFromUser(user);

  const resetForm = useCallback(() => {
    const ext = extension;
    setDisplayName(ext?.displayName?.trim() || authDisplayName);
    setUsername(ext?.username?.trim() ?? "");
    setBio(ext?.bio?.trim() ?? "");
    setPhone(ext?.phone?.trim() || authMetaString(user, "phone"));
    setCountry(ext?.country?.trim() || authMetaString(user, "country"));
    setError(null);
    setSaved(false);
  }, [extension, authDisplayName, user]);

  useEffect(() => {
    resetForm();
  }, [resetForm]);

  const avatarSrc = extension?.avatarUrl ?? authPhoto;
  const initial = (displayName.slice(0, 1) || user.email?.slice(0, 1) || "?").toUpperCase();

  const countryOptions = useMemo(() => CHECKOUT_COUNTRY_OPTIONS, []);

  const onSave = useCallback(async () => {
    setError(null);
    setSaved(false);
    const nameTrim = displayName.trim();
    if (!nameTrim) {
      setError("Enter your name.");
      return;
    }
    const phoneTrim = phone.trim();
    if (phoneTrim && !phoneDigitsOk(phoneTrim)) {
      setError("Enter a valid phone number (at least 8 digits).");
      return;
    }
    if (!country) {
      setError("Choose your country or region for shipping.");
      return;
    }

    setBusy(true);
    try {
      await save({
        displayName: nameTrim,
        username: username.trim().replace(/^@/, ""),
        bio: bio.trim().slice(0, 280),
        phone: phoneTrim,
        country,
      });
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save your details.");
    } finally {
      setBusy(false);
    }
  }, [displayName, username, bio, phone, country, save]);

  return (
    <>
      <div className="flex flex-wrap items-center gap-5">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-white/[0.12] bg-white/[0.06] shadow-[0_12px_40px_-18px_rgba(0,0,0,0.65)]">
          {avatarSrc ? (
            // eslint-disable-next-line @next/next/no-img-element -- user avatar
            <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-2xl font-semibold text-white/55">{initial}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] text-white/45" title={user.email ?? undefined}>
            {user.email}
          </p>
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="mt-3 inline-flex min-h-[42px] items-center justify-center rounded-xl border border-white/[0.14] bg-white/[0.06] px-4 text-[13px] font-semibold text-white/88 transition-colors hover:bg-white/[0.1]"
          >
            Edit photo &amp; cover
          </button>
          <p className="mt-3 text-[12px] leading-relaxed text-white/38">
            Public username &amp; bio also appear on your{" "}
            <Link href="/account/profile" className="font-semibold text-[#8fa8e8] hover:text-[#b8c9ff]">
              profile page
            </Link>
            .
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {error ? (
          <p className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-[13px] text-rose-100/95">{error}</p>
        ) : null}
        {saved ? (
          <p className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-[13px] text-emerald-100/95">
            Personal details saved.
          </p>
        ) : null}

        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Full name</span>
          <input
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              setSaved(false);
            }}
            className={inputClass}
            placeholder="Your name"
            autoComplete="name"
          />
        </label>

        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Username</span>
          <div className="mt-2 flex items-center rounded-xl border border-white/[0.1] bg-white/[0.06] px-3 focus-within:border-[#2D6BFF]/45">
            <span className="text-[15px] text-white/35">@</span>
            <input
              value={username}
              onChange={(e) => {
                setUsername(e.target.value.replace(/\s/g, ""));
                setSaved(false);
              }}
              className="min-w-0 flex-1 border-0 bg-transparent py-3 pl-1 text-[15px] text-white outline-none"
              placeholder="handle"
              autoComplete="username"
            />
          </div>
        </label>

        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Mobile phone</span>
          <input
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setSaved(false);
            }}
            className={inputClass}
            placeholder="+212 6…"
            autoComplete="tel"
            inputMode="tel"
          />
        </label>

        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Country / region</span>
          <select
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
              setSaved(false);
            }}
            className={`${inputClass} cursor-pointer`}
          >
            <option value="">Select country</option>
            {countryOptions.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Bio</span>
          <textarea
            value={bio}
            onChange={(e) => {
              setBio(e.target.value);
              setSaved(false);
            }}
            rows={3}
            maxLength={280}
            className={`${inputClass} resize-none text-[14px] leading-relaxed`}
            placeholder="A line about your style or favorite artists."
          />
        </label>

        <button
          type="button"
          disabled={busy || syncing}
          onClick={() => void onSave()}
          className="inline-flex min-h-[46px] w-full items-center justify-center rounded-xl bg-[#2D6BFF] px-4 text-[14px] font-semibold text-white shadow-[0_12px_36px_-14px_rgba(45,107,255,0.55)] transition-[opacity,transform] hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save personal details"}
        </button>
      </div>

      <EditProfileSheet
        open={editOpen}
        onClose={() => setEditOpen(false)}
        userId={user.id}
        email={user.email ?? ""}
        authDisplayName={authDisplayName}
        authAvatarUrl={authPhoto}
        authCreatedAt={user.created_at ?? null}
        onSaved={() => {
          reload();
          resetForm();
        }}
      />
    </>
  );
}
