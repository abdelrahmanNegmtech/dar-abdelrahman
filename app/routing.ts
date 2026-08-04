export const defaultLocale = "en";

export function localePrefix(locale = defaultLocale) {
  return `/${locale || defaultLocale}`;
}

export function shortPath(path: string, locale = defaultLocale) {
  void locale;
  return path;
}

export function appendQuery(path: string, query?: string) {
  return query ? `${path}?${query}` : path;
}

export function compactBookingQuery({
  property,
  hotel,
  checkIn,
  checkOut,
  guests,
  nights,
  locale,
  city,
}: {
  property?: string;
  hotel?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: string | number;
  nights?: string | number;
  locale?: string;
  city?: string;
}) {
  const params = new URLSearchParams();
  if (property) params.set("property", property);
  if (hotel) params.set("hotel", hotel);
  if (city && city !== "All") params.set("city", city);
  if (checkIn) params.set("checkIn", checkIn);
  if (checkOut) params.set("checkOut", checkOut);
  if (guests) params.set("guests", String(guests));
  if (nights) params.set("nights", String(nights));
  if (locale) params.set("locale", locale);
  return params.toString();
}

export function readParam(params: Record<string, string | string[] | undefined>, shortKey: string, longKey: string) {
  const shortValue = params[shortKey];
  const longValue = params[longKey];
  const value = shortValue ?? longValue;
  return Array.isArray(value) ? value[0] : value;
}

export function readSearchParam(params: URLSearchParams, shortKey: string, longKey: string) {
  return params.get(shortKey) ?? params.get(longKey);
}
