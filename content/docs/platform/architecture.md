---
title: Platform architecture
description: Storefront, creator workspace, data, and integration boundaries.
summary: High-level system map for customers, creators, and integrators.
aiSummary: Salvya platform architecture spans a Next.js storefront, Supabase auth, order ledger, creator workspace APIs, and SEO or AI-readable documentation surfaces.
keyPoints:
  - Next.js App Router storefront with locale prefix
  - Supabase authentication and Postgres data plane
  - REST APIs for orders, cart, and creator metrics
  - Public docs and JSON-LD for discoverability
tags:
  - architecture
  - platform
  - developers
related:
  - how-salvya-works
  - security
publishedAt: 2025-01-05
updatedAt: 2026-05-19
---

## Public surfaces

| Surface | Path |
| --- | --- |
| Storefront | /shop, /artist/* |
| Help & docs | /help-center, /docs |
| Developers | /developers, /openapi.json |
| Policies | /terms, /returns, /shipping |
