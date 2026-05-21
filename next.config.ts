import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { loadLocalEnvFilesSync } from "./lib/env/load-local-env.impl";

loadLocalEnvFilesSync();

function supabaseImageRemotePatterns(): { protocol: "https"; hostname: string; pathname: string }[] {
  let raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!raw) return [];
  let u = raw.replace(/\/+$/, "");
  const lower = u.toLowerCase();
  if (lower.endsWith("/rest/v1")) u = u.slice(0, -"/rest/v1".length);
  else if (lower.endsWith("/rest")) u = u.slice(0, -"/rest".length);
  u = u.replace(/\/+$/, "");
  try {
    const host = new URL(u).hostname;
    return [{ protocol: "https", hostname: host, pathname: "/storage/v1/object/public/**" }];
  } catch {
    return [];
  }
}

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const supabaseImagePatterns = supabaseImageRemotePatterns();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseImagePatterns.length ? supabaseImagePatterns : undefined,
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [64, 96, 128, 256, 384, 480],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  // Avoid broken webpack vendor-chunks for Supabase when .next is rebuilt mid-dev.
  serverExternalPackages: ["@supabase/supabase-js", "@supabase/ssr", "sharp"],
  experimental: {
    optimizePackageImports: ["framer-motion", "recharts", "date-fns"],
  },
  webpack(config) {
    config.ignoreWarnings = [
      ...(config.ignoreWarnings ?? []),
      {
        module: /@opentelemetry\/instrumentation/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
      {
        module: /@prisma\/instrumentation/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
    ];
    return config;
  },
  async redirects() {
    return [
      { source: "/influencer", destination: "/creator", permanent: true },
      { source: "/influencer/:path*", destination: "/creator/:path*", permanent: true },
      { source: "/creator/onboarding", destination: "/creator/apply", permanent: false },
      { source: "/creator/program", destination: "/creator", permanent: true },
      { source: "/admin/influencers", destination: "/admin/creator-applications", permanent: true },
      { source: "/admin/influencers/:path*", destination: "/admin/creator-applications", permanent: true },
      { source: "/terms/influencer", destination: "/terms/creator", permanent: true },
      {
        source: "/:locale(en|fr|es|it|nl|ar)/creator/onboarding",
        destination: "/:locale/creator/apply",
        permanent: false,
      },
      {
        source: "/:locale(en|fr|es|it|nl|ar)/creator/program",
        destination: "/:locale/creator",
        permanent: true,
      },
      {
        source: "/:locale(en|fr|es|it|nl|ar)/admin/influencers",
        destination: "/admin/creator-applications",
        permanent: true,
      },
      {
        source: "/:locale(en|fr|es|it|nl|ar)/admin/influencers/:path*",
        destination: "/admin/creator-applications",
        permanent: true,
      },
      {
        source: "/:locale(en|fr|es|it|nl|ar)/terms/influencer",
        destination: "/:locale/terms/creator",
        permanent: true,
      },
      {
        source: "/:locale(en|fr|es|it|nl|ar)/influencer",
        destination: "/:locale/creator",
        permanent: true,
      },
      {
        source: "/:locale(en|fr|es|it|nl|ar)/influencer/:path*",
        destination: "/:locale/creator/:path*",
        permanent: true,
      },
      { source: "/blog", destination: "/blogs", permanent: true },
      {
        source: "/:locale(en|fr|es|it|nl|ar)/blog",
        destination: "/:locale/blogs",
        permanent: true,
      },
      { source: "/policies", destination: "/terms", permanent: true },
      {
        source: "/:locale(en|fr|es|it|nl|ar)/policies",
        destination: "/:locale/terms",
        permanent: true,
      },
      { source: "/help", destination: "/help-center", permanent: true },
      {
        source: "/:locale(en|fr|es|it|nl|ar)/help",
        destination: "/:locale/help-center",
        permanent: true,
      },
      { source: "/signup/create", destination: "/register?next=%2Fmenu", permanent: false },
      { source: "/signup", destination: "/register", permanent: false },
      { source: "/account", destination: "/en/account/profile", permanent: false },
      {
        source: "/:locale(en|fr|es|it|nl|ar)/account",
        destination: "/:locale/account/profile",
        permanent: false,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
