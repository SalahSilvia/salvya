/** Minimal typings for PayPal JS SDK loaded from https://www.paypal.com/sdk/js */

export type PayPalOrderActions = {
  order: {
    create: (opts: {
      intent?: string;
      purchase_units: Array<{ amount: { currency_code: string; value: string } }>;
    }) => Promise<string>;
  };
};

export type PayPalOnApproveActions = {
  order?: {
    capture: () => Promise<unknown>;
  };
};

export type PayPalButtonsInstance = {
  render: (selector: string) => Promise<unknown>;
  close?: () => void;
};

export type PayPalButtonsOptions = {
  style?: Record<string, string>;
  /** PayPal SDK funding key (e.g. from `paypal.FUNDING.PAYPAL`). */
  fundingSource?: unknown;
  createOrder: (data: unknown, actions: PayPalOrderActions) => Promise<string>;
  onApprove: (data: unknown, actions: PayPalOnApproveActions) => Promise<void>;
  onCancel?: () => void;
  onError?: (err: unknown) => void;
};

declare global {
  interface Window {
    paypal?: {
      Buttons: (options: PayPalButtonsOptions) => PayPalButtonsInstance;
      FUNDING?: { PAYPAL?: string; CARD?: string };
    };
  }
}

export {};
