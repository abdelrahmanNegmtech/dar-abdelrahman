import { marketplaceImages } from "../assets";

export type SharePropertyData = {
  image: string;
  location: string;
  price: string;
  rating?: string;
  title: string;
  url: string;
  verified?: boolean;
};

export type ShareChannel = "whatsapp" | "facebook" | "instagram" | "messenger" | "more";

export type ShareModalState =
  | "closed"
  | "opening"
  | "open"
  | "copy-loading"
  | "copied"
  | "copy-error"
  | "native-unsupported"
  | "channel-selected"
  | "closing";

export const defaultShareProperty: SharePropertyData = {
  image: marketplaceImages.modernApartment,
  location: "Zamalek, Cairo, Egypt",
  price: "EGP 2,500 / night",
  title: "Modern Apartment in Zamalek",
  url: "/stays/luxury-studio-in-madinaty",
  verified: true,
};
