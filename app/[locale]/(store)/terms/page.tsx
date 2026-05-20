import Link from "next/link";
import { AccountCreationTermsContent } from "@/components/legal/AccountCreationTermsContent";
import { InfluencerTermsContent } from "@/components/legal/InfluencerTermsContent";

const p = "mb-4 text-[15px] leading-[1.75] text-slate-700";
const h2 = "mt-12 scroll-mt-24 border-b border-slate-200 pb-3 text-[1.35rem] font-semibold tracking-[-0.02em] text-slate-900 sm:text-[1.45rem]";
const h3 = "mb-3 mt-8 text-[13px] font-semibold uppercase tracking-[0.08em] text-slate-500";
const ul = "mb-4 list-disc space-y-2 pl-6 text-[15px] leading-[1.75] text-slate-700";
const strong = "font-semibold text-slate-900";

export default function TermsPage() {
  return (
    <div className="min-h-dvh bg-white text-slate-900 antialiased">
      <header className="sticky top-0 z-20 border-b border-slate-200/90 bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-4 px-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))]">
          <Link
            href="/"
            className="text-[14px] font-semibold text-slate-600 transition-colors hover:text-slate-900"
          >
            ← Home
          </Link>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-semibold sm:gap-x-4">
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
            <Link href="/returns" className="text-slate-500 transition-colors hover:text-slate-800">
              Returns
            </Link>
            <span className="text-slate-300" aria-hidden>
              |
            </span>
            <Link href="/cookies" className="text-slate-500 transition-colors hover:text-slate-800">
              Cookies
            </Link>
            <span className="text-slate-300" aria-hidden>
              |
            </span>
            <Link href="/cookies/settings" className="text-slate-500 transition-colors hover:text-slate-800">
              Settings
            </Link>
            <span className="text-slate-300" aria-hidden>
              |
            </span>
            <Link href="/terms/account" className="text-slate-500 transition-colors hover:text-slate-800">
              Account terms
            </Link>
            <span className="text-slate-300" aria-hidden>
              |
            </span>
            <Link href="/terms/creator" className="text-slate-500 transition-colors hover:text-slate-800">
              Creator
            </Link>
            <span className="text-slate-300" aria-hidden>
              |
            </span>
            <span className="hidden text-[12px] font-medium uppercase tracking-[0.12em] text-slate-400 sm:inline">
              Legal
            </span>
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-[max(1.25rem,env(safe-area-inset-left))] pb-24 pr-[max(1.25rem,env(safe-area-inset-right))] pt-12 sm:pt-16">
        <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-slate-500">Salvya</p>
        <h1 className="mt-2 text-[2rem] font-bold tracking-[-0.04em] text-slate-950 sm:text-[2.5rem]">Terms of Service</h1>
        <p className="mt-3 text-[14px] text-slate-600">
          <strong className={strong}>Effective date:</strong> 12 May 2026 · <strong className={strong}>Version:</strong>{" "}
          1.1 (addenda: account creation; creator programme)
        </p>
        <p className={`${p} mt-8 border-l-2 border-slate-200 pl-5 text-slate-600`}>
          These Terms of Service (“<strong className={strong}>Terms</strong>”) govern your access to and use of the
          websites, applications, and related services operated by or on behalf of Salvya (“<strong className={strong}>
            Salvya
          </strong>,” “<strong className={strong}>we</strong>,” “<strong className={strong}>us</strong>,” or “
          <strong className={strong}>our</strong>”). By using our services, you agree to these Terms. If you do not
          agree, you must not use the services.
        </p>

        <h2 className={h2}>1. Who we are and how to read these Terms</h2>
        <p className={p}>
          Salvya provides a digital commerce experience focused on official artist merchandise, limited drops, and
          fan-first checkout. Depending on your jurisdiction, the contracting entity and additional policies (including
          privacy documentation and our{" "}
          <Link
            href="/cookies"
            className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
          >
            Cookie policy
          </Link>
          ) may be identified on your order confirmation or in a separate notice. Unless otherwise
          stated, “services” means our websites, mobile experiences, checkout flows, authentication tools, creator
          onboarding surfaces, and related features we make available from time to time.
        </p>
        <p className={p}>
          We may offer preview, beta, or demonstration functionality. Where that is the case, additional disclaimers in
          these Terms apply. Capitalised terms used in these Terms have the meanings given here or as otherwise defined
          in context.
        </p>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/90 p-5 sm:p-6">
          <p className="text-[13px] font-semibold text-slate-900">Additional terms (binding addenda)</p>
          <ul className={`${ul} mb-0 mt-3`}>
            <li>
              <Link
                href="/terms/account"
                className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
              >
                Account creation terms
              </Link>{" "}
              — applies when anyone creates a Salvya customer or creator account.
            </li>
            <li>
              <Link
                href="/terms/creator"
                className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
              >
                Creator programme terms
              </Link>{" "}
              — applies when you participate in promo codes, fan discounts, or creator commissions with Salvya.
            </li>
          </ul>
          <p className="mt-3 text-[13px] leading-relaxed text-slate-600">
            Sections <strong className={strong}>20</strong> and <strong className={strong}>21</strong> on this page
            repeat the same addenda for convenience; the standalone pages are the canonical URLs to share.
          </p>
        </div>

        <h2 className={h2}>2. Eligibility and your account</h2>
        <p className={p}>
          You must be able to form a legally binding contract in your place of residence to use the services in a
          capacity that involves purchases or account registration. If you use the services on behalf of a business,
          you represent that you have authority to bind that business.
        </p>
        <p className={p}>
          When you create an account, you agree to provide accurate, current, and complete information and to update it
          promptly. You are responsible for safeguarding your credentials and for all activity under your account. You
          must notify us promptly of any unauthorised use. We may suspend or terminate accounts where we reasonably
          believe there is risk to users, artists, or the integrity of the platform. Customer and creator registrations
          are also governed by the{" "}
          <Link
            href="/terms/account"
            className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
          >
            Account creation addendum
          </Link>
          .
        </p>

        <h2 className={h2}>3. The services; preview and production</h2>
        <p className={p}>
          Salvya may operate preview or staging environments where checkout, authentication, inventory, pricing, taxes,
          shipping quotes, or carrier integrations are simulated, incomplete, or subject to change. Unless a
          transaction is expressly confirmed as completed by Salvya in a production environment with valid payment
          capture, you should treat checkout experiences as non-binding demonstrations.
        </p>
        <p className={p}>
          We may modify, suspend, or discontinue any part of the services where reasonably necessary for security,
          compliance, or operations. We will aim to minimise disruption to paying customers where a commercial
          relationship exists, but we do not guarantee uninterrupted availability.
        </p>

        <h2 className={h2}>4. Marketplace, artists, and third parties</h2>
        <p className={p}>
          Artist shops, product pages, and related content may be operated or influenced by independent artists,
          labels, or partners. Where a third party fulfils production or logistics, additional terms from that party may
          apply and will be presented at or before purchase where required by law.
        </p>
        <p className={p}>
          You understand that artist names, logos, artwork, photography, audio references, and merchandise designs are
          protected by intellectual property rights owned by licensors, artists, or their representatives. You may
          not copy, scrape, misappropriate, or resell such materials except as expressly permitted by law or with
          written permission from the rights holder.
        </p>

        <h2 className={h2}>5. Orders, pricing, and payment</h2>
        <p className={p}>
          Product listings, descriptions, imagery, sizing guidance, and availability information are provided for
          informational purposes and may contain errors. We reserve the right to refuse or cancel orders where a
          listing was manifestly incorrect, where fraud is suspected, where inventory is unavailable, or where we
          cannot ship to your location.
        </p>
        <p className={p}>
          Prices may be shown inclusive or exclusive of applicable taxes depending on your region and the configuration
          of the storefront. Duties, import charges, and carrier fees may apply to international shipments as required
          by law. Payment methods accepted will be displayed at checkout. You authorise us and our payment processors to
          charge your selected payment method for authorised transactions.
        </p>
        <p className={p}>
          How we authorise, capture, refund, and work with processors and COD is explained in our standalone{" "}
          <Link
            href="/payment"
            className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
          >
            Payment terms
          </Link>
          .
        </p>

        <h2 className={h2}>6. Shipping, delivery, and risk</h2>
        <p className={p}>
          Estimated delivery windows are estimates only and are not guaranteed. Risk of loss and title for physical
          goods pass in accordance with the terms stated at checkout and applicable law. If a shipment is undeliverable
          due to an incorrect address provided by you, additional fees may apply to reship.
        </p>
        <p className={p}>
          Detailed rules for regions, carriers, customs, tracking, and delays are set out in our standalone{" "}
          <Link
            href="/shipping"
            className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
          >
            Shipping &amp; delivery policy
          </Link>
          . If there is any inconsistency between a checkout disclosure and that Policy for a completed commercial
          order, the checkout disclosure and order confirmation prevail for that transaction.
        </p>

        <h2 className={h2}>7. Returns, refunds, and chargebacks</h2>
        <p className={p}>
          Salvya produces many goods <strong className={strong}>on demand for the purchaser</strong>. Unless mandatory
          consumer law requires otherwise, we <strong className={strong}>do not accept change-of-mind returns</strong>.
          You may <strong className={strong}>cancel an order only within twelve (12) hours</strong> of placing it, as
          described in our Returns &amp; refunds policy. Exchanges are{" "}
          <strong className={strong}>offered only for Morocco</strong> where stated at checkout; outside Morocco, an
          exchange may be considered only if you provide proof to our team and we approve an exception in writing.
          You agree to follow the stated process and to cooperate with reasonable verification requests.
        </p>
        <p className={p}>
          Full operational detail for returns, refunds, exchanges, and statutory withdrawal (where applicable) is set
          out in our{" "}
          <Link
            href="/returns"
            className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
          >
            Returns &amp; refunds policy
          </Link>
          .
        </p>
        <p className={p}>
          Chargebacks and payment disputes should be a last resort after contacting support. Abusive or fraudulent
          disputes may result in account restrictions.
        </p>

        <h2 className={h2}>8. Acceptable use</h2>
        <p className={p}>You agree not to, and not to assist others to:</p>
        <ul className={ul}>
          <li>violate applicable law or infringe third-party rights;</li>
          <li>interfere with, disrupt, or place undue load on the services or underlying systems;</li>
          <li>attempt to gain unauthorised access to accounts, data, or networks;</li>
          <li>use automated means to access the services in a manner that violates our policies or technical controls;</li>
          <li>harass, defraud, or impersonate others;</li>
          <li>circumvent security, authentication, or regional restrictions where applicable.</li>
        </ul>

        <h2 className={h2}>9. Intellectual property; feedback</h2>
        <p className={p}>
          Salvya and its licensors retain all rights in the services, software, branding, and related materials. Subject
          to these Terms and any open-source licences that may apply to certain components, we do not grant you any
          licence to our intellectual property except the limited right to access and use the services for personal,
          non-commercial browsing where permitted, or for commercial use expressly authorised in writing.
        </p>
        <p className={p}>
          If you submit feedback, suggestions, or ideas, you grant Salvya a perpetual, worldwide, royalty-free licence
          to use them without obligation to you, except where prohibited by law.
        </p>

        <h2 className={h2}>10. Privacy</h2>
        <p className={p}>
          Our collection and use of personal data is described in our privacy documentation made available on the
          services. For how we use cookies and similar technologies, see our{" "}
          <Link
            href="/cookies"
            className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
          >
            Cookie policy
          </Link>
          . You can manage optional categories for this browser in{" "}
          <Link
            href="/cookies/settings"
            className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
          >
            Cookie settings
          </Link>
          . By using the services, you acknowledge that certain processing is necessary to operate accounts,
          process payments, prevent fraud, and comply with law.
        </p>

        <h2 className={h2}>11. Disclaimers</h2>
        <p className={p}>
          To the fullest extent permitted by applicable law, the services are provided on an “as is” and “as available”
          basis without warranties of any kind, whether express, implied, or statutory, including implied warranties of
          merchantability, fitness for a particular purpose, title, and non-infringement. We do not warrant that the
          services will be error-free, secure, or free of harmful components.
        </p>

        <h2 className={h2}>12. Limitation of liability</h2>
        <p className={p}>
          To the maximum extent permitted by applicable law, Salvya and its affiliates, directors, employees, and
          partners will not be liable for any indirect, incidental, special, consequential, exemplary, or punitive
          damages, or any loss of profits, revenues, goodwill, data, or business opportunities, arising out of or
          related to your use of the services, even if advised of the possibility of such damages.
        </p>
        <p className={p}>
          To the maximum extent permitted by applicable law, our aggregate liability for any claim arising out of or
          relating to the services or these Terms is limited to the greater of (a) the amount you paid to Salvya for
          the transaction giving rise to the claim in the twelve (12) months before the event, or (b) one hundred euros
          (€100) if no such payments occurred. Some jurisdictions do not allow certain limitations; in those
          jurisdictions, our liability is limited to the minimum extent permitted by law.
        </p>

        <h2 className={h2}>13. Indemnity</h2>
        <p className={p}>
          You will defend, indemnify, and hold harmless Salvya and its affiliates from and against any claims, damages,
          losses, liabilities, costs, and expenses (including reasonable attorneys’ fees) arising out of or related to
          your use of the services, your breach of these Terms, or your violation of third-party rights, except to the
          extent caused by Salvya’s wilful misconduct or gross negligence.
        </p>

        <h2 className={h2}>14. Suspension and termination</h2>
        <p className={p}>
          We may suspend or terminate access to the services where reasonably necessary to protect users, comply with
          law, or address misuse. You may stop using the services at any time. Provisions that by their nature should
          survive termination (including intellectual property, disclaimers, limitations, indemnity, and governing law)
          will survive.
        </p>

        <h2 className={h2}>15. Governing law; disputes</h2>
        <p className={p}>
          Unless mandatory consumer protection laws in your country require otherwise, these Terms are governed by
          the laws of France, without regard to conflict-of-law principles. Courts located in France shall have
          exclusive jurisdiction over disputes arising out of or relating to these Terms and the services, subject to
          any non-waivable rights you may have as a consumer to bring claims in your home jurisdiction.
        </p>
        <p className={p}>
          If you are a consumer in the European Economic Area, you may also have the right to use the European
          Commission’s online dispute resolution platform or a local consumer mediation scheme where available.
        </p>

        <h2 className={h2}>16. Changes to these Terms</h2>
        <p className={p}>
          We may update these Terms from time to time. We will post the updated version on this page and revise the
          effective date. Where changes are material and the law requires consent or notice, we will provide additional
          notice or obtain consent as appropriate. Continued use after the effective date may constitute acceptance
          where permitted by law.
        </p>

        <h2 className={h2}>17. General</h2>
        <p className={p}>
          If any provision of these Terms is held invalid or unenforceable, the remaining provisions remain in effect.
          Our failure to enforce a provision is not a waiver. You may not assign these Terms without our consent; we may
          assign them in connection with a merger, acquisition, or sale of assets. These Terms constitute the entire
          agreement between you and Salvya regarding the subject matter here and supersede prior understandings on the
          same subject, except where additional terms expressly apply to a specific transaction (including the Account
          creation and Creator programme addenda in sections 20–21 and at /terms/account and /terms/creator).
        </p>

        <h2 className={h2}>18. Contact</h2>
        <p className={p}>
          For legal notices or privacy requests, contact Salvya using the official contact channels published on the
          services. For order support, use the contact method provided in your order confirmation when available.
        </p>

        <h2 id="recovery" className={`${h2} scroll-mt-28`}>
          19. Account access and recovery
        </h2>
        <p className={p}>
          If you cannot access your account, use the password reset or sign-in assistance tools offered on the services
          when enabled. In preview environments, automated recovery may be limited. Where self-service recovery is
          unavailable, contact support through the official channels listed on the site or provided during onboarding.
        </p>
        <p className={p}>
          To protect accounts, we may require additional verification before resetting credentials or changing security
          settings. Never share one-time codes or recovery links with third parties.
        </p>

        <h2 id="creator-terms" className={`${h2} scroll-mt-28`}>
          20. Creator programme terms (addendum)
        </h2>
        <p className={p}>
          The following sections apply in addition to the general Terms when you participate in Salvya’s influencer or
          creator promo programme (including promo codes, fan discounts, and related commissions).
        </p>
        <InfluencerTermsContent embedded />

        <h2 id="account-creation-terms" className={`${h2} scroll-mt-28`}>
          21. Account creation terms (addendum)
        </h2>
        <p className={p}>
          The following sections apply in addition to the general Terms whenever you create or maintain a Salvya
          account, whether as a shopping customer or as a creator applicant.
        </p>
        <AccountCreationTermsContent embedded />

        <div className="mt-14 border-t border-slate-200 pt-10">
          <h3 className={h3}>Acknowledgement</h3>
          <p className={p}>
            By clicking “I agree,” creating an account, placing an order where permitted, or otherwise continuing to
            use the services after notice of updated Terms, you acknowledge that you have read and understood these
            Terms (including addenda in sections 20–21 where they apply to you) and agree to be bound by them.
          </p>
        </div>

        <p className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:justify-center">
          <Link
            href="/terms/account"
            className="text-[14px] font-semibold text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900 hover:decoration-slate-500"
          >
            Account creation terms
          </Link>
          <span className="hidden text-slate-300 sm:inline" aria-hidden>
            ·
          </span>
          <Link
            href="/terms/creator"
            className="text-[14px] font-semibold text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900 hover:decoration-slate-500"
          >
            Influencer programme terms
          </Link>
          <span className="hidden text-slate-300 sm:inline" aria-hidden>
            ·
          </span>
          <Link
            href="/shipping"
            className="text-[14px] font-semibold text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900 hover:decoration-slate-500"
          >
            Shipping &amp; delivery policy
          </Link>
          <span className="hidden text-slate-300 sm:inline" aria-hidden>
            ·
          </span>
          <Link
            href="/payment"
            className="text-[14px] font-semibold text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900 hover:decoration-slate-500"
          >
            Payment terms
          </Link>
          <span className="hidden text-slate-300 sm:inline" aria-hidden>
            ·
          </span>
          <Link
            href="/returns"
            className="text-[14px] font-semibold text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900 hover:decoration-slate-500"
          >
            Returns &amp; refunds policy
          </Link>
          <span className="hidden text-slate-300 sm:inline" aria-hidden>
            ·
          </span>
          <Link
            href="/cookies"
            className="text-[14px] font-semibold text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900 hover:decoration-slate-500"
          >
            Cookie policy
          </Link>
          <span className="hidden text-slate-300 sm:inline" aria-hidden>
            ·
          </span>
          <Link
            href="/cookies/settings"
            className="text-[14px] font-semibold text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900 hover:decoration-slate-500"
          >
            Cookie settings
          </Link>
          <span className="hidden text-slate-300 sm:inline" aria-hidden>
            ·
          </span>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-8 text-[14px] font-semibold text-slate-800 shadow-sm transition-colors hover:border-slate-400 hover:bg-slate-50"
          >
            Return to Salvya home
          </Link>
        </p>
      </article>
    </div>
  );
}
