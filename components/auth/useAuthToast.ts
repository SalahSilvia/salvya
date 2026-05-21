"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AuthToastState } from "@/components/auth/AuthToast";

const AUTO_DISMISS_MS = 4200;

export function useAuthToast() {
  const [toast, setToast] = useState<AuthToastState>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(null);
  }, []);

  const showToast = useCallback(
    (message: string, tone: "success" | "error") => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setToast({ message, tone });
      timerRef.current = setTimeout(() => setToast(null), AUTO_DISMISS_MS);
    },
    [],
  );

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return { toast, showToast, dismissToast: dismiss };
}
