import Link from "next/link";

const p = "mb-4 text-[15px] leading-[1.75] text-slate-700";
const h2 = "mt-12 scroll-mt-24 border-b border-slate-200 pb-3 text-[1.35rem] font-semibold tracking-[-0.02em] text-slate-900 sm:text-[1.45rem]";
const ul = "mb-4 list-disc space-y-2 pl-6 text-[15px] leading-[1.75] text-slate-700";
const strong = "font-semibold text-slate-900";

export default function PaymentTermsPage() {
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
            <Link href="/returns" className="text-slate-500 transition-colors hover:text-slate-800">
              Returns
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
              Payments
            </span>
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-[max(1.25rem,env(safe-area-inset-left))] pb-24 pr-[max(1.25rem,env(safe-area-inset-right))] pt-12 sm:pt-16">
        <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-slate-500">Salvya</p>
        <h1 className="mt-2 text-[2rem] font-bold tracking-[-0.04em] text-slate-950 sm:text-[2.5rem]">
          Payment terms
        </h1>
        <p className="mt-3 text-[14px] text-slate-600">
          <strong className={strong}>Effective date:</strong> 12 May 2026 · <strong className={strong}>Version:</strong>{" "}
          1.0
        </p>
        <p className={`${p} mt-8 border-l-2 border-slate-200 pl-5 text-slate-600`}>
          These Payment Terms (“<strong className={strong}>Payment Terms</strong>”) describe how Salvya and its payment
          partners collect, authorise, and settle amounts for purchases through our checkout. They supplement our{" "}
          <Link
            href="/terms"
            className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
          >
            Terms of Service
          </Link>{" "}
          (especially the orders and payment section) and our{" "}
          <Link
            href="/returns"
            className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
          >
            Returns &amp; refunds policy
          </Link>
          . If checkout or your order confirmation shows different fees, methods, or currencies for a specific order,
          those disclosures control for that transaction where they were visible before you confirmed payment.
        </p>

        <h2 id="scope" className={h2}>
          1. Who these Payment Terms cover
        </h2>
        <p className={p}>
          These Payment Terms apply when you pay for goods or services sold through Salvya-hosted checkout in a
          production environment where payment is live. The legal entity that contracts with you and processes or
          instructs payment may be identified on your receipt, tax invoice, or order confirmation.
        </p>

        <h2 id="methods" className={h2}>
          2. Accepted payment methods
        </h2>
        <p className={p}>
          Available methods depend on your region, currency, product, and risk checks. They may include, where offered at
          checkout:
        </p>
        <ul className={ul}>
          <li>
            <strong className={strong}>Cards</strong> (debit or credit) through our card acquirer or wallet flows;
          </li>
          <li>
            <strong className={strong}>PayPal</strong> (account balance, linked bank, or card funded through PayPal)
            when PayPal is enabled for the storefront;
          </li>
          <li>
            <strong className={strong}>Cash on delivery (COD)</strong> only where explicitly shown as an option and only
            for eligible destinations and order values. COD means you pay the courier or agent at delivery according to
            the instructions you receive—Salvya or its partner may cancel or refuse orders if COD terms are not met.
          </li>
        </ul>
        <p className={p}>
          We may add or remove methods, wallets, or instalment options from time to time. You must use a payment
          instrument you are authorised to use.
        </p>

        <h2 id="authorisation" className={h2}>
          3. Authorisation, capture, and timing
        </h2>
        <p className={p}>
          When you submit payment, you authorise Salvya and its designated processors to charge or debit the selected
          method for the order total shown at checkout (including product, shipping, taxes, and disclosed fees). Some
          flows place an <strong className={strong}>authorisation hold</strong> first and capture funds when the order
          is accepted or when items ship; others capture immediately. The timing for your statement may depend on your
          bank or PayPal.
        </p>
        <p className={p}>
          If we cannot complete capture (for example inventory allocation fails), we will void or release the
          authorisation where technically possible and notify you according to our processes.
        </p>

        <h2 id="currency" className={h2}>
          4. Currency and pricing
        </h2>
        <p className={p}>
          Prices are displayed in the currency selected or detected at checkout unless another currency is expressly
          stated. You are responsible for any <strong className={strong}>conversion fees, foreign transaction fees,
          </strong> or <strong className={strong}>cross-border charges</strong> imposed by your card issuer or PayPal.
          Promotional prices, bundles, and discounts apply only for the campaign window and rules shown on the site.
        </p>

        <h2 id="taxes" className={h2}>
          5. Taxes, duties, and third-party fees
        </h2>
        <p className={p}>
          Applicable <strong className={strong}>sales tax, VAT, GST,</strong> or similar may be estimated and collected
          at checkout where we are configured to do so. Import <strong className={strong}>duties, customs clearance,
          </strong> or <strong className={strong}>carrier brokerage</strong> may be billed separately by the carrier or
          customs authority depending on destination rules—see our{" "}
          <Link
            href="/shipping"
            className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
          >
            Shipping &amp; delivery policy
          </Link>{" "}
          for how those charges can arise.
        </p>

        <h2 id="failed" className={h2}>
          6. Failed, reversed, or disputed charges
        </h2>
        <p className={p}>
          If a payment is declined, expired, or reversed, we may suspend fulfilment until a successful payment is
          received or may cancel the order. You agree not to abuse chargebacks: see our{" "}
          <Link
            href="/terms"
            className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/returns#chargebacks"
            className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
          >
            Returns &amp; refunds policy
          </Link>{" "}
          for chargeback expectations. We may share transaction data with processors and fraud-prevention services as
          permitted by law and our privacy notices.
        </p>

        <h2 id="cod" className={h2}>
          7. Cash on delivery (COD)
        </h2>
        <p className={p}>
          Where COD is offered, you agree to have the <strong className={strong}>correct amount</strong> (or
          instrument accepted by the carrier) ready at delivery and to accept the carrier&apos;s terms. Refused
          delivery, failed collection attempts, or repeated COD failures may lead to restrictions on future COD
          eligibility or cancellation fees where disclosed and permitted by law.
        </p>

        <h2 id="refunds" className={h2}>
          8. Refunds and credits
        </h2>
        <p className={p}>
          When a refund is owed under our{" "}
          <Link
            href="/returns"
            className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
          >
            Returns &amp; refunds policy
          </Link>{" "}
          or mandatory consumer law, we will generally credit the <strong className={strong}>original payment method
          </strong>. For COD orders that were never collected or were cancelled in accordance with policy, any refund
          mechanism will be described in your order communications. Refund timing depends on banks and networks.
        </p>

        <h2 id="fraud" className={h2}>
          9. Fraud prevention and order verification
        </h2>
        <p className={p}>
          We may delay, review, or cancel orders that fail automated fraud checks, show inconsistent billing or
          shipping data, or match high-risk patterns. We may request additional verification (for example proof of card
          ownership or identity) before accepting or shipping an order.
        </p>

        <h2 id="processors" className={h2}>
          10. Payment processors and wallet providers
        </h2>
        <p className={p}>
          Card, PayPal, and other flows are operated by licensed or regulated <strong className={strong}>third-party
          processors</strong>. Their terms and privacy policies may apply in addition to ours. Salvya does not store
          full card numbers on its own servers when industry-standard tokenisation or hosted fields are used.
        </p>

        <h2 id="security" className={h2}>
          11. Security of your checkout session
        </h2>
        <p className={p}>
          Use a secure device and network when paying. Do not share one-time codes, passwords, or payment links. Salvya
          will not ask you to send card details by email or unsecured chat. Report suspected phishing to support using
          official channels only.
        </p>

        <h2 id="preview" className={h2}>
          12. Preview and demonstration environments
        </h2>
        <p className={p}>
          In preview, staging, or demo builds, payment UIs may be simulated. Unless Salvya confirms a live production
          charge in your card or wallet app, you should assume <strong className={strong}>no payment was taken</strong>{" "}
          and no fulfilment obligation exists.
        </p>

        <h2 id="changes" className={h2}>
          13. Changes to these Payment Terms
        </h2>
        <p className={p}>
          We may update these Payment Terms for legal, processor, or product reasons. The version and effective date at
          the top of this page will change. Changes apply to new orders after the updated date unless the law requires
          otherwise.
        </p>

        <h2 id="contact" className={h2}>
          14. Contact
        </h2>
        <p className={p}>
          For billing questions, duplicate charges, or payment errors, contact Salvya support using the channel in your
          order confirmation and include the order number and the last four digits of the card or your PayPal
          transaction ID where applicable.
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
              href="/returns"
              className="text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900 hover:decoration-slate-500"
            >
              Returns &amp; refunds
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
