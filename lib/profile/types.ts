export type SalvyaProfileDetails = {
  displayName: string;
  username: string;
  bio: string;
  phone: string;
  country: string;
  avatarUrl: string | null;
  coverUrl: string | null;
};

export const EMPTY_PROFILE_DETAILS: SalvyaProfileDetails = {
  displayName: "",
  username: "",
  bio: "",
  phone: "",
  country: "",
  avatarUrl: null,
  coverUrl: null,
};

/** Max serialized profile json (~400KB) to avoid huge data URLs in Postgres. */
export const MAX_PROFILE_JSON_BYTES = 400_000;
