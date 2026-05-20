"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type NextStep = "shop" | "signin";

type Props = {
  open: boolean;
  next: NextStep | null;
  onContinue: () => void;
};

export function SignupSuccessDialog({ open, next, onContinue }: Props) {
  const reduceMotion = useReducedMotion();
  const backdropFade = reduceMotion ? 0 : 0.2;
  const panelEase = reduceMotion ? 0 : 0.38;

  const title = "You signed up successfully";
  const body =
    next === "shop"
      ? "Your Salvya account is ready and you are signed in. You can start exploring the shop. We may still email you to confirm your address."
      : "Your Salvya account is ready. On the next screen, sign in with the same email and password. If we sent a confirmation email, open it when you can.";

  return (
    <AnimatePresence>
      {open && next ? (
        <motion.div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
          initial={{ opacity: reduceMotion ? 1 : 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: reduceMotion ? 1 : 0 }}
          transition={{ duration: backdropFade }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="signup-success-title"
            className="w-full max-w-[400px] rounded-3xl border border-neutral-200/90 bg-white p-8 shadow-[0_32px_64px_-24px_rgba(15,23,42,0.35)] ring-1 ring-neutral-900/5 sm:p-9"
            initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 18, scale: reduceMotion ? 1 : 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 12, scale: reduceMotion ? 1 : 0.98 }}
            transition={{ duration: panelEase, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200/80" aria-hidden>
              <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 id="signup-success-title" className="mt-5 text-center text-[1.35rem] font-bold tracking-[-0.03em] text-neutral-950 sm:text-[1.5rem]">
              {title}
            </h2>
            <p className="mt-3 text-center text-[14px] leading-relaxed text-neutral-600 sm:text-[15px]">{body}</p>
            <button
              type="button"
              onClick={onContinue}
              className="mt-8 flex min-h-[50px] w-full items-center justify-center rounded-xl bg-blue-600 text-[15px] font-semibold text-white shadow-[0_14px_36px_-12px_rgba(37,99,235,0.45)] transition-[background-color,transform] hover:bg-blue-700 active:scale-[0.99]"
            >
              {next === "shop" ? "Continue to shop" : "Continue to sign in"}
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
