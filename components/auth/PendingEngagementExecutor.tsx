"use client";

import { useEffect, useRef } from "react";
import { useSupabaseUser } from "@/components/member/useSupabaseUser";
import { useArtistFollows } from "@/components/artist/ArtistFollowsProvider";
import { useLikes } from "@/components/likes/LikesProvider";
import { clearPendingEngagement, readPendingEngagement } from "@/lib/auth/pending-engagement";
import { requireAuth } from "@/lib/auth/require-auth";

/**
 * After login/signup, completes a stored “intent” (like / follow) once per session transition.
 */
export function PendingEngagementExecutor() {
  const { user, loading } = useSupabaseUser();
  const { likeItem } = useLikes();
  const { followArtist } = useArtistFollows();
  const ranForUserRef = useRef<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!requireAuth(user)) {
      ranForUserRef.current = null;
      return;
    }
    if (ranForUserRef.current === user.id) return;
    const pending = readPendingEngagement();
    if (!pending) {
      ranForUserRef.current = user.id;
      return;
    }
    clearPendingEngagement();
    ranForUserRef.current = user.id;

    if (pending.kind === "like") {
      likeItem(pending.input);
      return;
    }
    if (pending.kind === "follow") {
      followArtist(pending.slug, pending.meta);
    }
  }, [user, loading, likeItem, followArtist]);

  return null;
}
