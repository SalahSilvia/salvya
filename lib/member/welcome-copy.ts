import type { User } from "@supabase/supabase-js";

/** First name (or email local-part) for welcome copy. */
export function firstNameFromUser(user: User): string {
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const full =
    typeof meta?.full_name === "string"
      ? meta.full_name
      : typeof meta?.name === "string"
        ? meta.name
        : typeof meta?.given_name === "string"
          ? meta.given_name
          : "";
  const trimmed = full.trim();
  if (trimmed) {
    const first = trimmed.split(/\s+/)[0];
    if (first) return first;
  }
  if (user.email) {
    const local = user.email.split("@")[0];
    if (local) return local;
  }
  return "there";
}

function greetingForHour(h: number): string {
  if (h < 5) return "Welcome back";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 22) return "Good evening";
  return "Welcome back";
}

/** Time-of-day line for marketing / guest shells (no user object). */
export function timeOfDayGreetingWord(): string {
  return greetingForHour(new Date().getHours());
}

export function welcomeHeadline(user: User): { line: string; name: string } {
  return { line: timeOfDayGreetingWord(), name: firstNameFromUser(user) };
}

/** Homepage hero — guests use “there” as the first name. */
export function homeHeroGreeting(user: User | null): { line: string; name: string } {
  if (!user) {
    return { line: timeOfDayGreetingWord(), name: "there" };
  }
  return welcomeHeadline(user);
}
