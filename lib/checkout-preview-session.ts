export type CheckoutDetailsSessionV1 = {
  v: 1;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  /** ISO 3166-1 alpha-2 (e.g. MA, FR, GB, US). Legacy sessions may still use INT. */
  buyerCountry: string;
  buyerCity: string;
  buyerAddress: string;
  /** Saved address row used for this checkout (signed-in users only). */
  savedAddressId?: string;
  /** Set on the payment step before continuing. */
  paymentMethod?: "cod" | "paypal";
  /** PayPal wallet vs guest card (both use `paymentMethod: "paypal"`). */
  paymentInstrument?: "paypal_wallet" | "paypal_card";
  /** Idempotency key — set on payment step before confirm. */
  placementKey?: string;
  /** PayPal order id after successful approval. */
  paypalOrderId?: string;
  /** PayPal capture id after client capture (verified server-side). */
  paypalCaptureId?: string;
  /** Set after confirm places the order in Salvya. */
  orderNumber?: string;
  /** Applied promo code (payment step). */
  couponCode?: string;
  couponLabel?: string;
  discountCents?: number;
  savedAt: number;
};

export function checkoutDetailsStorageKey(detailsCheckoutPath: string): string {
  return `salvya-checkout-details-v1:${detailsCheckoutPath}`;
}

export type CheckoutBuyerPayload = Omit<CheckoutDetailsSessionV1, "v" | "savedAt">;

export function saveCheckoutDetailsSession(detailsCheckoutPath: string, payload: CheckoutBuyerPayload): boolean {
  if (typeof window === "undefined") return false;
  try {
    const data: CheckoutDetailsSessionV1 = { v: 1, ...payload, savedAt: Date.now() };
    const key = checkoutDetailsStorageKey(detailsCheckoutPath);
    window.sessionStorage.setItem(key, JSON.stringify(data));
    return window.sessionStorage.getItem(key) !== null;
  } catch {
    return false;
  }
}

export function readCheckoutDetailsSession(detailsCheckoutPath: string): CheckoutDetailsSessionV1 | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(checkoutDetailsStorageKey(detailsCheckoutPath));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CheckoutDetailsSessionV1;
    if (parsed?.v !== 1 || typeof parsed.buyerName !== "string") return null;
    const buyerCountry =
      typeof parsed.buyerCountry === "string" && parsed.buyerCountry.trim() ? parsed.buyerCountry.trim() : "MA";
    return { ...parsed, buyerCountry };
  } catch {
    return null;
  }
}

/** Update session fields without re-entering the contact form (e.g. payment method). */
export function mergeCheckoutDetailsPatch(
  detailsCheckoutPath: string,
  patch: Partial<
    Pick<
      CheckoutDetailsSessionV1,
      | "paymentMethod"
      | "paymentInstrument"
      | "placementKey"
      | "paypalOrderId"
      | "paypalCaptureId"
      | "orderNumber"
      | "savedAddressId"
      | "couponCode"
      | "couponLabel"
      | "discountCents"
    >
  >,
): boolean {
  const cur = readCheckoutDetailsSession(detailsCheckoutPath);
  if (!cur) return false;
  const method = patch.paymentMethod ?? cur.paymentMethod;
  const instrument =
    method === "cod"
      ? undefined
      : "paymentInstrument" in patch
        ? patch.paymentInstrument
        : cur.paymentInstrument;
  const savedAddressId =
    "savedAddressId" in patch ? patch.savedAddressId : cur.savedAddressId;
  return saveCheckoutDetailsSession(detailsCheckoutPath, {
    buyerName: cur.buyerName,
    buyerPhone: cur.buyerPhone,
    buyerEmail: cur.buyerEmail,
    buyerCountry: cur.buyerCountry,
    buyerCity: cur.buyerCity,
    buyerAddress: cur.buyerAddress,
    savedAddressId,
    paymentMethod: method,
    paymentInstrument: instrument,
    placementKey: patch.placementKey ?? cur.placementKey,
    paypalOrderId: patch.paypalOrderId ?? cur.paypalOrderId,
    paypalCaptureId: patch.paypalCaptureId ?? cur.paypalCaptureId,
    orderNumber: patch.orderNumber ?? cur.orderNumber,
    couponCode: patch.couponCode ?? cur.couponCode,
    couponLabel: patch.couponLabel ?? cur.couponLabel,
    discountCents: patch.discountCents ?? cur.discountCents,
  });
}

export function ensureCheckoutPlacementKey(detailsCheckoutPath: string): string | null {
  const cur = readCheckoutDetailsSession(detailsCheckoutPath);
  if (!cur) return null;
  if (cur.placementKey?.trim()) return cur.placementKey.trim();
  const placementKey =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `pk-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  mergeCheckoutDetailsPatch(detailsCheckoutPath, { placementKey });
  return placementKey;
}

/** Human-readable payment line for recap / thank-you screens. */
export function formatCheckoutPaymentLine(
  session: Pick<CheckoutDetailsSessionV1, "paymentMethod" | "paymentInstrument" | "buyerCountry">,
): string {
  if (session.paymentMethod === "cod") {
    return "Cash on delivery — pay the courier when your parcel arrives";
  }
  if (session.paymentMethod === "paypal") {
    if (session.paymentInstrument === "paypal_card") {
      return "Bank card (Visa / Mastercard) — secured by PayPal";
    }
    return "PayPal — balance or linked account";
  }
  return "Online payment";
}
