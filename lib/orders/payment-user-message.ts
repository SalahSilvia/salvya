/** Map API / verification codes to shopper-friendly copy. */
export function paymentErrorMessage(error: string, code?: string): string {
  switch (code) {
    case "rate_limited":
      return "Too many attempts. Please wait a minute and try again.";
    case "checkout_expired":
      return "Your checkout session expired. Start again from the product page.";
    case "amount_mismatch":
    case "currency_mismatch":
      return "The PayPal amount did not match your cart. Go back to payment and try again — your card was not charged twice if you see a pending hold.";
    case "not_completed":
      return "PayPal did not complete this payment. Return to payment and try again.";
    case "capture_mismatch":
    case "missing_capture":
      return "We could not confirm your PayPal capture. Return to payment and complete checkout again.";
    case "paypal_api_error":
      return "PayPal is temporarily unavailable. Wait a moment, then try again.";
    case "duplicate_payment":
      return "This PayPal payment was already used for an order. Check your email for confirmation.";
    case "invalid_discount":
      return error || "This promo code is not valid for your order.";
    case "out_of_stock":
      return "This size is sold out. Go back and pick another size or color.";
    case "network":
      return "Connection issue — check your internet and try again.";
    case "payment_failed":
      return "Payment could not be completed. Return to payment and try again.";
    default:
      break;
  }

  if (/already processed|already applied/i.test(error)) {
    return error;
  }
  if (/not configured/i.test(error)) {
    return "Online payment is temporarily unavailable. Try cash on delivery if you are in Morocco, or contact support@salvyastore.com.";
  }
  if (/network/i.test(error)) {
    return "Connection issue — check your internet and try again.";
  }

  return error || "Could not complete your order. Please try again.";
}
