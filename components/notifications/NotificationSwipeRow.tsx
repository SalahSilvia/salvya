"use client";

import { animate, motion, useMotionValue, useReducedMotion, useTransform, type PanInfo } from "framer-motion";
import type { ReactNode } from "react";

const DISMISS_OFFSET = 88;

type Props = {
  children: ReactNode;
  onDismiss: () => void;
};

export function NotificationSwipeRow({ children, onDismiss }: Props) {
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const deleteOpacity = useTransform(x, [0, 36, DISMISS_OFFSET], [0, 0.55, 1]);
  const deleteScale = useTransform(x, [0, DISMISS_OFFSET], [0.92, 1]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (reduceMotion) return;
    if (info.offset.x > DISMISS_OFFSET - 12) {
      void animate(x, 140, { duration: 0.18, ease: "easeOut" }).then(onDismiss);
    } else {
      void animate(x, 0, { type: "spring", stiffness: 420, damping: 32 });
    }
  };

  if (reduceMotion) {
    return <li className="list-none">{children}</li>;
  }

  return (
    <li className="relative list-none overflow-hidden rounded-2xl">
      <motion.div
        style={{ opacity: deleteOpacity, scale: deleteScale }}
        className="pointer-events-none absolute inset-y-0 left-0 flex w-24 items-center justify-center rounded-2xl bg-gradient-to-r from-red-500/95 to-red-600/90 text-[12px] font-semibold tracking-wide text-white"
        aria-hidden
      >
        Delete
      </motion.div>
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 120 }}
        dragElastic={0.12}
        style={{ x }}
        onDragEnd={onDragEnd}
        className="relative z-[1] touch-pan-y"
      >
        {children}
      </motion.div>
    </li>
  );
}
