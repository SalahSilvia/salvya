export type SalvyaErrorVariant =
  | "runtime"
  | "notFound"
  | "forbidden"
  | "checkout"
  | "network"
  | "global";

export type SalvyaErrorPreset = {
  code: string;
  title: string;
  description: string;
  hint?: string;
};

export const STOREFRONT_ERROR_PRESETS: Record<SalvyaErrorVariant, SalvyaErrorPreset> = {
  runtime: {
    code: "Error",
    title: "Something went wrong",
    description:
      "Salvya hit an unexpected problem loading this page. Your bag and account are safe — try again or head back to the shop.",
    hint: "If this keeps happening, tell us what you were doing and we will look into it.",
  },
  notFound: {
    code: "404",
    title: "Page not found",
    description:
      "This link may be outdated, or the drop has moved. Browse the shop or search for your artist to find what you need.",
  },
  forbidden: {
    code: "403",
    title: "You don't have access",
    description:
      "This area is restricted. Sign in with the right account, or return to the shop if you landed here by mistake.",
  },
  checkout: {
    code: "Checkout",
    title: "Checkout interrupted",
    description:
      "We could not finish this step. Your payment was not taken unless PayPal confirmed it. You can retry payment or return to your bag.",
    hint: "Cancelled PayPal? That is normal — open PayPal again when you are ready.",
  },
  network: {
    code: "Offline",
    title: "Connection problem",
    description:
      "Salvya could not reach the server. Check your connection and try again.",
  },
  global: {
    code: "Error",
    title: "Salvya needs a refresh",
    description:
      "A critical error stopped the app. Reload the page. If the problem continues, report it from the help center.",
  },
};

export const ADMIN_ERROR_PRESET: SalvyaErrorPreset = {
  code: "Admin",
  title: "Admin panel error",
  description:
    "This admin screen failed to load. Your changes may not have saved — retry or open another section.",
  hint: "Check the terminal in development, or Supabase/service env on production.",
};
