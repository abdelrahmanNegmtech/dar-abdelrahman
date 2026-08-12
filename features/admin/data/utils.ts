import "server-only";

export function formatCurrencyMinor(amountMinor: number | null | undefined, currencyCode = "EGP") {
  return `${currencyCode} ${Math.round((amountMinor ?? 0) / 100).toLocaleString("en-US")}`;
}

export function formatNumber(value: number) {
  return value.toLocaleString("en-US");
}

export function formatPercent(value: number, digits = 1) {
  return `${value.toFixed(digits)}%`;
}

export function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

export function formatShortDateTime(value: string | null | undefined) {
  if (!value) {
    return "Unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(new Date(value));
}

export function formatLongDateTime(value: string | null | undefined) {
  if (!value) {
    return "Unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDateRangeLabel(checkIn: string, checkOut: string) {
  return `${formatShortDate(checkIn)} - ${formatShortDate(checkOut)}`;
}

export function diffNights(checkIn: string, checkOut: string) {
  const ms = new Date(`${checkOut}T12:00:00Z`).getTime() - new Date(`${checkIn}T12:00:00Z`).getTime();
  return Math.max(1, Math.round(ms / 86_400_000));
}

export function paymentMethodLabel(reference: string | null | undefined) {
  const normalized = (reference ?? "").toLowerCase();

  if (normalized.startsWith("instapay-")) return "InstaPay";
  if (normalized.startsWith("vodafone-")) return "Vodafone Cash";
  if (normalized.startsWith("bank-")) return "Bank transfer";
  if (normalized.startsWith("fawry-")) return "Fawry";
  if (normalized.startsWith("paymob-")) return "Paymob / Accept";
  if (normalized.startsWith("meeza-")) return "Meeza Card";
  if (normalized.startsWith("cc-") || normalized.startsWith("card-")) return "Card";
  return "Manual review";
}

export function mapOverviewThumbnailKey(city: string) {
  const normalized = city.toLowerCase();

  if (normalized.includes("zamalek")) return "zamalek" as const;
  if (normalized.includes("maadi")) return "maadi" as const;
  if (normalized.includes("sokhna")) return "sokhna" as const;
  return "new-cairo" as const;
}

export function mapPropertyThumbnailKey(slug: string, propertyType: string) {
  if (propertyType === "hotel") return "hotel" as const;
  if (slug.includes("madinaty")) return "madinaty" as const;
  if (slug.includes("noor")) return "balcony" as const;
  if (slug.includes("serviced")) return "serviced" as const;
  return "modern" as const;
}

export function mapReviewAverageLabel(rating: number | null | undefined, reviewCount: number) {
  if (!rating || reviewCount === 0) {
    return "No reviews yet";
  }

  return `${rating.toFixed(1)} (${reviewCount} reviews)`;
}
