export type PropertyImage = {
  src: string;
  alt: string;
};

export type Property = {
  slug: string;
  title: string;
  location: string;
  neighborhood: string;
  rating: number;
  reviews: number;
  hostType: string;
  pricePerNight: number;
  cleaningFee: number;
  serviceFeeRate: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  beds: number;
  images: PropertyImage[];
  unavailableDates: string[];
  amenities: Array<{ label: string; icon: string }>;
  highlights: string[];
  about: string;
  similar: Array<{
    slug: string;
    title: string;
    location: string;
    pricePerNight: number;
    rating: number;
    image: string;
  }>;
};

export const featuredProperty: Property = {
  slug: "modern-apartment-madinty",
  title: "Modern Apartment in Madinty",
  location: "Madinty",
  neighborhood: "Premium B12 address near South Park, services, and landscaped promenades",
  rating: 4.86,
  reviews: 128,
  hostType: "Superhost",
  pricePerNight: 2800,
  cleaningFee: 0,
  serviceFeeRate: 0.12,
  maxGuests: 4,
  bedrooms: 2,
  bathrooms: 2,
  area: 118,
  beds: 3,
  images: [
    {
      src: "/properties/madinty-living.png",
      alt: "Premium Madinty living room with landscaped compound view",
    },
    {
      src: "/properties/madinty-bedroom.png",
      alt: "Serene Madinty master bedroom with warm neutral finishes",
    },
    {
      src: "/properties/madina-nour-kitchen.png",
      alt: "Bright Madina Nour open kitchen and dining area",
    },
    {
      src: "/properties/new-capital-terrace.png",
      alt: "New Administrative Capital residence lounge with terrace",
    },
    {
      src: "/properties/madina-nour-duplex.png",
      alt: "Premium Madina Nour duplex living room with double height windows",
    },
    {
      src: "/properties/new-capital-studio.png",
      alt: "Compact serviced studio in New Administrative Capital",
    },
  ],
  unavailableDates: [
    "2026-07-18",
    "2026-07-19",
    "2026-07-20",
    "2026-08-08",
    "2026-08-09",
    "2026-08-23",
  ],
  amenities: [
    { label: "Fast Wi-Fi", icon: "Wi" },
    { label: "Air conditioning", icon: "AC" },
    { label: "Equipped kitchen", icon: "Kt" },
    { label: "Washer", icon: "Ws" },
    { label: "Garden view", icon: "Gv" },
    { label: "Elevator", icon: "El" },
    { label: "Free parking", icon: "Pk" },
    { label: "Workspace", icon: "Ds" },
  ],
  highlights: [
    "Self check-in",
    "Free cancellation before arrival window",
    "Dedicated DAR support",
  ],
  about:
    "A polished Madinty apartment with bright living spaces, elegant neutral finishes, a generous balcony, and a calm compound outlook. Daily services, landscaped walking paths, cafes, and family-friendly amenities are close by, while the apartment stays private, modern, and easy to settle into.",
  similar: [
    {
      slug: "madina-nour-duplex-residence",
      title: "Madina Nour Duplex Residence",
      location: "Madina Nour",
      pricePerNight: 3600,
      rating: 4.9,
      image: "/properties/madina-nour-duplex.png",
    },
    {
      slug: "new-capital-terrace-suite",
      title: "New Capital Terrace Suite",
      location: "New Administrative Capital",
      pricePerNight: 3300,
      rating: 4.88,
      image: "/properties/new-capital-terrace.png",
    },
    {
      slug: "madina-nour-open-plan-apartment",
      title: "Madina Nour Open-Plan Apartment",
      location: "Madina Nour",
      pricePerNight: 2450,
      rating: 4.81,
      image: "/properties/madina-nour-kitchen.png",
    },
  ],
};

const propertyOverrides: Record<string, Partial<Property>> = {
  "madina-nour-duplex-residence": {
    title: "Madina Nour Duplex Residence",
    location: "Madina Nour",
    neighborhood: "Quiet duplex residence near Madina Nour gardens, retail services, and family promenades",
    rating: 4.9,
    reviews: 96,
    pricePerNight: 3600,
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 3,
    area: 168,
    beds: 4,
    images: [
      { src: "/properties/madina-nour-duplex.png", alt: "Madina Nour duplex living room with double-height windows" },
      { src: "/properties/madina-nour-kitchen.png", alt: "Madina Nour kitchen and dining space" },
      { src: "/properties/madinty-bedroom.png", alt: "Premium bedroom with soft neutral finishes" },
      { src: "/properties/new-capital-terrace.png", alt: "Bright lounge and terrace" },
    ],
    about:
      "A spacious duplex residence in Madina Nour with generous family areas, refined finishes, and a calm community setting. The home is designed for longer stays with a full kitchen, multiple bedrooms, work-friendly corners, and easy access to local services.",
  },
  "new-capital-terrace-suite": {
    title: "New Capital Terrace Suite",
    location: "New Administrative Capital",
    neighborhood: "Terrace suite close to business districts, government services, and dining destinations",
    rating: 4.88,
    reviews: 84,
    pricePerNight: 3300,
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 2,
    area: 132,
    beds: 3,
    images: [
      { src: "/properties/new-capital-terrace.png", alt: "New Administrative Capital terrace suite lounge" },
      { src: "/properties/new-capital-studio.png", alt: "New Capital bedroom studio detail" },
      { src: "/properties/madinty-living.png", alt: "Bright living room with compound view" },
      { src: "/properties/madina-nour-kitchen.png", alt: "Modern kitchen and dining area" },
    ],
    about:
      "A polished terrace suite in the New Administrative Capital with open views, premium furnishings, and a comfortable layout for business or leisure stays. Enjoy a calm lounge, reliable connectivity, and fast access to the city's new districts.",
  },
  "new-capital-serviced-studio": {
    title: "New Capital Serviced Studio",
    location: "New Administrative Capital",
    neighborhood: "Compact serviced studio near New Capital business services and everyday conveniences",
    rating: 4.74,
    reviews: 61,
    pricePerNight: 1950,
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    area: 58,
    beds: 1,
    images: [
      { src: "/properties/new-capital-studio.png", alt: "New Capital serviced studio bedroom and sitting area" },
      { src: "/properties/new-capital-terrace.png", alt: "New Capital residence lounge" },
      { src: "/properties/madinty-bedroom.png", alt: "Neutral bedroom with premium linens" },
      { src: "/properties/madina-nour-kitchen.png", alt: "Compact kitchen and dining space" },
    ],
    about:
      "A streamlined serviced studio for short stays in the New Administrative Capital. The space includes a comfortable bed, compact dining setup, equipped kitchenette, fast Wi-Fi, and practical services for focused city stays.",
  },
  "madina-nour-open-plan-apartment": {
    title: "Madina Nour Open-Plan Apartment",
    location: "Madina Nour",
    neighborhood: "Open-plan apartment close to community services, cafes, and green pedestrian paths",
    rating: 4.81,
    reviews: 72,
    pricePerNight: 2450,
    maxGuests: 3,
    bedrooms: 1,
    bathrooms: 1,
    area: 82,
    beds: 2,
    images: [
      { src: "/properties/madina-nour-kitchen.png", alt: "Madina Nour open-plan kitchen and dining" },
      { src: "/properties/madina-nour-duplex.png", alt: "Madina Nour bright living area" },
      { src: "/properties/madinty-bedroom.png", alt: "Quiet bedroom with neutral finishes" },
      { src: "/properties/new-capital-studio.png", alt: "Compact serviced sleeping area" },
    ],
    about:
      "A bright open-plan apartment in Madina Nour with a comfortable lounge, equipped kitchen, calm bedroom, and polished details throughout. Ideal for guests who want a practical, premium base in a growing community.",
  },
};

export const allProperties: Property[] = [
  featuredProperty,
  ...Object.entries(propertyOverrides).map(([slug, override]) => ({
    ...featuredProperty,
    ...override,
    slug,
    unavailableDates: override.unavailableDates ?? featuredProperty.unavailableDates.map((date, index) => index % 2 === 0 ? date : date),
    amenities: override.amenities ?? featuredProperty.amenities,
    highlights: override.highlights ?? featuredProperty.highlights,
    similar: featuredProperty.similar.filter((similar) => similar.slug !== slug),
  })),
];

export function getPropertyBySlug(slug: string) {
  if (slug === "modern-apartment-zamalek") {
    return featuredProperty;
  }
  return allProperties.find((property) => property.slug === slug) ?? null;
}

export const resultProperties = [
  {
    slug: featuredProperty.slug,
    title: featuredProperty.title,
    location: featuredProperty.location,
    pricePerNight: featuredProperty.pricePerNight,
    rating: featuredProperty.rating,
    reviews: featuredProperty.reviews,
    bedrooms: featuredProperty.bedrooms,
    bathrooms: featuredProperty.bathrooms,
    guests: featuredProperty.maxGuests,
    area: featuredProperty.area,
    image: featuredProperty.images[0].src,
  },
  {
    slug: "madina-nour-duplex-residence",
    title: "Madina Nour Duplex Residence",
    location: "Madina Nour",
    pricePerNight: 3600,
    rating: 4.9,
    reviews: 96,
    bedrooms: 3,
    bathrooms: 3,
    guests: 6,
    area: 168,
    image: "/properties/madina-nour-duplex.png",
  },
  {
    slug: "new-capital-terrace-suite",
    title: "New Capital Terrace Suite",
    location: "New Administrative Capital",
    pricePerNight: 3300,
    rating: 4.88,
    reviews: 84,
    bedrooms: 2,
    bathrooms: 2,
    guests: 4,
    area: 132,
    image: "/properties/new-capital-terrace.png",
  },
  {
    slug: "new-capital-serviced-studio",
    title: "New Capital Serviced Studio",
    location: "New Administrative Capital",
    pricePerNight: 1950,
    rating: 4.74,
    reviews: 61,
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    area: 58,
    image: "/properties/new-capital-studio.png",
  },
];
