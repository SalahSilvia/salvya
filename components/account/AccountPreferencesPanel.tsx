"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  readAccountPrefs,
  writeAccountPrefs,
  type AccountPrefsV1,
} from "@/lib/account/preferences-storage";
import {
  PREFERENCE_LANGUAGES,
  preferenceLanguageLabel,
  type PreferenceLanguageCode,
} from "@/lib/account/preference-languages";

const selectClass =
  "mt-2 min-h-[48px] w-full appearance-none rounded-xl border border-white/[0.12] bg-white/[0.05] bg-[length:1rem] bg-[right_0.85rem_center] bg-no-repeat py-3 pl-4 pr-11 text-[15px] text-white outline-none transition-[border-color,box-shadow] focus:border-[#2D6BFF]/45 focus:ring-2 focus:ring-[#2D6BFF]/20";

function PrefToggle({
  id,
  title,
  description,
  checked,
  onChange,
  accent = "blue",
}: {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  accent?: "blue" | "violet";
}) {
  const trackOn = accent === "violet" ? "bg-violet-500" : "bg-[#2D6BFF]";
  const ring = accent === "violet" ? "focus-visible:ring-violet-500/40" : "focus-visible:ring-[#2D6BFF]/40";

  return (
    <div className="flex items-start gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 transition-[border-color,background-color] hover:border-white/[0.12] hover:bg-white/[0.05] sm:items-center">
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold tracking-tight text-white/90">{title}</p>
        <p className="mt-1 text-[13px] leading-relaxed text-white/42">{description}</p>
      </div>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-8 w-[3.1rem] shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050508] ${ring} ${
          checked ? trackOn : "bg-white/[0.12]"
        }`}
      >
        <span
          className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.35)] transition-transform duration-200 ease-out ${
            checked ? "translate-x-[1.28rem]" : "translate-x-0"
          }`}
          aria-hidden
        />
        <span className="sr-only">{checked ? "On" : "Off"}</span>
      </button>
    </div>
  );
}

type Props = {
  prefs: AccountPrefsV1;
  onChange: (next: AccountPrefsV1) => void;
};

export function AccountPreferencesPanel({ prefs, onChange }: Props) {
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flash = useCallback((msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(msg);
    toastTimerRef.current = setTimeout(() => setToast(null), 2800);
  }, []);

  const persist = useCallback(
    (next: AccountPrefsV1, message?: string) => {
      onChange(next);
      writeAccountPrefs(next);
      if (message) flash(message);
    },
    [onChange, flash],
  );

  return (
    <div className="space-y-6">
      <div
        className="flex items-start gap-3 rounded-2xl border border-[#2D6BFF]/20 bg-gradient-to-br from-[#2D6BFF]/12 via-white/[0.03] to-transparent px-4 py-3.5"
        role="status"
      >
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.06] text-[15px]">
          ◎
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-white/82">Saved on this device</p>
          <p className="mt-1 text-[12px] leading-relaxed text-white/42">
            Language and alerts sync across Salvya when you are signed in on this browser. Cloud-wide preference sync
            is coming soon.
          </p>
        </div>
      </div>

      {toast ? (
        <div
          className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-2.5 text-[13px] font-medium text-emerald-100/90"
          role="status"
          aria-live="polite"
        >
          {toast}
        </div>
      ) : null}

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 sm:p-5">
        <label htmlFor="pref-language" className="block">
          <span className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Language</span>
            <span className="text-[11px] text-white/32">Storefront &amp; emails</span>
          </span>
          <select
            id="pref-language"
            value={prefs.language}
            onChange={(e) => {
              const language = e.target.value as PreferenceLanguageCode;
              persist({ ...prefs, language }, `${preferenceLanguageLabel(language)} selected`);
            }}
            className={`${selectClass} [background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff99'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")]`}
            aria-label="Preferred language"
          >
            {PREFERENCE_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-[#12121a] text-white">
                {lang.label}
              </option>
            ))}
          </select>
        </label>
        <p className="mt-3 text-[12px] leading-relaxed text-white/38">
          Storefront and email copy when we support your language.{" "}
          {prefs.language === "ar" ? (
            <span className="text-white/50">Arabic uses a right-to-left layout where available.</span>
          ) : null}
        </p>
      </div>

      <div>
        <div className="mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Communications</p>
          <p className="mt-1 text-[12px] text-white/35">Control how Salvya reaches you on this device</p>
        </div>
        <div className="space-y-2.5">
          <PrefToggle
            id="pref-notifications"
            title="In-app alerts"
            description="Order updates, drops, and account messages while you are signed in."
            checked={prefs.notificationsEnabled}
            onChange={(notificationsEnabled) =>
              persist(
                { ...prefs, notificationsEnabled },
                notificationsEnabled ? "In-app alerts turned on" : "In-app alerts turned off",
              )
            }
          />
          <PrefToggle
            id="pref-marketing"
            title="Culture & drop emails"
            description="Stories, artist releases, and curated picks — no spam, unsubscribe anytime."
            checked={prefs.marketingEmails}
            accent="violet"
            onChange={(marketingEmails) =>
              persist(
                { ...prefs, marketingEmails },
                marketingEmails ? "Marketing email enabled" : "Marketing email disabled",
              )
            }
          />
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.02] px-4 py-3.5">
        <p className="text-[12px] leading-relaxed text-white/38">
          Push notifications on your phone and granular email categories will appear here as we roll out the full
          notification centre.
        </p>
      </div>
    </div>
  );
}

/** Self-contained panel that reads/writes local prefs (for use outside settings if needed). */
export function AccountPreferencesPanelStandalone() {
  const [prefs, setPrefs] = useState<AccountPrefsV1 | null>(null);

  useEffect(() => {
    setPrefs(readAccountPrefs());
  }, []);

  if (!prefs) {
    return (
      <div className="flex min-h-[8rem] items-center justify-center text-[13px] text-white/40">
        Loading preferences…
      </div>
    );
  }

  return <AccountPreferencesPanel prefs={prefs} onChange={setPrefs} />;
}
