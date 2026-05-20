# Payments — production QA checklist

Use after PayPal migration `20250516290000_paypal_payment_verification.sql` is applied.

## Environment

- [ ] `NEXT_PUBLIC_PAYPAL_CLIENT_ID` — live app (browser)
- [ ] `PAYPAL_CLIENT_SECRET` — same app as public id
- [ ] `PAYPAL_MODE=live` in production only
- [ ] `NEXT_PUBLIC_SITE_URL` — canonical production URL
- [ ] Server logs show no `[payments] PayPal environment warnings` on first order

## PayPal (international)

- [ ] Create order → approve → confirm shows “Verifying PayPal…”
- [ ] Order `payment_status` = `paid` in admin
- [ ] Admin drawer shows PayPal order id + capture id + verified time
- [ ] Refresh confirm page does not create second order
- [ ] Double-click PayPal does not double-charge (idempotent)
- [ ] Wrong promo / tampered `discountCents` rejected (400)
- [ ] Expired checkout session rejected (400 `checkout_expired`)
- [ ] Cancel PayPal → clear message, retry works

## COD (Morocco)

- [ ] COD only for MA shipping country
- [ ] `payment_status` = `cod_pending`
- [ ] Confirmation email sent
- [ ] Guest track-order lookup works

## Admin

- [ ] Paid / COD pending / Failed badges readable
- [ ] PayPal metadata copy buttons work
- [ ] Fulfillment update independent of payment status

## Commands

```bash
npm test
npm run build
```
