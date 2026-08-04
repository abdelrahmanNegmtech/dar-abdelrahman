import type { CountryOption } from "../data/countries";

export function formatPhoneForDisplay(country: CountryOption, phone: string) {
  const trimmedPhone = phone.trim();

  if (!trimmedPhone) {
    return "";
  }

  if (trimmedPhone.startsWith("+")) {
    return trimmedPhone.replace(/[^\d+]/g, "");
  }

  const nationalNumber = trimmedPhone.replace(/\D/g, "").replace(/^0+/, "");
  const dialingCode = country.dialingCode.replace(/[^\d+]/g, "");

  return nationalNumber ? `${dialingCode}${nationalNumber}` : "";
}
