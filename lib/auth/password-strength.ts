export type PasswordChecks = {
  len8: boolean;
  lower: boolean;
  upper: boolean;
  digit: boolean;
  symbol: boolean;
};

export function analyzePassword(password: string): { checks: PasswordChecks; passed: number } {
  const checks: PasswordChecks = {
    len8: password.length >= 8,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    digit: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
  const passed = Object.values(checks).filter(Boolean).length;
  return { checks, passed };
}

export function strengthLabel(passed: number, length: number): "Enter a password" | "Weak" | "Fair" | "Good" | "Strong" {
  if (length === 0) return "Enter a password";
  if (passed <= 2) return "Weak";
  if (passed === 3) return "Fair";
  if (passed === 4) return "Good";
  return "Strong";
}

export function strengthBarClass(passed: number, length: number): string {
  if (length === 0) return "bg-neutral-200";
  if (passed <= 2) return "bg-rose-500";
  if (passed === 3) return "bg-amber-400";
  if (passed === 4) return "bg-blue-500";
  return "bg-emerald-500";
}
