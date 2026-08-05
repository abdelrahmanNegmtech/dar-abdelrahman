export const ownerRoutes = {
  home: "/owner",
  dashboard: "/dashboard",
  properties: "/owner/properties",
  propertyDrafts: "/owner/properties/drafts",
  addProperty: "/add-property",
  bookingRequests: "/owner/bookings",
  bookings: "/owner/bookings",
  bookingDecision: "/owner/bookings/request-decision",
  messages: "/owner/messages",
  payouts: "/owner/payouts",
  reviews: "/owner/reviews",
  verification: "/owner/verification",
  settings: "/owner/settings",
  help: "/owner/help-center",
  calendar: (propertyId: string | number = 1) =>
    `/owner/properties/${propertyId}/calendar-management`,
  property: (propertyId: string | number = 1) =>
    `/owner/properties/${propertyId}`,
  propertyEdit: (propertyId: string | number = 1, tab = "basic") =>
    `/owner/properties/${propertyId}/edit?tab=${tab}`,
  propertyPhotos: (propertyId: string | number = 1) =>
    `/owner/properties/${propertyId}/photos`,
  propertyPublish: (propertyId: string | number = 1) =>
    `/owner/properties/${propertyId}/publish`,
  propertyRejected: (propertyId: string | number = 1) =>
    `/owner/properties/${propertyId}/rejected`,
  availabilityRules: (propertyId: string | number = 1) =>
    `/owner/properties/${propertyId}/availability-rules`,
  seasonalPricing: (propertyId: string | number = 1) =>
    `/owner/properties/${propertyId}/seasonal-pricing`,
  publicProfile: (slug = "ahmed-hassan") => `/owners/${slug}`,
} as const;

const ownerNavRoutes: Record<string, string> = {
  Dashboard: ownerRoutes.dashboard,
  Overview: ownerRoutes.dashboard,
  Properties: ownerRoutes.properties,
  "My Properties": ownerRoutes.properties,
  Bookings: ownerRoutes.bookingDecision,
  "Booking Requests": ownerRoutes.bookingRequests,
  Calendar: ownerRoutes.calendar(),
  Messages: ownerRoutes.messages,
  Inbox: ownerRoutes.messages,
  Reviews: ownerRoutes.reviews,
  Analytics: ownerRoutes.dashboard,
  Payouts: ownerRoutes.payouts,
  Payments: ownerRoutes.payouts,
  Verification: ownerRoutes.verification,
  Settings: ownerRoutes.settings,
};

export function ownerNavHref(label: string) {
  return ownerNavRoutes[label] ?? ownerRoutes.dashboard;
}
