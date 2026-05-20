import type { ShippingCarrierId } from "@/lib/admin/shipping-carriers";
import { isShippingCarrierId } from "@/lib/admin/shipping-carriers";

/** Build a carrier tracking page URL from ID + tracking number (best-effort). */
export function buildCarrierTrackingUrl(carrier: string, trackingNumber: string): string | null {
  const id = trackingNumber.trim();
  if (!id) return null;
  const enc = encodeURIComponent(id);
  const c = isShippingCarrierId(carrier) ? carrier : "other";

  switch (c as ShippingCarrierId) {
    case "dhl":
      return `https://www.dhl.com/global-en/home/tracking/tracking-express.html?submit=1&tracking-id=${enc}`;
    case "ups":
      return `https://www.ups.com/track?tracknum=${enc}`;
    case "fedex":
      return `https://www.fedex.com/fedextrack/?trknbr=${enc}`;
    case "colissimo":
      return `https://www.laposte.fr/outils/suivre-vos-envois?code=${enc}`;
    case "aramex":
      return `https://www.aramex.com/track/results?ShipmentNumber=${enc}`;
    case "gls":
      return `https://gls-group.com/FR/en/parcel-tracking?match=${enc}`;
    default:
      return null;
  }
}
