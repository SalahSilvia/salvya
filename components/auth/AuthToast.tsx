"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export type AuthToastTone = "success" | "error";

export type AuthToastState = {
  message: string;
  tone: AuthToastTone;
} | null;

type Props = {
  toast: AuthToastState;
  onDismiss: () => void;
};

const toneClass: Record<AuthToastTone, string> = {
  success: "border-emerald-200/90 bg-emerald-50/98 text-emerald-950 shadow-emerald-500/10",
  error: "border-rose-200/90 bg-rose-50/98 text-rose-950 shadow-rose-500/10",
};

export function AuthToast({ toast, onDismiss }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-[max(1rem,env(safe-area-inset-top))] z-[80] flex justify-center px-4"
      aria-live="polite"
    >
      <AnimatePresence initial={false}>
        {toast ? (
          <motion.div
            key={toast.message}
            role="status"
            initial={reduceMotion ? false : { opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border px-4 py-3.5 shadow-lg ${toneClass[toast.tone]}`}
          >
            <p className="min-w-0 flex-1 text-[13px] font-medium leading-relaxed">{toast.message}</p>
            <button
              type="button"
              onClick={onDismiss}
              className="shrink-0 rounded-lg px-2 py-1 text-[11px] font-bold uppercase tracking-wide opacity-70 transition-opacity hover:opacity-100"
            >
              Dismiss
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
