"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MoreIcon } from "@/components/creator/more/CreatorMoreIcons";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function CreatorMoreSignOut() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const signOut = useCallback(async () => {
    const sb = getSupabaseBrowserClient();
    await sb?.auth.signOut();
    router.push("/shop");
    router.refresh();
  }, [router]);

  return (
    <motion.div
      className="pt-2"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.25, duration: 0.35 }}
    >
      <button
        type="button"
        onClick={() => void signOut()}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-500/35 bg-red-600/15 text-[14px] font-semibold text-red-300 transition hover:bg-red-600/22 active:scale-[0.99]"
      >
        <MoreIcon id="logout" className="h-5 w-5" />
        Log out
      </button>
    </motion.div>
  );
}
