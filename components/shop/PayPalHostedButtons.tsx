"use client";

import type { PayPalButtonsOptions, PayPalOnApproveActions, PayPalOrderActions } from "@/paypal-js-sdk";
import { extractPayPalCaptureIdFromClientDetails } from "@/lib/paypal/client-capture";
import { useEffect, useId, useRef, useState } from "react";

export type PayPalApprovalResult = {
  paypalOrderId?: string;
  paypalCaptureId?: string;
};

type PayPalUiState = "idle" | "creating" | "capturing" | "done" | "error" | "cancelled";

type Props = {
  clientId: string;
  currencyCode: string;
  value: string;
  onApproved: (result: PayPalApprovalResult) => void;
  onError?: (message: string) => void;
  onCancel?: () => void;
  /** Only one funding source so PayPal does not render duplicate wallet + card stacks. */
  funding: "paypal" | "card";
  /** Server-created PayPal order id (preferred). When omitted, falls back to client createOrder. */
  createOrder?: () => Promise<string>;
  disabled?: boolean;
};

type PayPalWindowSdk = NonNullable<Window["paypal"]>;

function isPayPalButtonsReady(p: unknown): p is PayPalWindowSdk {
  return typeof p === "object" && p !== null && typeof (p as PayPalWindowSdk).Buttons === "function";
}

function waitForPayPalButtons(destroyed: () => boolean, done: () => void): () => void {
  let tries = 0;
  const id = window.setInterval(() => {
    tries += 1;
    if (destroyed()) {
      window.clearInterval(id);
      return;
    }
    if (isPayPalButtonsReady(window.paypal)) {
      window.clearInterval(id);
      done();
      return;
    }
    if (tries >= 120) window.clearInterval(id);
  }, 40);
  return () => window.clearInterval(id);
}

function statusMessage(state: PayPalUiState, funding: "paypal" | "card"): string | null {
  switch (state) {
    case "creating":
      return "Starting secure PayPal checkout…";
    case "capturing":
      return "Confirming your payment…";
    case "done":
      return "Payment received — continuing…";
    case "cancelled":
      return "Payment cancelled. You can try again when ready.";
    case "error":
      return null;
    default:
      return funding === "card"
        ? "Pay with Visa or Mastercard via PayPal (guest checkout)."
        : "Pay with your PayPal balance or linked account.";
  }
}

export function PayPalHostedButtons({
  clientId,
  currencyCode,
  value,
  onApproved,
  onError,
  onCancel,
  funding,
  createOrder,
  disabled = false,
}: Props) {
  const reactId = useId().replace(/:/g, "");
  const containerId = `paypal-btn-${reactId}`;
  const destroyed = useRef(false);
  const onApprovedRef = useRef(onApproved);
  const onErrorRef = useRef(onError);
  const onCancelRef = useRef(onCancel);
  const createOrderRef = useRef(createOrder);
  const setUiStateRef = useRef<(s: PayPalUiState) => void>(() => {});
  const approvedOnceRef = useRef(false);
  const createOrderFailedRef = useRef(false);
  const userCancelledRef = useRef(false);
  const cancelResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [uiState, setUiState] = useState<PayPalUiState>("idle");
  const [errorText, setErrorText] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    onApprovedRef.current = onApproved;
    onErrorRef.current = onError;
    onCancelRef.current = onCancel;
    createOrderRef.current = createOrder;
    setUiStateRef.current = setUiState;
  }, [onApproved, onError, onCancel, createOrder]);

  useEffect(() => {
    destroyed.current = false;
    approvedOnceRef.current = false;
    if (!clientId.trim()) return undefined;

    const container = document.getElementById(containerId);
    if (!container) return undefined;
    container.innerHTML = "";
    setSdkReady(false);

    let cancelWait: (() => void) | undefined;
    let buttonsInstance: { close?: () => void } | null = null;

    const renderInner = () => {
      if (destroyed.current) return;
      const paypal = window.paypal;
      if (!isPayPalButtonsReady(paypal)) return;

      setSdkReady(true);
      const payPalFunding = paypal.FUNDING?.PAYPAL;
      const cardFunding = paypal.FUNDING?.CARD;
      const fundingSource = funding === "card" ? cardFunding ?? payPalFunding : payPalFunding ?? cardFunding;

      const fail = (message: string) => {
        createOrderFailedRef.current = true;
        setUiStateRef.current("error");
        if (onErrorRef.current) {
          onErrorRef.current(message);
          setErrorText(null);
        } else {
          setErrorText(message);
        }
      };

      const opts: PayPalButtonsOptions = {
        style: {
          layout: "vertical",
          shape: "rect",
          color: funding === "card" ? "black" : "gold",
          label: funding === "card" ? "pay" : "paypal",
        },
        createOrder: (_data: unknown, actions: PayPalOrderActions) => {
          createOrderFailedRef.current = false;
          userCancelledRef.current = false;
          setUiStateRef.current("creating");
          setErrorText(null);
          const settleCreated = (orderId: string) => {
            setUiStateRef.current("idle");
            return orderId;
          };
          const serverCreate = createOrderRef.current;
          if (serverCreate) {
            return serverCreate()
              .then(settleCreated)
              .catch((e: unknown) => {
                const msg = e instanceof Error ? e.message : "Could not start PayPal checkout";
                fail(msg);
                return Promise.reject(new Error(msg));
              });
          }
          return actions.order
            .create({
              intent: "CAPTURE",
              purchase_units: [{ amount: { currency_code: currencyCode, value } }],
            })
            .then(settleCreated);
        },
        onApprove: (data: unknown, actions: PayPalOnApproveActions) => {
          setUiStateRef.current("capturing");
          return Promise.resolve(actions.order?.capture())
            .then((details) => {
              const orderID =
                typeof data === "object" && data !== null && "orderID" in data && typeof (data as { orderID: unknown }).orderID === "string"
                  ? (data as { orderID: string }).orderID
                  : undefined;
              const paypalCaptureId = extractPayPalCaptureIdFromClientDetails(details);
              if (!orderID) {
                fail("PayPal did not return an order reference. Please try again.");
                return;
              }
              setUiStateRef.current("done");
              if (!destroyed.current) {
                onApprovedRef.current({ paypalOrderId: orderID, paypalCaptureId });
              }
            })
            .catch(() => {
              fail("PayPal could not complete the capture. Please try again.");
            });
        },
        onCancel: () => {
          userCancelledRef.current = true;
          createOrderFailedRef.current = false;
          setUiStateRef.current("cancelled");
          setErrorText(null);
          onCancelRef.current?.();
          if (cancelResetTimerRef.current) clearTimeout(cancelResetTimerRef.current);
          cancelResetTimerRef.current = setTimeout(() => {
            if (!destroyed.current && userCancelledRef.current) {
              userCancelledRef.current = false;
              setUiStateRef.current("idle");
            }
          }, 6000);
        },
        onError: () => {
          // PayPal often fires onError after the payer closes the popup; onCancel may run in the same tick.
          window.setTimeout(() => {
            if (destroyed.current || userCancelledRef.current || createOrderFailedRef.current) return;
            fail("PayPal encountered an error. Please try again.");
          }, 150);
        },
        ...(fundingSource ? { fundingSource } : {}),
      };

      paypal
        .Buttons(opts)
        .render(`#${containerId}`)
        .then((instance) => {
          buttonsInstance = instance as { close?: () => void };
        })
        .catch(() => {
          /* render race */
        });
    };

    const scheduleRender = () => {
      cancelWait?.();
      cancelWait = waitForPayPalButtons(
        () => destroyed.current,
        () => renderInner(),
      );
    };

    const src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${encodeURIComponent(currencyCode)}&disable-funding=venmo`;
    const existing = document.querySelector<HTMLScriptElement>(`script[data-salvya-paypal-sdk="1"]`);

    if (existing) {
      const prevCurrency = existing.dataset.salvyaPaypalCurrency ?? "";
      const prevClient = existing.dataset.salvyaPaypalClient ?? "";
      if (prevCurrency !== currencyCode || prevClient !== clientId) {
        existing.remove();
      }
    }

    const existingAfter = document.querySelector<HTMLScriptElement>(`script[data-salvya-paypal-sdk="1"]`);

    if (existingAfter) {
      if (isPayPalButtonsReady(window.paypal)) {
        scheduleRender();
      } else {
        existingAfter.addEventListener("load", scheduleRender, { once: true });
      }
    } else {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.dataset.salvyaPaypalSdk = "1";
      script.dataset.salvyaPaypalCurrency = currencyCode;
      script.dataset.salvyaPaypalClient = clientId;
      script.onload = () => scheduleRender();
      document.body.appendChild(script);
    }

    return () => {
      destroyed.current = true;
      if (cancelResetTimerRef.current) clearTimeout(cancelResetTimerRef.current);
      cancelWait?.();
      buttonsInstance?.close?.();
      container.innerHTML = "";
    };
  }, [clientId, containerId, currencyCode, funding, value]);

  /** Only block the button host while capturing — card fields render inline after createOrder. */
  const busy = uiState === "capturing" || uiState === "done";
  const status = statusMessage(uiState, funding);

  if (!clientId.trim()) {
    return (
      <div className="space-y-2 rounded-lg border border-amber-200/80 bg-amber-50 px-3 py-2.5 text-[12px] leading-relaxed text-amber-900">
        <p>
          PayPal buttons need <span className="font-mono text-[11px]">NEXT_PUBLIC_PAYPAL_CLIENT_ID</span> in your env file.
          Restart <span className="font-mono text-[10px]">npm run dev</span> after saving. Never put{" "}
          <span className="font-mono text-[10px]">PAYPAL_CLIENT_SECRET</span> in the browser.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {status ? (
        <p
          className={`text-[12px] leading-relaxed ${
            uiState === "cancelled" ? "text-amber-800" : uiState === "done" ? "text-emerald-800" : "text-slate-600"
          }`}
          role="status"
          aria-live="polite"
        >
          {status}
        </p>
      ) : null}
      {errorText ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-900" role="alert">
          {errorText}
        </p>
      ) : null}
      {!sdkReady ? (
        <div className="flex min-h-[48px] items-center justify-center rounded-lg border border-slate-200 bg-white text-[12px] text-slate-500">
          Loading PayPal…
        </div>
      ) : null}
      <div
        id={containerId}
        className={`min-h-[48px] w-full max-w-md [&_.paypal-buttons]:max-w-md ${disabled || busy ? "pointer-events-none opacity-60" : ""}`}
        aria-busy={busy}
      />
    </div>
  );
}
