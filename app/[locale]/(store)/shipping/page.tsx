import Link from "next/link";

const p = "mb-4 text-[15px] leading-[1.75] text-slate-700";
const h2 = "mt-12 scroll-mt-24 border-b border-slate-200 pb-3 text-[1.35rem] font-semibold tracking-[-0.02em] text-slate-900 sm:text-[1.45rem]";
const ul = "mb-4 list-disc space-y-2 pl-6 text-[15px] leading-[1.75] text-slate-700";
const strong = "font-semibold text-slate-900";

export default function ShippingPage() {
  return (
    <div className="min-h-dvh bg-white text-slate-900 antialiased">
      <header className="sticky top-0 z-20 border-b border-slate-200/90 bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-4 px-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))]">
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
            <Link href="/payment" className="text-slate-500 transition-colors hover:text-slate-800">
              Payment
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
              Logistics
            </span>
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-[max(1.25rem,env(safe-area-inset-left))] pb-24 pr-[max(1.25rem,env(safe-area-inset-right))] pt-12 sm:pt-16">
        <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-slate-500">Salvya</p>
        <h1 className="mt-2 text-[2rem] font-bold tracking-[-0.04em] text-slate-950 sm:text-[2.5rem]">
          Shipping &amp; delivery
        </h1>
        <p className="mt-3 text-[14px] text-slate-600">
          <strong className={strong}>Effective date:</strong> 12 May 2026 · <strong className={strong}>Version:</strong>{" "}
          1.0
        </p>
        <p className={`${p} mt-8 border-l-2 border-slate-200 pl-5 text-slate-600`}>
          This Shipping &amp; Delivery Policy (“<strong className={strong}>Policy</strong>”) explains how Salvya and
          its fulfilment partners handle physical goods from the point an order is accepted through delivery to you. It
          should be read together with our{" "}
          <Link href="/terms" className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/returns"
            className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
          >
            Returns &amp; refunds policy
          </Link>
          . For how we charge cards, PayPal, cash on delivery, and refunds to your payment method, see our{" "}
          <Link
            href="/payment"
            className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
          >
            Payment terms
          </Link>
          . Capitalised terms used here have the meanings given in the Terms unless otherwise defined below.
        </p>

        <h2 id="regions" className={h2}>
          1. Where we ship
        </h2>
        <p className={p}>
          Salvya is built with European fulfilment and fan communities in mind. Available shipping destinations,
          carriers, and service levels are determined at checkout based on your delivery address, product type
          (including size and weight), inventory location, and operational constraints.
        </p>
        <p className={p}>
          We may ship to countries including, where offered at checkout, members of the European Economic Area, the
          United Kingdom, Switzerland, Morocco, and the United States. Additional countries may be added or removed as
          carriers, customs rules, and partner capabilities change. If your address is not serviceable, checkout will
          not complete for that destination.
        </p>
        <p className={p}>
          Limited drops, pre-orders, or artist-specific capsules may be restricted to selected markets even when
          general shipping is otherwise available. Any restriction will be shown before payment.
        </p>

        <h2 id="methods" className={h2}>
          2. Shipping methods and carriers
        </h2>
        <p className={p}>
          We work with reputable parcel networks and last-mile carriers. The carrier(s) assigned to your order may
          include national postal services and integrated courier networks. The named carrier, service level (for
          example standard or express where offered), and any reference to carbon-conscious routing are displayed at
          checkout and in your shipping confirmation when production systems are enabled.
        </p>
        <ul className={ul}>
          <li>
            <strong className={strong}>Standard delivery</strong> is our default economical service where available.
          </li>
          <li>
            <strong className={strong}>Express delivery</strong> may be offered for select products, postcodes, or
            campaigns and may incur additional fees.
          </li>
          <li>
            <strong className={strong}>Pickup points</strong> or locker delivery may appear where supported by the
            carrier in your area.
          </li>
        </ul>
        <p className={p}>
          Carrier selection is automated with human oversight for exceptions (address issues, failed delivery, fraud
          checks). You cannot choose an unsupported carrier outside the options presented at checkout.
        </p>

        <h2 id="processing" className={h2}>
          3. Order processing and handling time
        </h2>
        <p className={p}>
          <strong className={strong}>Processing time</strong> is the interval between successful payment authorisation
          (or, for authorised payment methods, order acceptance) and handover to the carrier. Processing typically
          includes picking, quality control, packing, and label generation.
        </p>
        <p className={p}>
          Unless a different window is shown on the product page, you should allow up to <strong className={strong}>
            three to five (3–5) business days
          </strong>{" "}
          for in-stock items. Pre-orders, made-to-order garments, signed items, or co-branded capsules may list longer
          windows (for example two to four (2–4) weeks or a stated ship-by date). Business days exclude weekends and
          public holidays in the country of dispatch.
        </p>
        <p className={p}>
          During high-volume releases, warehouse migrations, or inventory reconciliation, processing may extend without
          prior notice; we will communicate material delays through order status updates where available.
        </p>

        <h2 id="transit" className={h2}>
          4. Transit times and delivery estimates
        </h2>
        <p className={p}>
          <strong className={strong}>Transit time</strong> begins when the carrier scans the parcel into its network
          and ends at first delivery attempt or handover to a pickup location. Published ranges are{" "}
          <strong className={strong}>estimates only</strong> and are not guaranteed unless expressly stated as a
          guaranteed service with separate terms and compensation entitlements.
        </p>
        <p className={p}>
          Domestic or intra-EU standard shipments commonly fall between{" "}
          <strong className={strong}>two and seven (2–7) business days</strong> after dispatch, depending on distance and
          carrier. Remote regions, islands, and cross-border routes may take longer. Express services, where available,
          generally shorten transit but remain subject to customs clearance when crossing borders.
        </p>
        <p className={p}>
          If tracking shows no movement for an unusually long period, contact support with your order number so we can
          open a carrier investigation.
        </p>

        <h2 id="international" className={h2}>
          5. International orders, customs, duties, and taxes
        </h2>
        <p className={p}>
          Orders shipped across international borders may be assessed import duties, value-added tax (VAT), goods and
          services tax (GST), brokerage fees, or other government charges. Whether these amounts are{" "}
          <strong className={strong}>prepaid at checkout</strong> (Delivered Duty Paid or equivalent) or{" "}
          <strong className={strong}>collected on delivery</strong> (Delivered Duty Unpaid or equivalent) depends on
          the configuration shown before you pay.
        </p>
        <ul className={ul}>
          <li>
            If duties and taxes are <strong className={strong}>not</strong> collected at checkout, you are responsible
            for paying the carrier or customs authority before the parcel is released. Refusal may result in return
            shipping fees and loss of the product if abandoned.
          </li>
          <li>
            Customs authorities may open parcels for inspection, delaying delivery without liability to Salvya beyond
            our obligation to cooperate with lawful requests.
          </li>
          <li>
            You must comply with import laws applicable to your country (for example restrictions on certain materials or
            quantities).
          </li>
        </ul>

        <h2 id="address" className={h2}>
          6. Delivery address, failed delivery, and undeliverable parcels
        </h2>
        <p className={p}>
          You are responsible for providing a complete, accurate address including building, floor, door code, and
          local phone number where required by the carrier. We are not liable for delays or losses caused by incorrect
          or incomplete information supplied by you.
        </p>
        <p className={p}>
          If delivery fails because nobody is available to receive the parcel, the carrier may leave a notice, attempt
          redelivery, deposit the parcel at a pickup point, or return it to sender according to its policies.{" "}
          <strong className={strong}>Additional charges</strong> may apply for storage, redelivery, address correction,
          or return-to-sender handling. If a parcel is returned as undeliverable, we may refund the product value minus
          shipping and restocking fees where permitted by law and our returns policy.
        </p>

        <h2 id="split" className={h2}>
          7. Split shipments and partial fulfilment
        </h2>
        <p className={p}>
          To optimise speed or inventory, an order may ship in more than one parcel. You will not be charged extra
          shipping for split shipments caused by Salvya or the artist’s fulfilment configuration beyond what was
          disclosed at checkout. Each parcel receives its own tracking identifier when production tracking is enabled.
        </p>

        <h2 id="tracking" className={h2}>
          8. Tracking and notifications
        </h2>
        <p className={p}>
          When tracking is available, a link or carrier reference will be included in your shipment confirmation email
          and, where you maintain an account, in your order history. SMS or push notifications may be offered if you opt
          in. Tracking information is supplied by third-party carriers and may contain errors or delays outside Salvya’s
          control.
        </p>

        <h2 id="receipt" className={h2}>
          9. Receipt, inspection, and damage in transit
        </h2>
        <p className={p}>
          Please inspect your parcel on arrival. If the outer packaging is visibly damaged, note it with the carrier when
          possible and photograph the packaging before opening. For defective or incorrect items, follow the{" "}
          <Link
            href="/returns"
            className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
          >
            Returns &amp; refunds policy
          </Link>
          . Claims for shipping damage may require submission within a stated window from the delivery date.
        </p>

        <h2 id="delays" className={h2}>
          10. Delays outside our control
        </h2>
        <p className={p}>
          Salvya is not liable for delays or failures caused by events beyond our reasonable control, including but not
          limited to natural disasters, pandemics, war, civil unrest, strikes, carrier bankruptcies, customs backlogs,
          air freight embargoes, or failures of third-party logistics systems. Where such events materially affect
          delivery, we will use reasonable efforts to notify you and propose alternatives (for example rerouting or
          refund where permitted).
        </p>

        <h2 id="sustainability" className={h2}>
          11. Packaging and sustainability
        </h2>
        <p className={p}>
          We encourage minimal, recyclable packaging and consolidated shipments where compatible with product
          protection. Specific environmental claims appear only where they can be substantiated for the relevant SKU
          or campaign.
        </p>

        <h2 id="preview" className={h2}>
          12. Preview and demonstration environments
        </h2>
        <p className={p}>
          In preview, staging, or demonstration builds of Salvya, shipping options, prices, carriers, and tracking
          links may be simulated or incomplete. No physical shipment will occur from such environments unless expressly
          stated otherwise in writing by Salvya.
        </p>

        <h2 id="changes" className={h2}>
          13. Changes to this Policy
        </h2>
        <p className={p}>
          We may update this Policy to reflect new carriers, routes, legal requirements, or operational practices. The
          effective date at the top of this page will change accordingly. Material changes that affect your rights may
          be communicated through additional notice where required by law.
        </p>

        <h2 id="contact" className={h2}>
          14. Questions about shipping
        </h2>
        <p className={p}>
          For delivery issues, address changes before dispatch, or carrier disputes, contact Salvya support using the
          channel provided in your order confirmation. Include your order number, delivery postcode, and a brief
          description of the issue to help us respond quickly.
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
              href="/returns"
              className="text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900 hover:decoration-slate-500"
            >
              Returns &amp; refunds
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
