import {
  BathIcon,
  BedIcon,
  CalendarIcon,
  CheckIcon,
  CreditCardIcon,
  ElevatorIcon,
  HeadphonesIcon,
  LockIcon,
  MapPinIcon,
  RulerIcon,
  ShieldIcon,
  TvIcon,
  UserIcon,
  WashingMachineIcon,
  WifiIcon,
} from "./icons";
import { marketplaceImages } from "../assets";

export const galleryImages = [
  { position: "object-[46%_52%]", src: marketplaceImages.studio },
  { position: "object-[58%_50%]", src: marketplaceImages.modernApartment },
  { position: "object-[68%_50%]", src: marketplaceImages.servicedWorkspace },
  { position: "object-[42%_48%]", src: marketplaceImages.hotelRoom },
  { position: "object-[75%_52%]", src: marketplaceImages.host },
];

export const stayFacts = [
  { icon: UserIcon, label: "Guests", value: "2" },
  { icon: BedIcon, label: "Bedroom", value: "1" },
  { icon: BedIcon, label: "Bed", value: "1" },
  { icon: BathIcon, label: "Bathroom", value: "1" },
  { icon: RulerIcon, label: "Size", value: "45 m²" },
];

export const amenities = [
  { icon: WifiIcon, label: "Wi-Fi" },
  { icon: HeadphonesIcon, label: "Air conditioning" },
  { icon: CreditCardIcon, label: "Kitchen" },
  { icon: UserIcon, label: "Workspace" },
  { icon: CalendarIcon, label: "Parking" },
  { icon: ElevatorIcon, label: "Elevator" },
  { icon: WashingMachineIcon, label: "Washing machine" },
  { icon: TvIcon, label: "Smart TV" },
];

export const rules = [
  "Check-in after 2:00 PM",
  "Check-out before 11:00 AM",
  "No smoking",
  "No parties",
  "ID required",
];

export const ratingBreakdown = [
  ["Cleanliness", "4.9", "w-[98%]"],
  ["Accuracy", "4.9", "w-[98%]"],
  ["Check-in", "4.9", "w-[98%]"],
  ["Communication", "4.8", "w-[96%]"],
  ["Location", "4.9", "w-[98%]"],
  ["Value", "4.8", "w-[96%]"],
];

export const reviews = [
  {
    author: "Omar",
    body: "Amazing stay! The studio is very clean, stylish and comfortable. The view from the balcony is perfect.",
    date: "April 2026",
  },
  {
    author: "Lina",
    body: "Great location in Madinaty, near the mall and restaurants. The host was responsive and helpful.",
    date: "April 2026",
  },
];

export const nearbyPlaces = [
  { distance: "0.8 km", icon: CalendarIcon, label: "Open Air Mall" },
  { distance: "0.6 km", icon: CreditCardIcon, label: "Restaurants" },
  { distance: "0.9 km", icon: ShieldIcon, label: "Supermarket" },
  { distance: "1.2 km", icon: UserIcon, label: "Transport" },
];

export const similarStays = [
  {
    imagePosition: "object-[58%_50%]",
    imageSrc: marketplaceImages.modernApartment,
    location: "R7, New Capital",
    price: "EGP 1,600 / night",
    rating: "4.8 (18)",
    title: "Modern Furnished Apartment",
  },
  {
    imagePosition: "object-[75%_52%]",
    imageSrc: marketplaceImages.servicedWorkspace,
    location: "Noor City",
    price: "EGP 1,100 / night",
    rating: "4.7 (21)",
    title: "Cozy Studio with Balcony",
  },
  {
    imagePosition: "object-[48%_50%]",
    imageSrc: marketplaceImages.hotelRoom,
    location: "Cairo East",
    price: "EGP 1,450 / night",
    rating: "4.7 (41)",
    title: "Premium Hotel Room",
  },
];

export const checkIcon = CheckIcon;
export const mapPinIcon = MapPinIcon;
export const lockIcon = LockIcon;
