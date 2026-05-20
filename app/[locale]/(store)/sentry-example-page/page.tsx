import { SalvyaErrorPage } from "@/components/errors/SalvyaErrorPage";
import { isSentryEnabled } from "@/lib/sentry/options";
import { SentryExampleClient } from "./SentryExampleClient";

export default function SentryExamplePage() {
  if (!isSentryEnabled()) {
    return (
      <SalvyaErrorPage
        variant="runtime"
        code="Sentry"
        title="Sentry is not configured"
        description="Add NEXT_PUBLIC_SENTRY_DSN to web/salvya.local.env (Sentry → salvya-production → Client Keys), stop the dev server, run npm run dev again, then reload this page."
        showReportLink={false}
      />
    );
  }

  return <SentryExampleClient />;
}
