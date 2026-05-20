export const PREFERENCE_LANGUAGE_CODES = ["en", "fr", "es", "it", "ar", "nl"] as const;

export type PreferenceLanguageCode = (typeof PREFERENCE_LANGUAGE_CODES)[number];

export type PreferenceLanguageOption = {
  code: PreferenceLanguageCode;
  label: string;
  nativeLabel: string;
  rtl?: boolean;
};

export const PREFERENCE_LANGUAGES: readonly PreferenceLanguageOption[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "fr", label: "French", nativeLabel: "Français" },
  { code: "es", label: "Spanish", nativeLabel: "Español" },
  { code: "it", label: "Italian", nativeLabel: "Italiano" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", rtl: true },
  { code: "nl", label: "Dutch", nativeLabel: "Nederlands" },
];

const CODE_SET = new Set<string>(PREFERENCE_LANGUAGE_CODES);

export function isPreferenceLanguageCode(code: string): code is PreferenceLanguageCode {
  return CODE_SET.has(code);
}

export function normalizePreferenceLanguage(code: string | undefined | null): PreferenceLanguageCode {
  const trimmed = typeof code === "string" ? code.trim().toLowerCase() : "";
  return isPreferenceLanguageCode(trimmed) ? trimmed : "en";
}

export function preferenceLanguageLabel(code: string): string {
  const normalized = normalizePreferenceLanguage(code);
  return PREFERENCE_LANGUAGES.find((l) => l.code === normalized)?.label ?? "English";
}
