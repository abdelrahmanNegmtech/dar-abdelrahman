import {
  CalendarIcon,
  CreditCardIcon,
  HeadphonesIcon,
  HouseIcon,
  ShieldIcon,
  WifiIcon,
} from "./icons";
import { marketplaceImages } from "../assets";

export type SearchMode = "results" | "map" | "empty" | "error" | "loading";

export type SearchProperty = {
  amenities: string[];
  id: number;
  area: string;
  bedrooms: number;
  description: string;
  freeCancellation: boolean;
  guestCapacity: number;
  imagePosition: string;
  imageSrc: string;
  instantBooking: boolean;
  lat: number;
  lng: number;
  location: string;
  photos: string;
  price: string;
  priceValue: number;
  rating: string;
  ratingValue: number;
  slug: string;
  tags: string[];
  title: string;
  type: "Apartment" | "Hotel" | "Serviced apartment" | "Studio";
  verified: boolean;
};

export const properties: SearchProperty[] = [
  {
    amenities: ["Wi-Fi", "Air conditioning", "Kitchen", "Workspace"],
    id: 1,
    area: "B6",
    bedrooms: 1,
    description: "Modern studio with city view and premium amenities.",
    freeCancellation: true,
    guestCapacity: 2,
    imagePosition: "object-[42%_50%]",
    imageSrc: marketplaceImages.studio,
    instantBooking: true,
    lat: 30.0951,
    lng: 31.6366,
    location: "Madinaty",
    photos: "24 photos",
    price: "EGP 1,200",
    priceValue: 1200,
    rating: "4.9 (32)",
    ratingValue: 4.9,
    slug: "luxury-studio-in-madinaty",
    tags: ["Wi-Fi", "A/C", "Kitchen", "Workspace"],
    title: "Luxury Studio in Madinaty",
    type: "Studio",
    verified: true,
  },
  {
    amenities: ["Wi-Fi", "Air conditioning", "Kitchen", "Parking"],
    id: 2,
    area: "R7",
    bedrooms: 2,
    description: "Elegant 2BR apartment in the heart of New Capital.",
    freeCancellation: true,
    guestCapacity: 4,
    imagePosition: "object-[58%_50%]",
    imageSrc: marketplaceImages.modernApartment,
    instantBooking: false,
    lat: 30.0878,
    lng: 31.6307,
    location: "New Capital",
    photos: "18 photos",
    price: "EGP 1,600",
    priceValue: 1600,
    rating: "4.8 (18)",
    ratingValue: 4.8,
    slug: "modern-furnished-apartment",
    tags: ["Wi-Fi", "A/C", "Kitchen", "Parking"],
    title: "Modern Furnished Apartment",
    type: "Apartment",
    verified: true,
  },
  {
    amenities: ["Wi-Fi", "Air conditioning", "Breakfast", "Pool"],
    bedrooms: 1,
    freeCancellation: true,
    guestCapacity: 2,
    id: 3,
    instantBooking: true,
    area: "Madinaty",
    description: "Luxury hotel room with amazing facilities.",
    imagePosition: "object-[50%_52%]",
    imageSrc: marketplaceImages.hotelRoom,
    lat: 30.0909,
    lng: 31.6488,
    location: "Cairo East",
    photos: "22 photos",
    price: "EGP 1,450",
    rating: "4.7 (41)",
    priceValue: 1450,
    ratingValue: 4.7,
    slug: "premium-hotel-room",
    tags: ["Wi-Fi", "A/C", "Breakfast", "Pool"],
    title: "Premium Hotel Room",
    type: "Hotel",
    verified: true,
  },
  {
    amenities: ["Wi-Fi", "Air conditioning", "Kitchen", "Gym"],
    bedrooms: 1,
    freeCancellation: false,
    guestCapacity: 3,
    id: 4,
    instantBooking: false,
    area: "B12",
    description: "Serviced apartment with hotel-style services.",
    imagePosition: "object-[64%_50%]",
    imageSrc: marketplaceImages.servicedWorkspace,
    lat: 30.0846,
    lng: 31.6443,
    location: "Madinaty",
    photos: "20 photos",
    price: "EGP 1,800",
    rating: "4.9 (27)",
    priceValue: 1800,
    ratingValue: 4.9,
    slug: "serviced-apartment-near-b12",
    tags: ["Wi-Fi", "A/C", "Kitchen", "Gym"],
    title: "Serviced Apartment near B12",
    type: "Serviced apartment",
    verified: true,
  },
  {
    amenities: ["Wi-Fi", "Air conditioning", "Kitchen", "Parking", "Balcony"],
    bedrooms: 1,
    freeCancellation: false,
    guestCapacity: 2,
    id: 5,
    instantBooking: true,
    area: "Noor City",
    description: "Bright studio with balcony and garden view.",
    imagePosition: "object-[75%_52%]",
    imageSrc: marketplaceImages.studio,
    lat: 30.0811,
    lng: 31.6362,
    location: "Noor City",
    photos: "16 photos",
    price: "EGP 1,100",
    rating: "4.7 (21)",
    priceValue: 1100,
    ratingValue: 4.7,
    slug: "cozy-studio-with-balcony",
    tags: ["Wi-Fi", "A/C", "Kitchen", "Parking"],
    title: "Cozy Studio with Balcony",
    type: "Studio",
    verified: true,
  },
  {
    amenities: ["Wi-Fi", "Air conditioning", "Kitchen", "Parking"],
    bedrooms: 3,
    freeCancellation: true,
    guestCapacity: 6,
    id: 6,
    instantBooking: false,
    area: "New Cairo",
    description: "Spacious 3BR apartment perfect for families.",
    imagePosition: "object-[70%_50%]",
    imageSrc: marketplaceImages.modernApartment,
    lat: 30.0861,
    lng: 31.6329,
    location: "New Cairo",
    photos: "26 photos",
    price: "EGP 2,200",
    rating: "4.8 (36)",
    priceValue: 2200,
    ratingValue: 4.8,
    slug: "family-apartment-in-new-cairo",
    tags: ["Wi-Fi", "A/C", "Kitchen", "Parking"],
    title: "Family Apartment in New Cairo",
    type: "Apartment",
    verified: true,
  },
  {
    amenities: ["Wi-Fi", "Air conditioning", "Kitchen", "Parking"],
    bedrooms: 2,
    freeCancellation: true,
    guestCapacity: 4,
    id: 7,
    instantBooking: true,
    area: "Madinaty",
    description: "Premium apartment with modern finishes in Madinaty.",
    imagePosition: "object-[75%_52%]",
    imageSrc: marketplaceImages.hotelRoom,
    lat: 30.0909,
    lng: 31.6488,
    location: "Madinaty",
    photos: "22 photos",
    price: "EGP 1,900",
    rating: "4.9",
    priceValue: 1900,
    ratingValue: 4.9,
    slug: "premium-apartment-in-madinaty",
    tags: ["Wi-Fi", "A/C", "Kitchen", "Parking"],
    title: "Premium Apartment",
    type: "Apartment",
    verified: true,
  },
];

export const filterGroups = {
  amenities: [
    ["Wi-Fi", "7", false],
    ["Air conditioning", "7", false],
    ["Kitchen", "6", false],
    ["Parking", "4", false],
    ["Pool", "1", false],
    ["Workspace", "1", false],
  ],
  booking: [
    ["Instant booking", "4", false],
    ["Free cancellation", "5", false],
    ["Verified only", "7", false],
  ],
  property: [
    ["Studio", "2", false],
    ["Apartment", "3", false],
    ["Hotel", "1", false],
    ["Serviced apartment", "1", false],
  ],
};

export const nearby = [
  { label: "Malls", value: "1.2 km", icon: HouseIcon },
  { label: "Restaurants", value: "0.8 km", icon: CreditCardIcon },
  { label: "Transport", value: "1.0 km", icon: CalendarIcon },
];

export const emptyDestinations = [
  ["Cairo", "1,234 places"],
  ["Alexandria", "856 places"],
  ["Hurghada", "642 places"],
  ["Sharm El Sheikh", "522 places"],
];

export const errorSuggestions = [
  {
    description: "Different dates might have more availability.",
    icon: CalendarIcon,
    title: "Change your dates",
  },
  {
    description: "Search nearby areas or different regions.",
    icon: HouseIcon,
    title: "Adjust your location",
  },
  {
    description: "Removing some filters might show more results.",
    icon: ShieldIcon,
    title: "Use fewer filters",
  },
  {
    description: "We'll alert you when new places match your search.",
    icon: HeadphonesIcon,
    title: "Get notified",
  },
];

export const amenityIcons = { WifiIcon };
