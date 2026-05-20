import { CREATOR_NICHES, type CreatorApplicationInput, type CreatorNiche } from "@/lib/creator/types";

export type ValidationResult =
  | { ok: true; data: CreatorApplicationInput }
  | { ok: false; error: string };

function isNiche(value: string): value is CreatorNiche {
  return (CREATOR_NICHES as readonly string[]).includes(value);
}

export function validateCreatorApplicationInput(body: Record<string, unknown>): ValidationResult {
  const fullName = String(body.fullName ?? body.full_name ?? "").trim();
  const country = String(body.country ?? "").trim();
  const instagramUsername = String(body.instagramUsername ?? body.instagram_username ?? "")
    .trim()
    .replace(/^@/, "");
  const instagramLink = String(body.instagramLink ?? body.instagram_link ?? "").trim();
  const nicheRaw = String(body.niche ?? "").trim();
  const messageRaw = body.message;
  const message =
    messageRaw === null || messageRaw === undefined ? null : String(messageRaw).trim() || null;

  const followersRaw = body.followersCount ?? body.followers_count;
  const followersCount =
    typeof followersRaw === "number" ? followersRaw : Number.parseInt(String(followersRaw ?? ""), 10);

  if (fullName.length < 2) return { ok: false, error: "Enter your full name." };
  if (country.length < 2) return { ok: false, error: "Enter your country." };
  if (!instagramUsername) return { ok: false, error: "Enter your Instagram username." };
  if (!instagramLink || !instagramLink.includes("instagram")) {
    return { ok: false, error: "Enter a valid Instagram profile link." };
  }
  if (!Number.isFinite(followersCount) || followersCount < 0) {
    return { ok: false, error: "Enter a valid follower count." };
  }
  if (!isNiche(nicheRaw)) return { ok: false, error: "Choose a niche." };
  if (message && message.length > 2000) {
    return { ok: false, error: "Message is too long (max 2000 characters)." };
  }

  return {
    ok: true,
    data: {
      fullName,
      country,
      instagramUsername,
      instagramLink,
      followersCount,
      niche: nicheRaw,
      message,
    },
  };
}
