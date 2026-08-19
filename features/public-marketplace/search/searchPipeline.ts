import { SearchProperty } from "./data";

export function filterAndSortProperties(source: SearchProperty[], searchParams: Pick<URLSearchParams, "get">) {
  const destination = (searchParams.get("destination") ?? "Madinaty").trim();
  const headerType = (searchParams.get("type") ?? "Studios & Apartments").toLowerCase();
  const selectedTypes = new Set((searchParams.get("propertyTypes") ?? "").split(",").filter(Boolean));
  const amenities = (searchParams.get("amenities") ?? "").split(",").filter(Boolean);
  const bedrooms = searchParams.get("bedrooms");
  const guests = Number(searchParams.get("guests") ?? 1);
  const rating = Number.parseFloat(searchParams.get("rating") ?? "0");

  const filtered = source.filter((property) => {
    const matchesDestination = !destination || destination === "Any location" || property.location === destination || property.area === destination;
    const matchesHeaderType = !headerType || headerType === "all types" || (headerType.includes("hotel") ? property.type === "Hotel" : headerType.includes("studio") || headerType.includes("apartment") ? property.type !== "Hotel" : true);
    const matchesTypes = selectedTypes.size === 0 || selectedTypes.has(property.type);
    const matchesAmenities = amenities.every((amenity) => property.amenities.includes(amenity));
    const matchesBedrooms = !bedrooms || bedrooms === "Any" || (bedrooms === "4+" ? property.bedrooms >= 4 : property.bedrooms === Number(bedrooms));
    const matchesGuests = !Number.isFinite(guests) || property.guestCapacity >= guests;
    const matchesRating = !rating || property.ratingValue >= rating;
    const matchesInstant = searchParams.get("instant") !== "true" || property.instantBooking;
    const matchesCancellation = searchParams.get("freeCancellation") !== "true" || property.freeCancellation;
    const matchesVerified = searchParams.get("verified") !== "true" || property.verified;
    return matchesDestination && matchesHeaderType && matchesTypes && matchesAmenities && matchesBedrooms && matchesGuests && matchesRating && matchesInstant && matchesCancellation && matchesVerified;
  });

  switch (searchParams.get("sort")) {
    case "price-asc": return [...filtered].sort((a, b) => a.priceValue - b.priceValue);
    case "price-desc": return [...filtered].sort((a, b) => b.priceValue - a.priceValue);
    case "rating": return [...filtered].sort((a, b) => b.ratingValue - a.ratingValue);
    default: return filtered;
  }
}
