---
title: Creator payouts & DH commissions
description: Follower-tier DH per item, wallet balances, and withdrawal requests.
summary: How creators earn fixed DH amounts per sold item based on Instagram follower bands.
aiSummary: This article explains Salvya creator commission tiers in DH per item, wallet balances, payout requests, and how refunds affect earnings.
keyPoints:
  - Commission is DH per item sold, tiered by follower count
  - Wallet shows balance, tier, and withdrawal status
  - Attributed orders drive earnings — self-referral is blocked
  - Programme terms define holds and verification
tags:
  - creators
  - payouts
  - wallet
related:
  - onboarding
relatedPaths:
  - /creator/wallet
  - /terms/creator
  - /docs/creators/onboarding
entities:
  creators:
    - programme
  policies:
    - /terms/creator
publishedAt: 2025-02-01
updatedAt: 2026-05-15
priority: 0.75
---

## Commission model

Salvya uses **fixed DH per item** bands tied to verified Instagram follower tiers (approximately 7–25 DH). Your live tier appears in the [creator wallet](/creator/wallet).

## Payout flow

Apply → approval → attributed orders → wallet credit → withdrawal request → review → transfer.

## API

```http
GET /api/creator/wallet
```

Returns balance, commission profile, and payout history for authenticated creators.
