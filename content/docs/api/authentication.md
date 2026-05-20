---
title: API authentication
description: Session cookies and authenticated customer and creator API calls on Salvya.
summary: How to authenticate storefront, customer, and creator API calls.
aiSummary: This article explains Salvya API authentication using Supabase session cookies, the auth probe endpoint, and creator session requirements.
keyPoints:
  - Browser clients use HttpOnly session cookies after sign-in
  - GET /api/auth/me returns the signed-in profile
  - Creator routes require an approved creator session
  - Never expose session tokens in client-side logs or public repos
tags:
  - api
  - auth
  - developers
related:
  - webhooks
relatedPaths:
  - /developers
  - /openapi.json
publishedAt: 2025-03-01
updatedAt: 2026-05-10
priority: 0.7
---

## Session probe

```http
GET /api/auth/me
```

Returns the current user, roles, and session metadata.

## Creator session

Creator endpoints (`/api/creator/*`) require:

- Valid session
- Approved creator programme status

## Integration webhooks

Partner webhook access is limited to approved integrations. Contact the developer portal for partnership enquiries.
