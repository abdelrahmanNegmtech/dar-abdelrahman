import type { PropertyRow, ReviewRow } from "@/lib/supabase/database";
import { marketplaceImages } from "@/features/public-marketplace/assets";

type FallbackPhoto = {
  category: string;
  label: string;
  position: string;
  src: string;
};

type FallbackPreset = {
  aboutSuffix: string;
  areaLabel: string;
  gallery: FallbackPhoto[];
  highlights: string[];
  locationHighlights: Array<{ distance: string; label: string }>;
  tags: string[];
};

const DEFAULT_HIGHLIGHTS = [
  "Verified property",
  "Flexible cancellation before check-in window",
  "Dedicated DAR support",
] as const;

const PRESETS: Record<string, FallbackPreset> = {
  "rehab-sunlit-flat": {
    aboutSuffix:
      "The stay is set up for family-friendly short visits with bright interiors, practical sleeping space, and easy access to nearby retail and services.",
    areaLabel: "Al Rehab",
    gallery: [
      {
        category: "Living room",
        label: "Sunlit living room with balcony light",
        position: "object-[46%_52%]",
        src: marketplaceImages.modernApartment,
      },
      {
        category: "Bedroom",
        label: "Second bedroom setup",
        position: "object-[66%_50%]",
        src: marketplaceImages.studio,
      },
      {
        category: "Kitchen",
        label: "Open kitchen and breakfast area",
        position: "object-[32%_50%]",
        src: marketplaceImages.servicedWorkspace,
      },
      {
        category: "Bathroom",
        label: "Clean family bathroom",
        position: "object-[74%_52%]",
        src: marketplaceImages.hotelRoom,
      },
      {
        category: "Building",
        label: "Building exterior and access",
        position: "object-[58%_48%]",
        src: marketplaceImages.hero,
      },
    ],
    highlights: [...DEFAULT_HIGHLIGHTS],
    locationHighlights: [
      { distance: "0.7 km", label: "Rehab Market" },
      { distance: "1.2 km", label: "Family dining" },
      { distance: "1.5 km", label: "Compound services" },
      { distance: "2.0 km", label: "Main road access" },
    ],
    tags: ["Wi-Fi", "A/C", "Kitchen", "Family stay"],
  },
  "sokhna-weekend-chalet": {
    aboutSuffix:
      "This coastal stay is arranged for relaxed group weekends, mixing open gathering space, resort access, and a lighter location pin to avoid over-sharing precise address details.",
    areaLabel: "Palm Coast",
    gallery: [
      {
        category: "Living room",
        label: "Weekend lounge with coastal daylight",
        position: "object-[52%_52%]",
        src: marketplaceImages.hero,
      },
      {
        category: "Bedroom",
        label: "Primary bedroom retreat",
        position: "object-[54%_50%]",
        src: marketplaceImages.hotelRoom,
      },
      {
        category: "Kitchen",
        label: "Family dining and kitchenette",
        position: "object-[62%_50%]",
        src: marketplaceImages.servicedWorkspace,
      },
      {
        category: "Balcony",
        label: "Outdoor seating with open-air view",
        position: "object-[58%_50%]",
        src: marketplaceImages.modernApartment,
      },
      {
        category: "Building",
        label: "Chalet exterior within the resort",
        position: "object-[66%_48%]",
        src: marketplaceImages.studio,
      },
    ],
    highlights: [...DEFAULT_HIGHLIGHTS],
    locationHighlights: [
      { distance: "0.4 km", label: "Beach access" },
      { distance: "0.8 km", label: "Resort cafe" },
      { distance: "1.1 km", label: "Pool area" },
      { distance: "2.3 km", label: "Marina road" },
    ],
    tags: ["Wi-Fi", "A/C", "Balcony", "Group stay"],
  },
};

const FALLBACK_CATEGORIES = [
  "All photos",
  "Living room",
  "Bedroom",
  "Kitchen",
  "Bathroom",
  "Balcony",
  "Building",
  "Amenities",
  "Neighborhood",
] as const;

export function getPropertyFallbackPreset(slug: string): FallbackPreset {
  return PRESETS[slug] ?? {
    aboutSuffix:
      "The listing uses curated DAR preview imagery while public photo metadata remains unavailable in the current local Supabase public policy surface.",
    areaLabel: "DAR area",
    gallery: [
      {
        category: "Living room",
        label: "Curated living space preview",
        position: "object-[50%_50%]",
        src: marketplaceImages.modernApartment,
      },
      {
        category: "Bedroom",
        label: "Curated bedroom preview",
        position: "object-[60%_50%]",
        src: marketplaceImages.studio,
      },
      {
        category: "Kitchen",
        label: "Curated kitchen preview",
        position: "object-[42%_50%]",
        src: marketplaceImages.servicedWorkspace,
      },
      {
        category: "Bathroom",
        label: "Curated bathroom preview",
        position: "object-[68%_50%]",
        src: marketplaceImages.hotelRoom,
      },
      {
        category: "Building",
        label: "Curated building preview",
        position: "object-[56%_48%]",
        src: marketplaceImages.hero,
      },
    ],
    highlights: [...DEFAULT_HIGHLIGHTS],
    locationHighlights: [
      { distance: "0.9 km", label: "Daily services" },
      { distance: "1.1 km", label: "Dining" },
      { distance: "1.4 km", label: "Retail" },
      { distance: "2.0 km", label: "Road access" },
    ],
    tags: ["Wi-Fi", "A/C", "Kitchen", "Verified"],
  };
}

export function getFallbackPhotoCountLabel(slug: string) {
  return `${getPropertyFallbackPreset(slug).gallery.length} photos`;
}

export function getFallbackGalleryCategories() {
  return [...FALLBACK_CATEGORIES];
}

export function buildFallbackAbout(row: Pick<PropertyRow, "description" | "public_slug" | "title">) {
  const preset = getPropertyFallbackPreset(row.public_slug);
  return row.description
    ? `${row.description} ${preset.aboutSuffix}`
    : `${row.title}. ${preset.aboutSuffix}`;
}

export function buildFallbackReviewAuthor(index: number) {
  return `Guest ${index + 1}`;
}

export function buildFallbackReviewDate(review: Pick<ReviewRow, "submitted_at" | "created_at">) {
  const source = review.submitted_at ?? review.created_at;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(source));
}
