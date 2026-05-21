"use client";

import { motion, useReducedMotion } from "framer-motion";

function SubmitSpinner() {
  return (
    <span className="flex items-center justify-center gap-1" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-white"
          animate={{ y: [0, -5, 0], opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.12, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}

type Props = {
  label: string;
  loadingLabel: string;
  busy: boolean;
  disabled?: boolean;
};

export function AuthSubmitButton({ label, loadingLabel, busy, disabled }: Props) {
  const reduceMotion = useReducedMotion();
  const isDisabled = busy || disabled;

  return (
    <motion.button
      type="submit"
      disabled={isDisabled}
      whileTap={reduceMotion || isDisabled ? undefined : { scale: 0.985 }}
      className="relative mt-1 flex min-h-[50px] w-full items-center justify-center overflow-hidden rounded-xl bg-blue-600 text-[15px] font-semibold text-white shadow-[0_14px_36px_-12px_rgba(37,99,235,0.55)] transition-[box-shadow,background-color,opacity] hover:bg-blue-700 hover:shadow-[0_18px_40px_-10px_rgba(37,99,235,0.45)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30 disabled:pointer-events-none disabled:opacity-[0.65]"
    >
      <span className="relative flex items-center gap-2.5">
        {busy && !reduceMotion ? <SubmitSpinner /> : null}
        {busy ? loadingLabel : label}
      </span>
    </motion.button>
  );
}
