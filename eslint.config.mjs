import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // React 19 compiler rules flag common Next.js patterns (query params, hydration).
      // Treat as warnings during stabilization; fix incrementally without blocking CI.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/purity": "warn",
    },
  },
  {
    files: ["domains/creator/**/*.{ts,tsx}", "app/**/(creator)/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/domains/store", "@/domains/store/**"],
              message: "Creator domain must not import storefront MFE.",
            },
            {
              group: [
                "@/components/layout/StoreLayout",
                "@/components/navigation/DesktopMainNav",
                "@/components/navigation/MobileMainNav",
              ],
              message: "Creator routes must not import storefront navigation.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["domains/store/**/*.{ts,tsx}", "app/**/(store)/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/domains/creator", "@/domains/creator/**", "@/domains/admin", "@/domains/admin/**"],
              message: "Store domain must not import creator/admin MFE.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
