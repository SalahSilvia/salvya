import type { Metadata } from "next";

/** Public storefront pages — default indexable. */
export const ROBOTS_PUBLIC: Metadata["robots"] = {
  index: true,
  follow: true,
  googleBot: { index: true, follow: true },
};

/** Checkout, bag, auth, account — keep out of search indexes. */
export const ROBOTS_PRIVATE: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
};

/** Utility pages that can pass link equity but should not rank. */
export const ROBOTS_NOINDEX_FOLLOW: Metadata["robots"] = {
  index: false,
  follow: true,
  googleBot: { index: false, follow: true },
};
