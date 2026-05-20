import type { CustomerAddress } from "@/lib/addresses/types";

/** Maps a saved row into checkout shipping fields (email stays separate). */
export function customerAddressToCheckoutShipping(addr: CustomerAddress): {
  buyerName: string;
  buyerPhone: string;
  buyerCountry: string;
  buyerCity: string;
  buyerAddress: string;
} {
  const tail = [addr.region, addr.postalCode].filter(Boolean).join(" ").trim();
  const lines = [addr.addressLine1, addr.addressLine2, tail].filter(Boolean);
  return {
    buyerName: addr.fullName,
    buyerPhone: addr.phone,
    buyerCountry: addr.country,
    buyerCity: addr.city?.trim() ?? "",
    buyerAddress: lines.join("\n"),
  };
}
