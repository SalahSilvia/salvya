---
title: Failed payments after checkout
description: Why checkout payments fail and how to recover your bag and order.
summary: Diagnose declined cards, PayPal interruptions, and COD edge cases without losing your cart.
aiSummary: This article explains Salvya payment verification failures after checkout, including retry steps, session preservation, and when orders are not created.
keyPoints:
  - Failed authorization does not always create an order
  - Retry checkout from bag or confirmation email when offered
  - Payment methods vary by region — see payment policy
  - Contact support with timestamp and method used
tags:
  - payments
  - checkout
  - orders
related:
  - tracking
  - refunds
relatedPaths:
  - /payment
  - /docs/orders/tracking
publishedAt: 2025-06-01
updatedAt: 2026-03-10
---

## Common causes

- Card issuer decline or 3DS timeout
- PayPal session expired
- Address validation mismatch
- Inventory change between bag and payment

## What to do

1. Open your [bag](/preview-bag) — lines may still be present.
2. Retry checkout with another method where available.
3. If charged without confirmation email, contact [support](/contact) immediately.

```http
GET /api/orders
Cookie: sb-access-token=...
```

Authenticated users can list recent orders via the Orders API.
