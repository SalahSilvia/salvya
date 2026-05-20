import { isSentryRuntimeEnabled, sentryInitOptions } from "@/lib/sentry/options";

type RouterTransitionHandler = typeof import("@sentry/nextjs").captureRouterTransitionStart;

let captureRouterTransitionStart: RouterTransitionHandler | null = null;

if (isSentryRuntimeEnabled()) {
  void import("@sentry/nextjs").then((Sentry) => {
    const options = sentryInitOptions();
    if (options) {
      Sentry.init(options);
      captureRouterTransitionStart = Sentry.captureRouterTransitionStart;
    }
  });
}

export const onRouterTransitionStart: RouterTransitionHandler = (...args) => {
  captureRouterTransitionStart?.(...args);
};
