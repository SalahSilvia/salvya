"use client";



import { useCallback, useEffect, useState } from "react";

import {

  PROFILE_EXTENSION_CHANGED,

  readProfileExtension,

  writeProfileExtension,

  type SalvyaUserProfileExtension,

} from "@/lib/member/user-profile-storage";

import type { SalvyaProfileDetails } from "@/lib/profile/types";



function detailsToExtension(userId: string, d: SalvyaProfileDetails): SalvyaUserProfileExtension {
  return {
    userId,
    displayName: d.displayName,
    username: d.username,
    bio: d.bio,
    phone: d.phone,
    country: d.country,
    avatarUrl: d.avatarUrl,
    coverUrl: d.coverUrl,
  };
}



export function useProfileExtension(userId: string | undefined) {

  const [extension, setExtension] = useState<SalvyaUserProfileExtension | null>(() =>

    userId ? readProfileExtension(userId) : null,

  );

  const [syncing, setSyncing] = useState(false);



  const reload = useCallback(() => {

    if (!userId) {

      setExtension(null);

      return;

    }

    setExtension(readProfileExtension(userId));

  }, [userId]);



  const syncFromServer = useCallback(async () => {

    if (!userId) return;

    setSyncing(true);

    try {

      const res = await fetch("/api/me/profile", { credentials: "include", cache: "no-store" });

      const body = (await res.json()) as { ok?: boolean; profile?: SalvyaProfileDetails };

      if (res.ok && body.ok && body.profile) {

        const ext = detailsToExtension(userId, body.profile);

        writeProfileExtension(userId, ext);

        setExtension(ext);

      }

    } catch {

      /* offline — keep local */

    } finally {

      setSyncing(false);

    }

  }, [userId]);



  useEffect(() => {

    reload();

    if (userId) void syncFromServer();

    const on = () => reload();

    window.addEventListener(PROFILE_EXTENSION_CHANGED, on);

    window.addEventListener("storage", on);

    return () => {

      window.removeEventListener(PROFILE_EXTENSION_CHANGED, on);

      window.removeEventListener("storage", on);

    };

  }, [reload, syncFromServer, userId]);



  const save = useCallback(

    async (patch: Partial<SalvyaUserProfileExtension>) => {

      if (!userId) return;

      const cur = readProfileExtension(userId);

      const next: SalvyaUserProfileExtension = {

        ...cur,

        ...patch,

        userId,

      };

      writeProfileExtension(userId, next);

      setExtension(next);



      try {

        const res = await fetch("/api/me/profile", {

          method: "PATCH",

          credentials: "include",

          headers: { "Content-Type": "application/json" },

          body: JSON.stringify({
            displayName: next.displayName,
            username: next.username,
            bio: next.bio,
            phone: next.phone,
            country: next.country,
            avatarUrl: next.avatarUrl,
            coverUrl: next.coverUrl,
          }),

        });

        const body = (await res.json()) as { ok?: boolean; profile?: SalvyaProfileDetails };

        if (!res.ok || !body.ok) {
          throw new Error(
            (body as { error?: string }).error ?? "Could not save profile to your account.",
          );
        }

        if (body.profile) {
          const synced = detailsToExtension(userId, body.profile);
          writeProfileExtension(userId, synced);
          setExtension(synced);
        }
      } catch (e) {
        if (e instanceof Error) throw e;
        throw new Error("Could not save profile to your account.");
      }

    },

    [userId],

  );



  return { extension, save, reload, syncFromServer, syncing };

}

