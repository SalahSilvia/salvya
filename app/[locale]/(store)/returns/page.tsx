import Link from "next/link";

const p = "mb-4 text-[15px] leading-[1.75] text-slate-700";
const h2 = "mt-12 scroll-mt-24 border-b border-slate-200 pb-3 text-[1.35rem] font-semibold tracking-[-0.02em] text-slate-900 sm:text-[1.45rem]";
const strong = "font-semibold text-slate-900";

export default function ReturnsPage() {
  return (
    <div className="min-h-dvh bg-white text-slate-900 antialiased">
      <header className="sticky top-0 z-20 border-b border-slate-200/90 bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))]">
          <Link href="/" className="text-[14px] font-semibold text-slate-600 transition-colors hover:text-slate-900">
            ← Home
          </Link>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-semibold sm:gap-x-4">
            <Link href="/terms" className="text-slate-500 transition-colors hover:text-slate-800">
              Terms
            </Link>
            <span className="text-slate-300" aria-hidden>
              |
            </span>
            <Link href="/shipping" className="text-slate-500 transition-colors hover:text-slate-800">
              Shipping
            </Link>
            <span className="text-slate-300" aria-hidden>
              |
            </span>
            <Link href="/payment" className="text-slate-500 transition-colors hover:text-slate-800">
              Payment
            </Link>
            <span className="text-slate-300" aria-hidden>
              |
            </span>
            <Link href="/cookies" className="text-slate-500 transition-colors hover:text-slate-800">
              Cookies
            </Link>
            <span className="hidden text-slate-300 sm:inline" aria-hidden>
              |
            </span>
            <span className="hidden text-[12px] font-medium uppercase tracking-[0.12em] text-slate-400 sm:inline">
              Aftercare
            </span>
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-[max(1.25rem,env(safe-area-inset-left))] pb-24 pr-[max(1.25rem,env(safe-area-inset-right))] pt-12 sm:pt-16">
        <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-slate-500">Salvya</p>
        <h1 className="mt-2 text-[2rem] font-bold tracking-[-0.04em] text-slate-950 sm:text-[2.5rem]">
          Returns &amp; refunds
        </h1>
        <p className="mt-3 text-[14px] text-slate-600">
          <strong className={strong}>Effective date:</strong> 12 May 2026 · <strong className={strong}>Version:</strong>{" "}
          2.0
        </p>
        <p className={`${p} mt-8 border-l-2 border-amber-200 bg-amber-50/60 pl-5 text-slate-800`}>
          <strong className={strong}>Important:</strong> Salvya does <strong className={strong}>not</strong> accept
          returns for change of mind. Each item is <strong className={strong}>produced on demand for you</strong> once
          your order is confirmed. Please use our{" "}
          <Link
            href="/size-guide"
            className="font-semibold text-slate-900 underline decoration-amber-300 underline-offset-2 hover:decoration-slate-600"
          >
            size guide
          </Link>{" "}
          and review size, colour, artwork, shipping address, and all options carefully before you pay. If you need to
          change your mind, you may only{" "}
          <strong className={strong}>cancel within twelve (12) hours</strong> of placing the order, as described
          below—after that window, the order is treated as committed to production.
        </p>
        <p className={`${p} mt-4 border-l-2 border-slate-200 pl-5 text-slate-600`}>
          This Policy (“<strong className={strong}>Policy</strong>”) works alongside our{" "}
          <Link
            href="/terms"
            className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/shipping"
            className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
          >
            Shipping &amp; delivery policy
          </Link>
          . For charges, authorisation, and how refunds are sent back to your card or wallet, see our{" "}
          <Link
            href="/payment"
            className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
          >
            Payment terms
          </Link>{" "}
          and{" "}
          <Link
            href="/cookies"
            className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
          >
            Cookie policy
          </Link>
          . If checkout or your order confirmation states different rules for a specific campaign, those disclosures
          control for that purchase where they were shown before payment.
        </p>

        <h2 id="scope" className={h2}>
          1. Who this Policy covers
        </h2>
        <p className={p}>
          This Policy applies when you buy physical goods through Salvya and a commercial sale is completed. Digital
          goods, tickets, or experiences may have separate terms at purchase. Nothing here limits{" "}
          <strong className={strong}>non-waivable rights</strong> you may have under mandatory consumer law in your
          country (for example claims for goods that are defective or not as described).
        </p>

        <h2 id="no-returns" className={h2}>
          2. On-demand production — no change-of-mind returns
        </h2>
        <p className={p}>
          Our merchandise is <strong className={strong}>made to order for the customer</strong> who placed the order.
          Materials and production capacity are allocated to your specific purchase. For that reason,{" "}
          <strong className={strong}>
            we do not accept returns because you changed your mind, ordered the wrong size, dislike the design, or for
            similar subjective reasons
          </strong>
          .
        </p>
        <p className={p}>
          By completing checkout, you acknowledge that you have checked your selections and that{" "}
          <strong className={strong}>all sales are final</strong> except where this Policy or mandatory law expressly
          provides otherwise (cancellation within twelve hours, or remedies for defects / non-conformity as in section 7).
        </p>

        <h2 id="cancellation" className={h2}>
          3. Order cancellation — twelve (12) hours from purchase
        </h2>
        <p className={p}>
          If you wish to cancel, you must request cancellation{" "}
          <strong className={strong}>within twelve (12) hours</strong> of the time you submitted the order (the
          timestamp on your order confirmation). Use the cancellation option in your account or contact support
          immediately with your order number. After twelve hours, production or fulfilment may already be underway;{" "}
          <strong className={strong}>we are under no obligation to cancel or refund</strong> the order solely because
          you no longer want the goods.
        </p>
        <p className={p}>
          Approved cancellations within the twelve-hour window will be refunded to the original payment method where
          technically possible, subject to processing times from banks and payment providers.
        </p>

        <h2 id="withdrawal" className={h2}>
          4. Statutory cooling-off and withdrawal (where applicable)
        </h2>
        <p className={p}>
          Depending on your location, consumer law may grant a right to withdraw from certain distance contracts within a
          fixed period. <strong className={strong}>Personalised and made-to-order goods</strong> are commonly excluded
          from withdrawal once production has started or once the nature of the contract excludes them under applicable
          law. If you believe a statutory withdrawal right applies to your order, contact support promptly with your
          order details; we will respond in line with applicable rules.
        </p>

        <h2 id="exchanges" className={h2}>
          5. Exchanges — Morocco only, exceptions by team review
        </h2>
        <p className={p}>
          <strong className={strong}>We do not offer exchanges as a standard service outside Morocco.</strong> Size
          swaps, colour changes, or “exchange for another item” are{" "}
          <strong className={strong}>not available</strong> unless the delivery is for{" "}
          <strong className={strong}>Morocco</strong> and we have explicitly enabled an exchange path for that order or
          campaign at checkout.
        </p>
        <p className={p}>
          For orders <strong className={strong}>outside Morocco</strong>, an exchange is{" "}
          <strong className={strong}>only possible if you contact our team</strong>, provide{" "}
          <strong className={strong}>clear proof</strong> that supports your request (for example photographs of a
          manufacturing defect, wrong item received versus what was ordered, or transit damage), and{" "}
          <strong className={strong}>we approve an exception in writing</strong>. Approval is discretionary and not
          guaranteed. If we do not approve an exchange, any remedy you may have will follow applicable law and section 7
          (for example refund or replacement where legally required).
        </p>

        <h2 id="refunds" className={h2}>
          6. Refunds (other than cancellation and legal remedies)
        </h2>
        <p className={p}>
          Outside the <Link href="#cancellation" className="font-semibold underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600">twelve-hour cancellation window</Link>{" "}
          and remedies for <Link href="#warranty" className="font-semibold underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600">defective or non-conforming goods</Link>, we do not issue refunds for buyer’s remorse or
          because you selected the wrong variant.
        </p>
        <p className={p}>
          When a refund is due (approved cancellation in time, duplicate charge, or as required after a valid
          defect/non-conformity claim), we will credit the <strong className={strong}>original payment method</strong>{" "}
          unless that is impossible, in which case we may use another lawful method. Timing depends on your bank or
          card issuer.
        </p>

        <h2 id="warranty" className={h2}>
          7. Defective products, wrong items, and legal conformity
        </h2>
        <p className={p}>
          If an item is <strong className={strong}>defective</strong>, <strong className={strong}>damaged before you
          used it</strong> (subject to inspection), or <strong className={strong}>materially not as described</strong>,
          contact support without delay with your order number, photos of the issue, and packaging if relevant. We may
          ask you to return the item for inspection. Remedies (repair, replacement, price reduction, or refund) follow{" "}
          <strong className={strong}>mandatory consumer law</strong> in your country and our reasonable assessment of
          the facts—not the general exchange or return policies in sections 2 and 5.
        </p>

        <h2 id="chargebacks" className={h2}>
          8. Chargebacks and payment disputes
        </h2>
        <p className={p}>
          Please contact us before initiating a chargeback. Unfounded chargebacks may lead to account restrictions and
          slow legitimate resolutions. Where a payment network rules on a dispute, we will comply with that outcome where
          required.
        </p>

        <h2 id="preview" className={h2}>
          9. Preview and demonstration environments
        </h2>
        <p className={p}>
          In preview, staging, or demo builds of Salvya, cancellation timers, support tools, and refund flows may be
          simulated. No binding obligation arises from those environments unless Salvya confirms a production
          transaction.
        </p>

        <h2 id="changes" className={h2}>
          10. Changes to this Policy
        </h2>
        <p className={p}>
          We may update this Policy for legal, operational, or product reasons. The version and effective date at the top
          will change. Changes do not reduce non-waivable rights for orders already placed, except where the law allows.
        </p>

        <h2 id="contact" className={h2}>
          11. Contact
        </h2>
        <p className={p}>
          For cancellation within twelve hours, defect reports, or questions about this Policy, use the support
          channel indicated in your order confirmation. Include your order number and clear photos for any claim about
          product condition.
        </p>

        <div className="mt-14 flex flex-col gap-4 border-t border-slate-200 pt-10 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-[14px] font-semibold">
            <Link
              href="/terms"
              className="text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900 hover:decoration-slate-500"
            >
              ← Terms of Service
            </Link>
            <Link
              href="/shipping"
              className="text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900 hover:decoration-slate-500"
            >
              Shipping &amp; delivery
            </Link>
            <Link
              href="/payment"
              className="text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900 hover:decoration-slate-500"
            >
              Payment terms
            </Link>
            <Link
              href="/cookies"
              className="text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900 hover:decoration-slate-500"
            >
              Cookie policy
            </Link>
          </div>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-8 text-[14px] font-semibold text-slate-800 shadow-sm transition-colors hover:border-slate-400 hover:bg-slate-50"
          >
            Return to Salvya home
          </Link>
        </div>
      </article>
    </div>
  );
}
