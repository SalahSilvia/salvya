import type { ReactNode } from "react";
import Link from "next/link";
import { legalH2Section, legalH3Section, legalH4, legalP, legalStrong, legalUl } from "@/components/legal/terms-copy-styles";

function Section({ embedded, id, children }: { embedded: boolean; id?: string; children: ReactNode }) {
  if (embedded) {
    return (
      <h3 className={legalH3Section} id={id}>
        {children}
      </h3>
    );
  }
  return (
    <h2 className={legalH2Section} id={id}>
      {children}
    </h2>
  );
}

type Props = {
  embedded?: boolean;
};

export function AccountCreationTermsContent({ embedded = false }: Props) {
  return (
    <div className="legal-account-terms">
      {!embedded ? (
        <p className={`${legalP} text-slate-600`}>
          <strong className={legalStrong}>Effective date:</strong> 12 May 2026 ·{" "}
          <strong className={legalStrong}>Version:</strong> 1.0
        </p>
      ) : null}
      <p className={legalP}>
        This <strong className={legalStrong}>Account creation addendum</strong> (“
        <strong className={legalStrong}>Account Terms</strong>”) supplements the Salvya{" "}
        <Link
          href="/terms"
          className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
        >
          Terms of Service
        </Link>{" "}
        and applies when you create or attempt to create any Salvya account, whether as a{" "}
        <strong className={legalStrong}>customer</strong> (for example via{" "}
        <Link
          href="/register"
          className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
        >
          customer registration
        </Link>
        ) or as a <strong className={legalStrong}>creator / influencer</strong> (for example via{" "}
        <Link
          href="/creator/apply"
          className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
        >
          creator application
        </Link>
        ), including when authentication is provided by a third party (such as an OAuth provider). If you do not
        create an account, these Account Terms do not apply.
      </p>

      <Section embedded={embedded} id={embedded ? undefined : "acct-scope"}>
        {embedded ? "21.1 Who is covered" : "1. Who is covered"}
      </Section>
      <p className={legalP}>
        These Account Terms apply to you individually and, if you register on behalf of a company, to that entity. You
        confirm that you have authority to bind any entity you represent. Creator and influencer accounts are subject
        to the additional{" "}
        <Link
          href="/terms/creator"
          className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
        >
          Influencer programme addendum
        </Link>{" "}
        once you participate in promo codes or related creator commerce features.
      </p>

      <Section embedded={embedded}>{embedded ? "21.2 Accurate information" : "2. Accurate information"}</Section>
      <p className={legalP}>
        You agree to provide accurate, current, and complete registration information and to update it promptly. You
        must not impersonate another person, use another user’s credentials, or create accounts in bulk to evade
        enforcement, quotas, or bans. Salvya may refuse, merge, or terminate duplicate or suspicious accounts.
      </p>

      <Section embedded={embedded}>{embedded ? "21.3 Customer accounts" : "3. Customer accounts"}</Section>
      <p className={legalP}>
        Customer accounts are intended for personal shopping, order tracking, and related features. You must not use a
        customer account to operate a commercial storefront, scrape inventory, or circumvent purchase limits, unless
        Salvya expressly authorises that use in writing.
      </p>

      <Section embedded={embedded}>{embedded ? "21.4 Creator and influencer accounts" : "4. Creator and influencer accounts"}</Section>
      <p className={legalP}>
        Creator applications may require additional fields (public name, channels, audience size, and sample content).
        Submission does not guarantee approval. Until Salvya confirms onboarding in writing or through in-product
        controls, you should treat creator tools as preview-only where labelled. Approved creators remain bound by the
        general Terms, these Account Terms, and programme-specific terms.
      </p>

      <Section embedded={embedded}>{embedded ? "21.5 Credentials and security" : "5. Credentials and security"}</Section>
      <p className={legalP}>
        You are responsible for maintaining the confidentiality of passwords, magic links, and device sessions. You must
        notify Salvya promptly of unauthorised access. Salvya is not liable for losses arising from your failure to
        secure credentials, except where prohibited by law.
      </p>

      <Section embedded={embedded}>{embedded ? "21.6 Communications" : "6. Communications"}</Section>
      <p className={legalP}>
        By creating an account, you agree that Salvya may send transactional messages (security alerts, order updates,
        policy changes where required) to the contact details you provide. Marketing messages require separate consent
        where the law requires it.
      </p>

      <Section embedded={embedded}>{embedded ? "21.7 Preview and staging environments" : "7. Preview and staging environments"}</Section>
      <p className={legalP}>
        Where the services are labelled preview, beta, staging, or demonstration, account data may be reset, exported in
        limited ways, or unavailable. You should not rely on preview accounts for production business continuity.
      </p>

      <Section embedded={embedded}>{embedded ? "21.8 Minors" : "8. Minors"}</Section>
      <p className={legalP}>
        You must not create an account if you are below the digital consent age applicable in your region, unless a
        parent or guardian has provided any consent Salvya requires and we have enabled supervised use. Salvya may
        close accounts that appear to belong to minors where policy or law requires.
      </p>

      <Section embedded={embedded}>{embedded ? "21.9 Suspension and closure" : "9. Suspension and closure"}</Section>
      <p className={legalP}>
        Salvya may suspend or close accounts for breach of these Account Terms, the general Terms, fraud, legal process,
        or risk to the platform. You may close your account where self-service tools exist; certain records may be
        retained as described in privacy documentation to comply with law and dispute resolution.
      </p>

      <Section embedded={embedded}>{embedded ? "21.10 Privacy" : "10. Privacy"}</Section>
      <p className={legalP}>
        Personal data you supply at account creation is processed in accordance with Salvya’s privacy documentation and
        our{" "}
        <Link
          href="/cookies"
          className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
        >
          Cookie policy
        </Link>
        . Optional analytics cookies may be controlled in{" "}
        <Link
          href="/cookies/settings"
          className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
        >
          Cookie settings
        </Link>
        .
      </p>

      <Section embedded={embedded}>{embedded ? "21.11 Changes" : "11. Changes"}</Section>
      <p className={legalP}>
        Salvya may update these Account Terms. Material changes will be posted with an updated effective date and, where
        required, surfaced in-product or by email. Continued use of your account after the effective date may constitute
        acceptance where permitted by law.
      </p>

      <h4 className={legalH4}>Related links</h4>
      <ul className={legalUl}>
        <li>
          <Link href="/terms" className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600">
            Full Terms of Service
          </Link>
        </li>
        <li>
          <Link
            href="/terms/creator"
            className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
          >
            Influencer programme addendum
          </Link>
        </li>
        <li>
          <Link href="/terms#recovery" className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600">
            Account access and recovery (section 19)
          </Link>
        </li>
      </ul>
    </div>
  );
}
