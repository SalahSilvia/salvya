export const CART_CHANGED_EVENT = "salvya-cart-changed";

export function dispatchCartChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CART_CHANGED_EVENT));
}

export function subscribeCart(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const onCustom = () => onChange();
  const onStorage = (e: StorageEvent) => {
    if (!e.key) return;
    if (e.key.startsWith("salvya-cart-") || e.key === "salvya-preview-bag-v1") onChange();
  };
  window.addEventListener(CART_CHANGED_EVENT, onCustom);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CART_CHANGED_EVENT, onCustom);
    window.removeEventListener("storage", onStorage);
  };
}
