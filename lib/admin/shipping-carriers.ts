export type ShippingCarrierId =
  | "dhl"
  | "ups"
  | "fedex"
  | "colissimo"
  | "aramex"
  | "gls"
  | "other";

export const SHIPPING_CARRIER_OPTIONS: { id: ShippingCarrierId; label: string }[] = [
  { id: "dhl", label: "DHL" },
  { id: "ups", label: "UPS" },
  { id: "fedex", label: "FedEx" },
  { id: "colissimo", label: "Colissimo / La Poste" },
  { id: "aramex", label: "Aramex" },
  { id: "gls", label: "GLS" },
  { id: "other", label: "Other" },
];

export function isShippingCarrierId(v: string): v is ShippingCarrierId {
  return SHIPPING_CARRIER_OPTIONS.some((c) => c.id === v);
}

export function carrierLabel(id: string | undefined): string {
  if (!id) return "—";
  return SHIPPING_CARRIER_OPTIONS.find((c) => c.id === id)?.label ?? id;
}
