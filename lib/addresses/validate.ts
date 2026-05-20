import type { CreateAddressInput, PatchAddressInput } from "@/lib/addresses/types";

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

export function phoneDigitsOk(phone: string): boolean {
  return phone.replace(/\D/g, "").length >= 8;
}

function normalizeCountry(code: string): string | null {
  const c = code.trim().toUpperCase();
  if (c.length !== 2 || !/^[A-Z]{2}$/.test(c)) return null;
  return c;
}

export function sanitizeCreateAddressBody(body: unknown): CreateAddressInput | null {
  if (!isRecord(body)) return null;
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const addressLine1 = typeof body.addressLine1 === "string" ? body.addressLine1.trim() : "";
  const countryRaw = typeof body.country === "string" ? body.country.trim() : "";
  const country = normalizeCountry(countryRaw.length === 2 ? countryRaw : countryRaw);
  if (!fullName || !phoneDigitsOk(phone) || !addressLine1 || !country) return null;

  const addressLine2 =
    typeof body.addressLine2 === "string" && body.addressLine2.trim() ? body.addressLine2.trim() : null;
  const city = typeof body.city === "string" && body.city.trim() ? body.city.trim() : null;
  const region = typeof body.region === "string" && body.region.trim() ? body.region.trim() : null;
  const postalCode =
    typeof body.postalCode === "string" && body.postalCode.trim() ? body.postalCode.trim() : null;
  const isDefault = body.isDefault === true;

  return {
    fullName,
    phone,
    addressLine1,
    addressLine2,
    city,
    region,
    postalCode,
    country,
    isDefault,
  };
}

export function sanitizePatchAddressBody(body: unknown): PatchAddressInput | null {
  if (!isRecord(body)) return null;
  const patch: PatchAddressInput = {};

  if ("fullName" in body) {
    if (typeof body.fullName !== "string" || !body.fullName.trim()) return null;
    patch.fullName = body.fullName.trim();
  }
  if ("phone" in body) {
    if (typeof body.phone !== "string" || !phoneDigitsOk(body.phone.trim())) return null;
    patch.phone = body.phone.trim();
  }
  if ("addressLine1" in body) {
    if (typeof body.addressLine1 !== "string" || !body.addressLine1.trim()) return null;
    patch.addressLine1 = body.addressLine1.trim();
  }
  if ("addressLine2" in body) {
    patch.addressLine2 =
      typeof body.addressLine2 === "string" && body.addressLine2.trim() ? body.addressLine2.trim() : null;
  }
  if ("city" in body) {
    patch.city = typeof body.city === "string" && body.city.trim() ? body.city.trim() : null;
  }
  if ("region" in body) {
    patch.region = typeof body.region === "string" && body.region.trim() ? body.region.trim() : null;
  }
  if ("postalCode" in body) {
    patch.postalCode =
      typeof body.postalCode === "string" && body.postalCode.trim() ? body.postalCode.trim() : null;
  }
  if ("country" in body) {
    const countryRaw = typeof body.country === "string" ? body.country.trim() : "";
    const country = normalizeCountry(countryRaw.length === 2 ? countryRaw : countryRaw);
    if (!country) return null;
    patch.country = country;
  }
  if ("isDefault" in body) {
    if (body.isDefault !== true && body.isDefault !== false) return null;
    patch.isDefault = body.isDefault;
  }

  if (Object.keys(patch).length === 0) return null;
  return patch;
}
