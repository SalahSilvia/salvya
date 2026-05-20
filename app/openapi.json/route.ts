import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/seo/site";

export function GET() {
  const base = getSiteUrl();
  const spec = {
    openapi: "3.1.0",
    info: {
      title: "Salvya Platform API",
      version: "1.0.0",
      description: "Public and authenticated endpoints for Salvya storefront, orders, and creator workspace.",
    },
    servers: [{ url: base }],
    tags: [
      { name: "Auth", description: "Session and profile" },
      { name: "Orders", description: "Checkout and order history" },
      { name: "Cart", description: "Bag sync" },
      { name: "Creators", description: "Creator workspace metrics" },
      { name: "Webhooks", description: "Internal payment lifecycle" },
    ],
    paths: {
      "/api/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Current session profile & roles",
          responses: { "200": { description: "Authenticated profile" } },
        },
      },
      "/api/orders": {
        get: {
          tags: ["Orders"],
          summary: "List authenticated customer orders",
          responses: { "200": { description: "Order list" } },
        },
        post: {
          tags: ["Orders"],
          summary: "Place checkout order with attribution",
          responses: { "201": { description: "Order created" } },
        },
      },
      "/api/cart": {
        get: {
          tags: ["Cart"],
          summary: "Read synced bag lines",
          responses: { "200": { description: "Cart payload" } },
        },
      },
      "/api/creator/stats": {
        get: {
          tags: ["Creators"],
          summary: "Creator dashboard metrics",
          responses: { "200": { description: "Stats payload" } },
        },
      },
      "/api/creator/wallet": {
        get: {
          tags: ["Creators"],
          summary: "Balances, payouts, commission profile",
          responses: { "200": { description: "Wallet payload" } },
        },
      },
      "/api/creator/product-links": {
        get: {
          tags: ["Creators"],
          summary: "Promo links and tracking codes",
          responses: { "200": { description: "Links list" } },
        },
      },
      "/api/creator/analytics": {
        get: {
          tags: ["Creators"],
          summary: "Link performance and conversion",
          responses: { "200": { description: "Analytics payload" } },
        },
      },
      "/api/internal/payment-lifecycle": {
        post: {
          tags: ["Webhooks"],
          summary: "Internal payment state transitions",
          responses: { "200": { description: "Acknowledged" } },
        },
      },
      "/api/report-problem": {
        post: {
          tags: ["Support"],
          summary: "Submit support / abuse reports",
          responses: { "202": { description: "Accepted" } },
        },
      },
    },
  };

  return NextResponse.json(spec, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
