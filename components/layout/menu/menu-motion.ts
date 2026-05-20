/** Airbnb-like: soft spring, slightly slower ease */
export const airSpring = { type: "spring" as const, stiffness: 280, damping: 32, mass: 0.9 };
export const airSpringSnappy = { type: "spring" as const, stiffness: 340, damping: 34, mass: 0.85 };
export const airEase = [0.2, 0.8, 0.2, 1] as const;
export const airEaseOut = [0.16, 1, 0.3, 1] as const;
export const rowStagger = 0.04;
export const chipStagger = 0.035;
