"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { SalvyaHeartIcon } from "@/components/ui/SalvyaIcons";
import { loginHref, registerHref } from "@/lib/auth/login-href";

const ease = [0.22, 1, 0.36, 1] as const;

/** Signed-out visitors cannot browse saved items — soft full-viewport gate (no hard redirect). */
export function GuestSavedItemsWall() {
  const pathname = usePathname() || "/likes";
  const reduceMotion = useReducedMotion();
  const login = loginHref(pathname);
  const signup = registerHref(pathname);

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#050508] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_55%_at_50%_-5%,rgba(45,107,255,0.14),transparent_55%)]" />
        <div className="absolute -right-[18%] top-[18%] h-[min(20rem,75vw)] w-[min(20rem,75vw)] rounded-full bg-rose-500/12 blur-[100px]" />
        <div className="grain-overlay absolute inset-0 opacity-[0.06]" />
      </div>

      <header className="relative z-10 shrink-0 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">Saved</p>
      </header>

      <main className="relative z-[1] mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 pb-[max(2rem,env(safe-area-inset-bottom))] text-center sm:px-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease }}
        >
          <div className="mx-auto mb-6 flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-full border border-rose-400/28 bg-rose-500/[0.14] text-rose-300 shadow-[0_0_48px_-14px_rgba(251,113,133,0.4)]">
            <SalvyaHeartIcon className="h-8 w-8" />
          </div>
          <h1 className="m-0 text-[clamp(1.45rem,5.5vw,1.85rem)] font-semibold leading-tight tracking-[-0.035em] text-white">
            Saved items
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-white/48">
            You need an account to view saved items.
          </p>
          <div className="mx-auto mt-8 flex w-full max-w-[20rem] flex-col gap-2.5">
            <Link
              href={signup}
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-white/[0.14] bg-white/[0.07] px-5 text-[14px] font-semibold text-white/95 transition-colors hover:bg-white/[0.11] active:scale-[0.99]"
            >
              Sign up
            </Link>
            <Link
              href={login}
              className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#2D6BFF] px-5 text-[14px] font-semibold text-white shadow-[0_14px_36px_-14px_rgba(45,107,255,0.55)] transition-[filter,transform] hover:brightness-110 active:scale-[0.99]"
            >
              Log in
            </Link>
            <Link
              href="/shop"
              prefetch={false}
              className="mt-2 inline-flex min-h-[44px] items-center justify-center rounded-full text-[14px] font-medium text-white/42 transition-colors hover:text-white/58"
            >
              Browse drops
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
