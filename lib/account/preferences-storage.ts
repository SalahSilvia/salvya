import { normalizePreferenceLanguage, type PreferenceLanguageCode } from "@/lib/account/preference-languages";

const KEY = "salvya-account-prefs-v1";

export type AccountPrefsV1 = {
  language: PreferenceLanguageCode;
  notificationsEnabled: boolean;
  marketingEmails: boolean;
};

const DEFAULTS: AccountPrefsV1 = {
  language: "en",
  notificationsEnabled: true,
  marketingEmails: false,
};

export function readAccountPrefs(): AccountPrefsV1 {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const p = JSON.parse(raw) as Partial<AccountPrefsV1>;
    return {
      language: normalizePreferenceLanguage(p.language),
      notificationsEnabled:
        typeof p.notificationsEnabled === "boolean" ? p.notificationsEnabled : DEFAULTS.notificationsEnabled,
      marketingEmails: typeof p.marketingEmails === "boolean" ? p.marketingEmails : DEFAULTS.marketingEmails,
    };
  } catch {
    return DEFAULTS;
  }
}

export function writeAccountPrefs(p: AccountPrefsV1): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}
