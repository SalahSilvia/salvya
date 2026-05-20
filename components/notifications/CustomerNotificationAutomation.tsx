"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { readAccountPrefs } from "@/lib/account/preferences-storage";
import {
  CUSTOMER_NOTIFICATION_REQUEST,
  type CustomerNotificationRequest,
  notifyBlogDigest,
  notifyWelcomeBack,
} from "@/lib/notifications/automation";
import { useNotifications } from "@/components/notifications/NotificationsProvider";
import { useSupabaseUser } from "@/components/member/useSupabaseUser";

type Props = {
  onRequest: (payload: CustomerNotificationRequest) => void;
};

function AutomationListener({ onRequest }: Props) {
  useEffect(() => {
    const handler = (e: Event) => {
      if (!readAccountPrefs().notificationsEnabled) return;
      const detail = (e as CustomEvent<CustomerNotificationRequest>).detail;
      if (!detail?.id || !detail.title) return;
      onRequest(detail);
    };
    window.addEventListener(CUSTOMER_NOTIFICATION_REQUEST, handler);
    return () => window.removeEventListener(CUSTOMER_NOTIFICATION_REQUEST, handler);
  }, [onRequest]);

  return null;
}

function RouteAutomation() {
  const pathname = usePathname() ?? "/";
  const welcomedRef = useRef(false);
  const blogRef = useRef(false);

  useEffect(() => {
    if (!readAccountPrefs().notificationsEnabled) return;

    if (pathname.startsWith("/blogs") && !blogRef.current) {
      blogRef.current = true;
      notifyBlogDigest();
    }
  }, [pathname]);

  return null;
}

function WelcomeAutomation() {
  const { user, loading } = useSupabaseUser();
  const { isSignedIn } = useNotifications();
  const doneRef = useRef(false);

  useEffect(() => {
    if (loading || !user || !isSignedIn || doneRef.current) return;
    doneRef.current = true;
    if (!readAccountPrefs().notificationsEnabled) return;
    notifyWelcomeBack();
  }, [loading, user, isSignedIn]);

  return null;
}

export function CustomerNotificationAutomation() {
  const { pushNotification, isSignedIn } = useNotifications();

  if (!isSignedIn) return null;

  return (
    <>
      <AutomationListener onRequest={pushNotification} />
      <RouteAutomation />
      <WelcomeAutomation />
    </>
  );
}
