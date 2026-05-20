"use client";

import type { ReactNode } from "react";
import { Suspense } from "react";
import { NextIntlClientProvider } from "next-intl";
import { SalvyaAnalyticsRoot } from "@/components/analytics/SalvyaAnalyticsRoot";
import { CookieConsentBanner } from "@/components/cookies/CookieConsentBanner";
import { PostAuthNoticeBar } from "@/components/auth/PostAuthNoticeBar";
import { GuestEngagementProvider } from "@/components/auth/GuestEngagementProvider";
import { PendingEngagementExecutor } from "@/components/auth/PendingEngagementExecutor";
import { ArtistFollowsProvider } from "@/components/artist/ArtistFollowsProvider";
import { BagProvider } from "@/components/cart/BagProvider";
import { LikesProvider } from "@/components/likes/LikesProvider";
import { NotificationsProvider } from "@/components/notifications/NotificationsProvider";
import { MenuNavigationRecorder } from "@/components/layout/menu/MenuNavigationRecorder";
import { CreatorReferralCapture } from "@/components/creator/CreatorReferralCapture";
import { GeoLocaleSuggestion } from "@/components/geo/GeoLocaleSuggestion";
import { RegionalLocaleBootstrap } from "@/components/geo/RegionalLocaleBootstrap";
import { RegionalPreferencesBootstrap } from "@/components/geo/RegionalPreferencesBootstrap";
import { RegionalPreferencesProvider } from "@/components/geo/RegionalPreferencesProvider";
import type { AppLocale } from "@/i18n/routing";
import type { RegionalPreferencesSnapshot } from "@/lib/geo/preferences";

type Props = {
  children: ReactNode;
  locale: AppLocale;
  messages: Record<string, unknown>;
  regionalPrefs: RegionalPreferencesSnapshot;
  acceptLanguage: string | null;
};

/** Shared providers for locale tree — no navigation chrome. */
export function LocaleProviders({ children, locale, messages, regionalPrefs, acceptLanguage }: Props) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="Africa/Casablanca">
      <RegionalPreferencesProvider initial={regionalPrefs}>
        <RegionalPreferencesBootstrap />
        <RegionalLocaleBootstrap bootstrapLocale={regionalPrefs.bootstrapLocale} />
        <LikesProvider>
          <ArtistFollowsProvider>
            <GuestEngagementProvider>
              <BagProvider>
                <NotificationsProvider>
                  <PostAuthNoticeBar />
                  <PendingEngagementExecutor />
                  <MenuNavigationRecorder />
                  <Suspense fallback={null}>
                    <SalvyaAnalyticsRoot />
                  </Suspense>
                  <Suspense fallback={null}>
                    <CreatorReferralCapture />
                  </Suspense>
                  <CookieConsentBanner />
                  <GeoLocaleSuggestion
                    initialSnapshot={regionalPrefs}
                    acceptLanguage={acceptLanguage}
                  />
                  {children}
                </NotificationsProvider>
              </BagProvider>
            </GuestEngagementProvider>
          </ArtistFollowsProvider>
        </LikesProvider>
      </RegionalPreferencesProvider>
    </NextIntlClientProvider>
  );
}
