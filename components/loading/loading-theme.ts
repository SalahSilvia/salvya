export type SalvyaLoadingVariant = "store" | "creator" | "admin" | "dark" | "light";

export const LOADING_LABEL: Record<"store" | "creator" | "admin", string> = {
  store: "Salvya Shop",
  creator: "Creator Workspace",
  admin: "Admin",
};

export function loadingVariantStyles(variant: SalvyaLoadingVariant) {
  switch (variant) {
    case "creator":
      return {
        ambient:
          "bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,rgba(168,85,247,0.22),transparent_55%),radial-gradient(ellipse_50%_45%_at_100%_100%,rgba(236,72,153,0.12),transparent_50%)]",
        shell: "bg-[#07040c] text-white",
        ring: "border-t-fuchsia-400 border-r-violet-500/30 border-b-violet-500/15 border-l-transparent",
        core: "bg-gradient-to-br from-violet-500/25 to-fuchsia-500/15 ring-1 ring-fuchsia-400/25",
        dot: "bg-fuchsia-300 shadow-[0_0_18px_rgba(217,70,239,0.65)]",
        label: "text-white/55",
        title: "text-white/92",
        dotIdle: "bg-fuchsia-300/35",
        dotActive: "bg-fuchsia-300",
        bar: "from-violet-500/40 via-fuchsia-400/50 to-violet-500/40",
      };
    case "admin":
      return {
        ambient: "bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(45,107,255,0.08),transparent_55%)]",
        shell: "bg-[#f4f6fb] text-slate-700",
        ring: "border-t-[#2D6BFF] border-r-[#2D6BFF]/25 border-b-[#2D6BFF]/10 border-l-transparent",
        core: "bg-white ring-1 ring-[#2D6BFF]/20 shadow-sm",
        dot: "bg-[#2D6BFF] shadow-[0_0_16px_rgba(45,107,255,0.45)]",
        label: "text-slate-500",
        title: "text-slate-900",
        dotIdle: "bg-[#2D6BFF]/25",
        dotActive: "bg-[#2D6BFF]",
        bar: "from-[#2D6BFF]/35 via-indigo-400/45 to-[#2D6BFF]/35",
      };
    case "light":
      return {
        ambient: "bg-[radial-gradient(ellipse_90%_70%_at_50%_0%,rgba(255,255,255,0.9),transparent_58%)]",
        shell: "bg-[#f6f3ef] text-neutral-700",
        ring: "border-t-stone-700/70 border-r-stone-400/25 border-b-stone-400/10 border-l-transparent",
        core: "bg-white ring-1 ring-stone-900/10 shadow-sm",
        dot: "bg-stone-800 shadow-[0_0_12px_rgba(28,27,26,0.25)]",
        label: "text-neutral-500",
        title: "text-neutral-900",
        dotIdle: "bg-stone-800/20",
        dotActive: "bg-stone-800",
        bar: "from-stone-400/30 via-stone-600/35 to-stone-400/30",
      };
    case "dark":
    case "store":
    default:
      return {
        ambient:
          "bg-[radial-gradient(ellipse_80%_55%_at_50%_0%,rgba(45,107,255,0.18),transparent_55%),radial-gradient(ellipse_60%_50%_at_100%_100%,rgba(255,200,170,0.06),transparent_50%)]",
        shell: "bg-[#050508] text-white",
        ring: "border-t-[#2D6BFF] border-r-[#2D6BFF]/30 border-b-[#2D6BFF]/12 border-l-transparent",
        core: "bg-white/[0.06] ring-1 ring-white/10",
        dot: "bg-[#2D6BFF] shadow-[0_0_18px_rgba(45,107,255,0.55)]",
        label: "text-white/50",
        title: "text-white/92",
        dotIdle: "bg-[#2D6BFF]/30",
        dotActive: "bg-[#2D6BFF]",
        bar: "from-[#2D6BFF]/35 via-indigo-400/45 to-[#2D6BFF]/35",
      };
  }
}
