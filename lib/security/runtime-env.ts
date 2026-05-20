/** True when running on Vercel (production or preview). */
export function isVercelRuntime(): boolean {
  return process.env.VERCEL === "1" || Boolean(process.env.VERCEL_ENV?.trim());
}

/** Local dev only — never allow unauthenticated cron/email triggers on Vercel or production Node. */
export function allowInsecureDevBypass(): boolean {
  if (isVercelRuntime()) return false;
  if (process.env.NODE_ENV === "production") return false;
  return process.env.NODE_ENV === "development";
}
