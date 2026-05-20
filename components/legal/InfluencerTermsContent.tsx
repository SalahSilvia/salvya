import type { ReactNode } from "react";
import Link from "next/link";
import { CreatorCommissionRulesTable } from "@/components/creator/CreatorCommissionRulesTable";
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
  /** When true, rendered under main Terms §20 — use h3 for section titles for heading hierarchy. */
  embedded?: boolean;
};

export function InfluencerTermsContent({ embedded = false }: Props) {
  return (
    <div className="legal-influencer-terms">
      {!embedded ? (
        <p className={`${legalP} text-slate-600`}>
          <strong className={legalStrong}>Effective date:</strong> 12 May 2026 ·{" "}
          <strong className={legalStrong}>Version:</strong> 1.0
        </p>
      ) : null}
      <p className={legalP}>
        This <strong className={legalStrong}>Creator programme addendum</strong> (“
        <strong className={legalStrong}>Creator Terms</strong>”) supplements the Salvya{" "}
        <Link
          href="/terms"
          className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
        >
          Terms of Service
        </Link>
        . If you do not participate in the creator promo programme, these Creator Terms do not apply
        to you. Where there is a conflict between these Creator Terms and the general Terms on a topic covered here,
        these Creator Terms prevail for that topic only.
      </p>

      <Section embedded={embedded} id={embedded ? undefined : "inf-scope"}>
        {embedded ? "20.1 Scope and acceptance" : "1. Scope and acceptance"}
      </Section>
      <p className={legalP}>
        By applying for or activating a creator promo profile, generating or distributing a Salvya
        promo code, selecting catalogue items for code eligibility, or otherwise participating in the programme, you
        agree to these Influencer Terms in addition to the general Terms and the{" "}
        <Link
          href="/terms/account"
          className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
        >
          Account creation addendum
        </Link>{" "}
        where applicable.
      </p>

      <Section embedded={embedded}>{embedded ? "20.2 Eligibility and verification" : "2. Eligibility and verification"}</Section>
      <p className={legalP}>
        You must meet the age and contracting capacity requirements in the general Terms. You represent that follower
        counts, channel ownership, and identity information you provide are truthful. Salvya may request reasonable
        evidence (screenshots, platform analytics, government ID, or business registration) before activating codes,
        paying commissions, or shipping milestone rewards. Misrepresentation may result in suspension, termination, and
        forfeiture of pending payouts.
      </p>

      <Section embedded={embedded}>{embedded ? "20.3 Promo codes and fan discounts" : "3. Promo codes and fan discounts"}</Section>
      <p className={legalP}>
        Where Salvya enables it, you may receive a unique or personalised promo code for fans to enter at checkout on
        eligible items you have activated. Unless otherwise stated on the service, the public programme targets a{" "}
        <strong className={legalStrong}>10% discount</strong> for the fan on qualifying merchandise before shipping and
        taxes, subject to change with notice where the law allows. You may not advertise a different discount unless
        Salvya confirms it in writing.
      </p>
      <ul className={legalUl}>
        <li>You must not share, sell, or “farm” codes in ways that mislead consumers or circumvent caps.</li>
        <li>
          You must comply with advertising disclosure rules in each jurisdiction where you promote (for example,
          material connection disclosures).
        </li>
        <li>Codes may be deactivated for fraud, chargebacks, inventory limits, or brand safety.</li>
      </ul>

      <Section embedded={embedded}>{embedded ? "20.4 Commissions and milestones" : "4. Commissions and milestones"}</Section>
      <p className={legalP}>
        Salvya pays creators a <strong className={legalStrong}>fixed amount in Moroccan dirhams (DH)</strong> for each
        qualifying item sold through a valid attributed checkout — not a percentage of the order total. Your rate depends
        on the Instagram follower count declared in your application and verified by Salvya:
      </p>
      <div className="my-4">
        <CreatorCommissionRulesTable variant="light" />
      </div>
      <p className={legalP}>
        Each unit in an attributed order counts as one item (for example, quantity 2 on a line pays twice your band rate).
        Self-referrals, refunded orders, chargebacks, and fraudulent transactions do not qualify. Your live band and rate
        are shown in your creator Wallet after approval. Salvya may adjust future bands with reasonable notice; changes
        do not apply retroactively to sales already confirmed, except where required by law or to correct manifest errors.
      </p>
      <p className={legalP}>
        A sale is <strong className={legalStrong}>attributed</strong> to you only when Salvya’s systems record your
        valid promo link or code on a completed, non-reversed, qualifying transaction in a production environment. Preview or
        simulated checkouts do not generate commissions.
      </p>

      <Section embedded={embedded}>{embedded ? "20.5 Catalogue and brand safety" : "5. Catalogue and brand safety"}</Section>
      <p className={legalP}>
        You choose which approved Salvya SKUs carry your code from options presented in the creator tools. You must not
        imply endorsement by artists, labels, or Salvya beyond what is true and authorised. You must not pair Salvya
        promotions with unlawful, hateful, deceptive, or adult content where prohibited by Salvya policy.
      </p>

      <Section embedded={embedded}>{embedded ? "20.6 Payouts, taxes, and clawback" : "6. Payouts, taxes, and clawback"}</Section>
      <p className={legalP}>
        Payout methods, minimum balances, currency conversion, and schedules will be specified in your creator
        agreement or dashboard. You are responsible for all taxes on compensation you receive. If a sale attributed to
        you is refunded, charged back, or found fraudulent, Salvya may offset or claw back the related commission.
      </p>

      <Section embedded={embedded}>{embedded ? "20.7 Intellectual property" : "7. Intellectual property"}</Section>
      <p className={legalP}>
        Salvya and licensors retain all rights in trademarks, product assets, and platform software. Salvya may grant you
        a limited, revocable licence to use approved marketing assets solely to promote eligible products. You grant
        Salvya a licence to use your name, handle, and likeness in connection with the programme and internal reporting.
      </p>

      <Section embedded={embedded}>{embedded ? "20.8 Suspension and termination" : "8. Suspension and termination"}</Section>
      <p className={legalP}>
        Salvya may suspend or terminate programme access for breach, risk, or operational reasons. You may exit the
        programme by written notice where the law allows; outstanding obligations survive. Upon termination, unused
        codes may be disabled.
      </p>

      <Section embedded={embedded}>{embedded ? "20.9 Liability" : "9. Liability"}</Section>
      <p className={legalP}>
        To the maximum extent permitted by law, Salvya is not liable for lost profits, lost goodwill, or indirect damages
        arising from the programme. Your aggregate claim relating to the programme is subject to the same liability cap
        framework as the general Terms unless a stricter cap is set out in a signed creator agreement.
      </p>

      <Section embedded={embedded}>{embedded ? "20.10 Changes" : "10. Changes"}</Section>
      <p className={legalP}>
        Salvya may update these Creator Terms. Material changes will be posted here with an updated effective date
        and, where required, additional notice. Continued participation after the effective date constitutes acceptance
        where permitted by law.
      </p>

      <h4 className={legalH4}>Programme reference</h4>
      <p className={legalP}>
        For non-binding summaries and examples, see the{" "}
        <Link
          href="/creator"
          className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
        >
          creator programme overview
        </Link>{" "}
        and{" "}
        <Link
          href="/creator/dashboard"
          className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
        >
          dashboard preview
        </Link>
        .
      </p>
    </div>
  );
}
