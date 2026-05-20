import * as Sentry from "@sentry/nextjs";
import { sentryInitOptions } from "@/lib/sentry/options";

const options = sentryInitOptions();
if (options) {
  Sentry.init(options);
}
