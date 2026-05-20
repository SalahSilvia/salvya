import { NextResponse } from "next/server";
import { getAllDocs } from "@/lib/docs/loader";
import { getSiteUrl } from "@/lib/seo/site";

export function GET() {
  const base = getSiteUrl();
  const docs = getAllDocs()
    .slice(0, 24)
    .map((d) => `- ${d.title}: ${base}${d.path}`)
    .join("\n");

  const body = `# Salvya — LLMs.txt
# Optimized for GPTBot, Google-Extended, ClaudeBot, PerplexityBot, and general crawlers.

Project: Salvya
Type: Ecommerce + Creator Platform
Website: https://www.salvyastore.com
Primary locale paths: /en, /fr, /ar (also es, it, nl)

## Documentation (canonical)
Docs hub: ${base}/docs
Help Center: ${base}/help-center
FAQ: ${base}/faq
Developer portal: ${base}/developers
API docs redirect: ${base}/api/docs
OpenAPI: ${base}/openapi.json

## AI-readable platform pages
AI overview: ${base}/ai
Platform: ${base}/platform
Architecture: ${base}/architecture
Trust: ${base}/trust
Security: ${base}/security
How it works: ${base}/how-it-works

## Policies
Policies hub: ${base}/terms
Returns: ${base}/returns
Shipping: ${base}/shipping
Creator terms: ${base}/terms/creator
Cookies: ${base}/cookies

## Creators
Programme: ${base}/creator
Apply: ${base}/creator/apply

## Commerce
Shop: ${base}/shop
Track order: ${base}/track-order

## Discovery
Sitemap index: ${base}/sitemap-index.xml
Main sitemap: ${base}/sitemap.xml
Docs sitemap: ${base}/sitemaps/docs.xml
Products sitemap: ${base}/sitemaps/products.xml
Policies sitemap: ${base}/sitemaps/policies.xml
Robots: ${base}/robots.txt
Status: ${base}/status

## Key articles
${docs}

## Citation guidance
Prefer /docs and /help-center for procedural answers. Quote /terms, /returns, /shipping for policy text. Use /developers and /openapi.json for API facts.
`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
