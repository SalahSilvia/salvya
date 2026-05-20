import Link from "next/link";

const p = "mb-4 text-[15px] leading-[1.75] text-slate-700";
const h2 = "mt-12 scroll-mt-24 border-b border-slate-200 pb-3 text-[1.35rem] font-semibold tracking-[-0.02em] text-slate-900 sm:text-[1.45rem]";
const ul = "mb-4 list-disc space-y-2 pl-6 text-[15px] leading-[1.75] text-slate-700";
const strong = "font-semibold text-slate-900";

export default function CookiesPolicyPage() {
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
            <Link href="/returns" className="text-slate-500 transition-colors hover:text-slate-800">
              Returns
            </Link>
            <span className="text-slate-300" aria-hidden>
              |
            </span>
            <Link href="/cookies/settings" className="text-slate-500 transition-colors hover:text-slate-800">
              Settings
            </Link>
            <span className="hidden text-slate-300 sm:inline" aria-hidden>
              |
            </span>
            <span className="hidden text-[12px] font-medium uppercase tracking-[0.12em] text-slate-400 sm:inline">
              Cookies
            </span>
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-[max(1.25rem,env(safe-area-inset-left))] pb-24 pr-[max(1.25rem,env(safe-area-inset-right))] pt-12 sm:pt-16">
        <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-slate-500">Salvya</p>
        <h1 className="mt-2 text-[2rem] font-bold tracking-[-0.04em] text-slate-950 sm:text-[2.5rem]">
          Cookie policy
        </h1>
        <p className="mt-3 text-[14px] text-slate-600">
          <strong className={strong}>Effective date:</strong> 12 May 2026 · <strong className={strong}>Version:</strong>{" "}
          1.0
        </p>

        <p className={`${p} mt-8 border-l-2 border-slate-200 pl-5 text-slate-600`}>
          This Cookie Policy explains how Salvya (“<strong className={strong}>Salvya</strong>,” “
          <strong className={strong}>we</strong>,” “<strong className={strong}>us</strong>”) uses cookies and similar
          technologies when you visit our websites or use our web applications. It should be read together with our{" "}
          <Link
            href="/terms"
            className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
          >
            Terms of Service
          </Link>{" "}
          and any privacy information we publish for your region. Capitalised terms used here follow the Terms unless
          defined below.
        </p>

        <h2 id="what" className={h2}>
          1. What cookies and similar technologies are
        </h2>
        <p className={p}>
          <strong className={strong}>Cookies</strong> are small text files stored on your device when you visit a site.
          We may also use <strong className={strong}>local storage</strong>, <strong className={strong}>session storage
          </strong>, <strong className={strong}>pixels</strong>, or <strong className={strong}>SDKs</strong> in mobile
          experiences for similar purposes—for simplicity, this policy refers to all of these as “cookies” unless we
          specify otherwise.
        </p>

        <h2 id="why" className={h2}>
          2. Why we use cookies
        </h2>
        <p className={p}>We use cookies to:</p>
        <ul className={ul}>
          <li>keep the services secure and operational (for example load balancing, bot defence, and fraud signals);</li>
          <li>remember your session, language, or preferences where you have chosen them;</li>
          <li>measure how the services perform and how audiences use features so we can improve them;</li>
          <li>support checkout, authentication, and embedded tools from payment partners when you choose to use them.</li>
        </ul>

        <h2 id="types" className={h2}>
          3. Categories of cookies we use
        </h2>
        <p className={p}>
          <strong className={strong}>Strictly necessary.</strong> Required for core functionality such as security,
          network management, account sign-in, cart or checkout continuity, and remembering cookie choices. These may be
          set without consent where the law allows because the service cannot function safely without them.
        </p>
        <p className={p}>
          <strong className={strong}>Functional.</strong> Remember settings you select (for example reduced motion,
          display preferences, or form progress on supported flows).
        </p>
        <p className={p}>
          <strong className={strong}>Analytics.</strong> Help us understand aggregate traffic, errors, and feature usage.
          Where required, we will ask for your consent before enabling non-essential analytics on your device.
        </p>
        <p className={p}>
          <strong className={strong}>Marketing (if enabled).</strong> Used to measure campaigns or to personalise
          promotional content on third-party platforms. We will only use optional marketing cookies where permitted and,
          where required, after you opt in through a consent tool.
        </p>

        <h2 id="third" className={h2}>
          4. Third-party cookies and processors
        </h2>
        <p className={p}>
          When you interact with payment methods (for example{" "}
          <strong className={strong}>PayPal</strong> buttons), fraud screening, maps, or embedded media, those providers
          may set their own cookies subject to their policies. We do not control third-party cookies; please review their
          documentation and your account settings with those services.
        </p>

        <h2 id="duration" className={h2}>
          5. How long cookies last
        </h2>
        <p className={p}>
          <strong className={strong}>Session cookies</strong> expire when you close your browser.{" "}
          <strong className={strong}>Persistent cookies</strong> remain for a set period (for example 30 days or 12
          months) depending on their purpose. We aim to keep retention no longer than necessary for each purpose.
        </p>

        <h2 id="choices" className={h2}>
          6. Your choices and controls
        </h2>
        <p className={p}>
          You can block or delete cookies through your browser settings. Blocking strictly necessary cookies may prevent
          parts of the services from working (for example staying signed in or completing checkout).
        </p>
        <p className={p}>
          Where we offer a <strong className={strong}>cookie banner or preference centre</strong>, you can revisit your
          choices there when available. Industry opt-out pages (for example for certain advertising networks) may also
          apply to partners we use.
        </p>
        <p className={p}>
          Open Salvya&apos;s{" "}
          <Link
            href="/cookies/settings"
            className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
          >
            Cookie settings
          </Link>{" "}
          to choose optional categories on this device. Your selections are stored locally in your browser until you
          clear site data.
        </p>

        <h2 id="dnt" className={h2}>
          7. Global Privacy Control and “Do Not Track”
        </h2>
        <p className={p}>
          Some browsers send a “Do Not Track” signal; there is no uniform industry response. Where required by applicable
          law, we honour legally recognised opt-out signals (such as Global Privacy Control for covered sales/sharing in
          supported jurisdictions) in line with our technical capabilities and any consent platform we deploy.
        </p>

        <h2 id="children" className={h2}>
          8. Children
        </h2>
        <p className={p}>
          The services are not directed at children under the age where parental consent is required for data
          processing in their region. We do not knowingly use cookies to profile children for marketing.
        </p>

        <h2 id="changes" className={h2}>
          9. Changes to this Cookie Policy
        </h2>
        <p className={p}>
          We may update this Cookie Policy when we change technologies, partners, or legal requirements. The effective
          date at the top will change. Material changes may be highlighted through the services or consent tools where
          appropriate.
        </p>

        <h2 id="contact" className={h2}>
          10. Contact
        </h2>
        <p className={p}>
          For questions about cookies or this policy, contact Salvya using the official channels published on the site
          or provided in your account or order materials. For personal data requests, refer to our privacy
          documentation referenced in the{" "}
          <Link
            href="/terms"
            className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
          >
            Terms of Service
          </Link>
          .
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
              href="/returns"
              className="text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900 hover:decoration-slate-500"
            >
              Returns &amp; refunds
            </Link>
            <Link
              href="/cookies/settings"
              className="text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900 hover:decoration-slate-500"
            >
              Cookie settings
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
