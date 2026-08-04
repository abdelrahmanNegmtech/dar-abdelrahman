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
  id: number;
  area: string;
  description: string;
  imagePosition: string;
  imageSrc: string;
  lat: number;
  lng: number;
  location: string;
  photos: string;
  price: string;
  rating: string;
  slug: string;
  tags: string[];
  title: string;
};

export const properties: SearchProperty[] = [
  {
    id: 1,
    area: "B6",
    description: "Modern studio with city view and premium amenities.",
    imagePosition: "object-[42%_50%]",
    imageSrc: marketplaceImages.studio,
    lat: 30.0951,
    lng: 31.6366,
    location: "Madinaty",
    photos: "24 photos",
    price: "EGP 1,200",
    rating: "4.9 (32)",
    slug: "luxury-studio-in-madinaty",
    tags: ["Wi-Fi", "A/C", "Kitchen", "Workspace"],
    title: "Luxury Studio in Madinaty",
  },
  {
    id: 2,
    area: "R7",
    description: "Elegant 2BR apartment in the heart of New Capital.",
    imagePosition: "object-[58%_50%]",
    imageSrc: marketplaceImages.modernApartment,
    lat: 30.0878,
    lng: 31.6307,
    location: "New Capital",
    photos: "18 photos",
    price: "EGP 1,600",
    rating: "4.8 (18)",
    slug: "modern-furnished-apartment",
    tags: ["Wi-Fi", "A/C", "Kitchen", "Parking"],
    title: "Modern Furnished Apartment",
  },
  {
    id: 3,
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
    slug: "premium-hotel-room",
    tags: ["Wi-Fi", "A/C", "Breakfast", "Pool"],
    title: "Premium Hotel Room",
  },
  {
    id: 4,
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
    slug: "serviced-apartment-near-b12",
    tags: ["Wi-Fi", "A/C", "Kitchen", "Gym"],
    title: "Serviced Apartment near B12",
  },
  {
    id: 5,
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
    slug: "cozy-studio-with-balcony",
    tags: ["Wi-Fi", "A/C", "Kitchen", "Parking"],
    title: "Cozy Studio with Balcony",
  },
  {
    id: 6,
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
    slug: "family-apartment-in-new-cairo",
    tags: ["Wi-Fi", "A/C", "Kitchen", "Parking"],
    title: "Family Apartment in New Cairo",
  },
];

export const filterGroups = {
  amenities: [
    ["Wi-Fi", "112", true],
    ["Air conditioning", "110", false],
    ["Kitchen", "89", false],
    ["Parking", "62", false],
    ["Pool", "37", false],
    ["Workspace", "43", false],
  ],
  booking: [
    ["Instant booking", "98", false],
    ["Free cancellation", "76", false],
    ["Verified only", "128", true],
  ],
  property: [
    ["Studio", "64", false],
    ["Furnished apartment", "48", true],
    ["Hotel room", "28", false],
    ["Serviced apartment", "18", false],
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
