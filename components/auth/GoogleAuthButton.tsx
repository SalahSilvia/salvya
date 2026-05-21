"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

type Props = {
  label: string;
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
};

function GoogleSpinner() {
  return (
    <span
      className="inline-block size-[18px] animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-700"
      aria-hidden
    />
  );
}

export function GoogleAuthButton({ label, disabled, loading, onClick }: Props) {
  const reduceMotion = useReducedMotion();
  const isDisabled = disabled || loading;

  return (
    <motion.button
      type="button"
      disabled={isDisabled}
      onClick={onClick}
      whileTap={reduceMotion || isDisabled ? undefined : { scale: 0.985 }}
      className="relative flex min-h-[50px] w-full items-center justify-center gap-3 overflow-hidden rounded-xl border border-neutral-200/90 bg-white px-4 text-[15px] font-semibold text-neutral-800 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_8px_24px_-12px_rgba(15,23,42,0.12)] transition-[border-color,box-shadow,background-color,opacity] hover:border-neutral-300 hover:bg-neutral-50/90 hover:shadow-[0_12px_32px_-14px_rgba(15,23,42,0.14)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20 disabled:pointer-events-none disabled:opacity-[0.55]"
      aria-busy={loading}
    >
      {loading ? (
        <GoogleSpinner />
      ) : (
        <Image
          src="/api/brand/google-g-logo"
          alt=""
          width={20}
          height={20}
          className="size-5 shrink-0"
          unoptimized
        />
      )}
      <span>{loading ? "Redirecting…" : label}</span>
    </motion.button>
  );
}
