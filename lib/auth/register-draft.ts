/** Non-sensitive register fields only — never store passwords. */
export const REGISTER_DRAFT_KEY = "salvya-register-draft-v1";

export type RegisterDraft = {
  v: 1;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  marketing: boolean;
};

export function readRegisterDraft(): RegisterDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(REGISTER_DRAFT_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as RegisterDraft;
    if (p?.v !== 1) return null;
    return p;
  } catch {
    return null;
  }
}

export function writeRegisterDraft(d: Omit<RegisterDraft, "v">): void {
  if (typeof window === "undefined") return;
  try {
    const payload: RegisterDraft = { v: 1, ...d };
    sessionStorage.setItem(REGISTER_DRAFT_KEY, JSON.stringify(payload));
  } catch {
    /* */
  }
}

export function clearRegisterDraft(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(REGISTER_DRAFT_KEY);
  } catch {
    /* */
  }
}
