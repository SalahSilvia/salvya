"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { normalizeTrackingCode, writeCreatorReferralCookie } from "@/lib/creator/referral-cookie";

/** Persists ?ref= tracking codes for checkout attribution (last-touch, 30 days). */
export function CreatorReferralCapture() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref") ?? searchParams.get("creator_ref");

  useEffect(() => {
    const code = normalizeTrackingCode(ref);
    if (code) writeCreatorReferralCookie(code);
  }, [ref]);

  return null;
}
