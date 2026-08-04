export type HotelRoom = {
  id: string;
  name: string;
  size: number;
  capacity: number;
  bedType: string;
  pricePerNight: number;
  images: string[];
  description: string;
  amenities: string[];
  highlights: string[];
  cancellationPolicy: string;
  available: boolean;
  badge?: string;
  roomsLeft?: number;
  included?: string[];
};

export type HotelListing = {
  slug: string;
  title: string;
  location: string;
  address: string;
  rating: number;
  reviews: number;
  image: string;
  gallery: string[];
  detailsPath: string;
  description: string;
  amenities: string[];
  services: Array<{ label: string; icon: string }>;
  checkInTime: string;
  checkOutTime: string;
  roomCount: number;
  roomTypeCount: number;
  confirmationType: string;
  taxRate: number;
  coordinates: { lat: number; lng: number; label: string };
  policies: Array<{ title: string; description: string; tone: "green" | "purple" | "red" }>;
  reviewsSummary: {
    score: number;
    categories: Array<{ label: string; value: number }>;
    comments: Array<{ name: string; location: string; rating: number; text: string }>;
  };
  attractions: Array<{ label: string; distance: string }>;
  rooms: HotelRoom[];
};

const sharedRooms: HotelRoom[] = [
  {
    id: "deluxe-king-room",
    name: "Deluxe King Room",
    size: 32,
    capacity: 2,
    bedType: "1 king bed",
    pricePerNight: 3400,
    images: ["/properties/madinty-bedroom.png", "/properties/madinty-living.png", "/properties/new-capital-terrace.png"],
    description: "Elegant king room with a city view, premium bedding, work desk, and breakfast included.",
    amenities: ["City view", "Free Wi-Fi", "Air conditioning", "Breakfast"],
    highlights: ["Breakfast included", "Free cancellation", "City view", "Premium bedding"],
    cancellationPolicy: "Free cancellation",
    available: true,
    roomsLeft: 3,
    included: ["Breakfast included", "Free cancellation"],
  },
  {
    id: "twin-room",
    name: "Twin Room",
    size: 30,
    capacity: 2,
    bedType: "2 single beds",
    pricePerNight: 3100,
    images: ["/properties/new-capital-studio.png", "/properties/madina-nour-kitchen.png", "/properties/madinty-bedroom.png"],
    description: "Comfortable twin room for friends or business travelers with fast Wi-Fi and city outlook.",
    amenities: ["City view", "Free Wi-Fi", "TV", "Workspace"],
    highlights: ["Breakfast included", "Non-refundable", "Workspace"],
    cancellationPolicy: "Non-refundable",
    available: true,
    roomsLeft: 5,
    included: ["Breakfast included", "Non-refundable"],
  },
  {
    id: "executive-suite",
    name: "Executive Suite",
    size: 52,
    capacity: 2,
    bedType: "1 king bed + lounge",
    pricePerNight: 5800,
    images: ["/properties/madina-nour-duplex.png", "/properties/new-capital-terrace.png", "/properties/madinty-living.png"],
    description: "Spacious suite with lounge access, separate living space, and refined city views.",
    amenities: ["Lounge access", "Free Wi-Fi", "Bathtub", "City view"],
    highlights: ["Lounge access", "Free cancellation", "Separate living area"],
    cancellationPolicy: "Free cancellation",
    available: true,
    roomsLeft: 2,
    included: ["Lounge access", "Free cancellation"],
  },
  {
    id: "family-room",
    name: "Family Room",
    size: 48,
    capacity: 4,
    bedType: "1 king bed + 2 single beds",
    pricePerNight: 4900,
    images: ["/properties/madina-nour-duplex.png", "/properties/madinty-living.png", "/properties/madinty-bedroom.png"],
    description: "Family-friendly room with flexible bedding, breakfast, and space for up to four guests.",
    amenities: ["Family space", "Free Wi-Fi", "Breakfast", "City view"],
    highlights: ["Breakfast included", "Free cancellation", "Family layout"],
    cancellationPolicy: "Free cancellation",
    available: true,
    roomsLeft: 1,
    included: ["Breakfast included", "Free cancellation"],
  },
];

const defaultPolicies: HotelListing["policies"] = [
  { title: "Cancellation policy", description: "Free cancellation up to 48 hours before check-in on selected rooms.", tone: "green" },
  { title: "Child policy", description: "Children of all ages are welcome. Extra bed available upon request.", tone: "purple" },
  { title: "ID requirement", description: "Valid ID or passport required at check-in for all guests.", tone: "purple" },
  { title: "Pets", description: "Pets are not allowed in the hotel.", tone: "red" },
];

const defaultReviews: HotelListing["reviewsSummary"] = {
  score: 4.8,
  categories: [
    { label: "Cleanliness", value: 4.9 },
    { label: "Location", value: 4.8 },
    { label: "Staff", value: 4.9 },
    { label: "Comfort", value: 4.8 },
    { label: "Value for money", value: 4.7 },
  ],
  comments: [
    { name: "Ahmed M.", location: "Cairo, Egypt", rating: 5, text: "Excellent stay! The rooftop pool and city view were amazing." },
    { name: "Sarah K.", location: "Alexandria, Egypt", rating: 5, text: "Beautiful hotel, very clean and modern. Breakfast had great variety." },
    { name: "Michael T.", location: "Dubai, UAE", rating: 5, text: "Great business hotel with all the amenities you need." },
  ],
};

export const hotelListings: HotelListing[] = [
  {
    slug: "grand-horizon-hotel-new-capital",
    title: "Grand Horizon Hotel New Capital",
    location: "New Capital, Cairo, Egypt",
    address: "R7, New Capital, Cairo, Egypt",
    rating: 4.8,
    reviews: 426,
    image: "/properties/new-capital-terrace.png",
    gallery: [
      "/properties/new-capital-terrace.png",
      "/properties/madina-nour-duplex.png",
      "/properties/madinty-bedroom.png",
      "/properties/madinty-living.png",
      "/properties/madina-nour-kitchen.png",
    ],
    detailsPath: "/hotels/grand-horizon-hotel-new-capital",
    description:
      "Grand Horizon Hotel New Capital offers a refined stay in the heart of Egypt's new business hub. Enjoy elegant rooms with city views, a rooftop pool, multiple dining options, and dedicated business facilities. Perfect for both leisure and business travelers.",
    amenities: ["Outdoor pool", "Gym", "Spa", "Restaurant", "Room service", "Parking", "Meeting rooms", "Wi-Fi", "Laundry", "Concierge"],
    services: [
      { label: "Rooftop pool", icon: "pool" },
      { label: "Free Wi-Fi", icon: "wifi" },
      { label: "Breakfast included", icon: "restaurant" },
      { label: "24/7 reception", icon: "reception" },
      { label: "Airport transfer", icon: "transfer" },
      { label: "Gym", icon: "gym" },
      { label: "Spa", icon: "spa" },
      { label: "Family friendly", icon: "family" },
      { label: "Business center", icon: "business" },
    ],
    checkInTime: "after 3:00 PM",
    checkOutTime: "before 12:00 PM",
    roomCount: 126,
    roomTypeCount: 18,
    confirmationType: "Instant confirmation",
    taxRate: 0.053,
    coordinates: { lat: 30.0131, lng: 31.7219, label: "New Capital" },
    policies: defaultPolicies,
    reviewsSummary: defaultReviews,
    attractions: [
      { label: "Business District", distance: "2 min drive" },
      { label: "Open Air Mall", distance: "7 min drive" },
      { label: "Egypt International Airport", distance: "25 min drive" },
      { label: "Convention Center", distance: "5 min drive" },
    ],
    rooms: sharedRooms,
  },
  {
    slug: "madinty-grand-hotel",
    title: "Madinty Grand Hotel",
    location: "Madinty",
    address: "B6, Madinty, Cairo, Egypt",
    rating: 4.8,
    reviews: 146,
    image: "/properties/madinty-living.png",
    gallery: ["/properties/madinty-living.png", "/properties/madinty-bedroom.png", "/properties/madina-nour-kitchen.png", "/properties/new-capital-studio.png", "/properties/madina-nour-duplex.png"],
    detailsPath: "/hotels/madinty-grand-hotel",
    description: "A calm city hotel in Madinty with bright rooms, family-friendly service, and easy access to dining, parks, and business services.",
    amenities: ["Outdoor pool", "Gym", "Restaurant", "Parking", "Wi-Fi", "Concierge"],
    services: [
      { label: "Outdoor pool", icon: "pool" },
      { label: "Gym", icon: "gym" },
      { label: "Restaurant", icon: "restaurant" },
      { label: "Parking", icon: "parking" },
      { label: "Wi-Fi", icon: "wifi" },
      { label: "Concierge", icon: "reception" },
    ],
    checkInTime: "after 3:00 PM",
    checkOutTime: "before 12:00 PM",
    roomCount: 88,
    roomTypeCount: 12,
    confirmationType: "Instant confirmation",
    taxRate: 0.053,
    coordinates: { lat: 30.091, lng: 31.637, label: "Madinty" },
    policies: defaultPolicies,
    reviewsSummary: defaultReviews,
    attractions: [
      { label: "South Park", distance: "4 min drive" },
      { label: "Open Air Mall", distance: "6 min drive" },
      { label: "Food court", distance: "5 min drive" },
      { label: "Business services", distance: "8 min drive" },
    ],
    rooms: sharedRooms.map((room) => ({ ...room, pricePerNight: Math.max(room.pricePerNight - 400, 1900) })),
  },
  {
    slug: "new-capital-business-hotel",
    title: "New Capital Business Hotel",
    location: "New Administrative Capital",
    address: "R8, New Administrative Capital, Egypt",
    rating: 4.74,
    reviews: 92,
    image: "/properties/new-capital-studio.png",
    gallery: ["/properties/new-capital-studio.png", "/properties/new-capital-terrace.png", "/properties/madina-nour-duplex.png", "/properties/madinty-bedroom.png", "/properties/madina-nour-kitchen.png"],
    detailsPath: "/hotels/new-capital-business-hotel",
    description: "A modern business hotel near government and conference districts with efficient service, meeting facilities, and flexible rooms.",
    amenities: ["Meeting rooms", "Wi-Fi", "Restaurant", "Gym", "Laundry", "Concierge"],
    services: [
      { label: "Meeting rooms", icon: "business" },
      { label: "Free Wi-Fi", icon: "wifi" },
      { label: "Restaurant", icon: "restaurant" },
      { label: "Gym", icon: "gym" },
      { label: "Laundry", icon: "laundry" },
      { label: "Concierge", icon: "reception" },
    ],
    checkInTime: "after 3:00 PM",
    checkOutTime: "before 12:00 PM",
    roomCount: 102,
    roomTypeCount: 14,
    confirmationType: "Instant confirmation",
    taxRate: 0.053,
    coordinates: { lat: 30.027, lng: 31.746, label: "New Capital" },
    policies: defaultPolicies,
    reviewsSummary: defaultReviews,
    attractions: [
      { label: "Government District", distance: "5 min drive" },
      { label: "Conference Center", distance: "8 min drive" },
      { label: "Business District", distance: "3 min drive" },
      { label: "Airport road", distance: "15 min drive" },
    ],
    rooms: sharedRooms.map((room) => ({ ...room, pricePerNight: room.pricePerNight + 250 })),
  },
];

export const featuredHotel = hotelListings[0];

export function getHotelBySlug(slug?: string | null) {
  if (!slug || slug === "steigenberger-nile-palace") {
    return featuredHotel;
  }
  return hotelListings.find((hotel) => hotel.slug === slug) ?? null;
}
