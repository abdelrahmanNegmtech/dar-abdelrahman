import {
  BathIcon,
  BedIcon,
  BuildingIcon,
  CreditCardIcon,
  GridIcon,
  HouseIcon,
  TvIcon,
  UserIcon,
  WifiIcon,
} from "@/components/ui";
import { marketplaceImages } from "../assets";

export const propertyGalleryPhotos = [
  { category: "Living room", label: "Living room with skyline view", position: "object-[45%_50%]", src: marketplaceImages.modernApartment },
  { category: "Bedroom", label: "Warm bedroom suite", position: "object-[66%_50%]", src: marketplaceImages.hotelRoom },
  { category: "Kitchen", label: "Fully equipped kitchenette", position: "object-[30%_50%]", src: marketplaceImages.studio },
  { category: "Bathroom", label: "Modern marble bathroom", position: "object-[78%_52%]", src: marketplaceImages.servicedWorkspace },
  { category: "Balcony", label: "Balcony seating at sunset", position: "object-[58%_50%]", src: marketplaceImages.hero },
  { category: "Building", label: "Building exterior", position: "object-[70%_48%]", src: marketplaceImages.hero },
  { category: "Lobby", label: "Quiet arrival lobby", position: "object-[38%_48%]", src: marketplaceImages.host },
  { category: "Workspace", label: "Dedicated workspace", position: "object-[18%_50%]", src: marketplaceImages.servicedWorkspace },
  { category: "Neighborhood", label: "Neighborhood lights", position: "object-[86%_50%]", src: marketplaceImages.hero },
  { category: "Amenities", label: "Smart TV and Wi-Fi", position: "object-[50%_48%]", src: marketplaceImages.studio },
];

export const galleryCategories = [
  { icon: GridIcon, label: "All photos" },
  { icon: HouseIcon, label: "Living room" },
  { icon: BedIcon, label: "Bedroom" },
  { icon: CreditCardIcon, label: "Kitchen" },
  { icon: BathIcon, label: "Bathroom" },
  { icon: UserIcon, label: "Balcony" },
  { icon: BuildingIcon, label: "Building" },
  { icon: GridIcon, label: "Amenities" },
  { icon: GridIcon, label: "Neighborhood" },
];

export const galleryHighlights = [
  { icon: BuildingIcon, label: "Panoramic skyline view" },
  { icon: UserIcon, label: "Dedicated workspace" },
  { icon: BathIcon, label: "Modern bathroom" },
  { icon: WifiIcon, label: "Smart TV & Wi-Fi" },
  { icon: TvIcon, label: "Fully equipped kitchenette" },
];

export const roomCoverage = [
  { count: "8 photos", label: "Living room", width: "w-[100%]" },
  { count: "6 photos", label: "Bedroom", width: "w-[82%]" },
  { count: "3 photos", label: "Kitchen", width: "w-[68%]" },
  { count: "3 photos", label: "Bathroom", width: "w-[66%]" },
  { count: "2 photos", label: "Balcony", width: "w-[54%]" },
  { count: "2 photos", label: "Building & lobby", width: "w-[54%]" },
];
