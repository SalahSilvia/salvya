---
title: Returns & refunds
description: How Salvya processes return windows, eligibility, and refund timelines after delivery.
summary: Understand when refunds are available, how to start a return, and how payouts reverse on creator-attributed orders.
aiSummary: This article explains Salvya refund eligibility, customer-initiated returns, verification steps, and how refunded orders affect creator DH commissions.
keyPoints:
  - Refund windows depend on product type and delivery confirmation
  - Guest and signed-in orders both use SVY references for support
  - Creator commissions adjust when a qualifying refund is approved
  - Refund status appears in order tracking and account history
tags:
  - refunds
  - returns
  - orders
  - customer
related:
  - tracking
  - payment-failures
relatedPaths:
  - /docs/orders/tracking
  - /returns
  - /help-center
entities:
  policies:
    - /returns
  apis:
    - GET /api/orders
publishedAt: 2025-01-15
updatedAt: 2026-05-01
priority: 0.8
changeFrequency: monthly
locales:
  - en
  - fr
  - ar
---

## Overview

Salvya refunds protect fans buying official artist merch while keeping creator payouts fair. A refund is not automatic — each request is checked against the [returns policy](/returns).

## Customer flow

1. Confirm delivery status via [track order](/track-order).
2. Review eligibility on the returns page.
3. Contact support with your **SVY order reference** and purchase email.
4. Receive approval or alternative resolution (exchange, store credit where offered).

## Creator attribution

When a refunded order was attributed to a creator link, the wallet balance reflects the reversal according to programme terms. See [creator payouts](/docs/creators/payouts).

## AI & automation note

Structured refund metadata is exposed in order APIs for partners building support bots. OpenAPI: [/openapi.json](/openapi.json).
