export const ease = [0.22, 1, 0.36, 1] as const;
export const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease },
} as const;
