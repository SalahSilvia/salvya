---
title: Order tracking
description: Look up SVY orders by reference and email, and understand shipment lifecycle states.
summary: Track parcels from checkout verification through delivery using your order number and email.
aiSummary: This article explains how Salvya order tracking works for guests and signed-in customers, including SVY references, carrier handoff, and delivery confirmation.
keyPoints:
  - Use SVY reference plus checkout email on the public tracker
  - Signed-in customers also see orders under account history
  - Tracking URLs appear after fulfillment and carrier assignment
  - Status updates cover payment verification and shipment milestones
tags:
  - tracking
  - shipping
  - orders
related:
  - refunds
  - shipping-lifecycle
relatedPaths:
  - /docs/orders/refunds
  - /track-order
publishedAt: 2025-01-10
updatedAt: 2026-04-20
priority: 0.85
changeFrequency: weekly
---

## Public tracker

Visit [/track-order](/track-order) and enter:

- **Order reference** (SVY…)
- **Email** used at checkout

## Lifecycle states

| State | Meaning |
| --- | --- |
| Placed | Checkout received |
| Verified | Payment confirmed |
| Fulfillment | Production / picking |
| Shipped | Carrier label created |
| Delivered | Confirmed delivery |

## Missing order after login

If a guest order does not appear after sign-in, the bag may not have merged. See [account bag sync](/docs/onboarding/account-bag-sync).
