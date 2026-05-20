export const CREATOR_NICHES = [
  "fashion",
  "tech",
  "beauty",
  "fitness",
  "lifestyle",
  "gaming",
  "other",
] as const;

export type CreatorNiche = (typeof CREATOR_NICHES)[number];

export type CreatorApplicationStatus = "pending" | "approved" | "rejected";

export type CreatorApplicationRow = {
  id: string;
  user_id: string;
  full_name: string;
  country: string;
  instagram_username: string;
  instagram_link: string;
  followers_count: number;
  niche: CreatorNiche;
  message: string | null;
  status: CreatorApplicationStatus;
  created_at: string;
};

export type CreatorProfileRow = {
  id: string;
  user_id: string;
  creator_code: string;
  status: string;
  created_at: string;
};

export type CreatorApplicationInput = {
  fullName: string;
  country: string;
  instagramUsername: string;
  instagramLink: string;
  followersCount: number;
  niche: CreatorNiche;
  message?: string | null;
};

export type AdminCreatorApplication = CreatorApplicationRow & {
  applicantEmail?: string | null;
  profileRole?: string | null;
};
