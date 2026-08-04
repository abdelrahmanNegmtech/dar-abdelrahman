import type { ChecklistItemData, RiskLevel, SidebarGroup, TimelineItemData } from "@/features/design-system";

export type BookingMetric = {
  key: string;
  label: string;
  value: string;
  trendValue: string;
  trendDirection: "up" | "down" | "neutral";
  trendLabel: string;
  accent: "brand" | "warning" | "success" | "danger";
  icon:
    | "calendar"
    | "pending"
    | "confirmed"
    | "wallet"
    | "cancelled"
    | "disputes"
    | "revenue";
};

export type BookingStatus =
  | "payment-review"
  | "pending-approval"
  | "confirmed"
  | "completed"
  | "disputed";

export type BookingRecord = {
  id: string;
  guestName: string;
  guestPhone: string;
  propertyName: string;
  propertyArea: string;
  ownerName: string;
  dateRange: string;
  nights: string;
  total: string;
  paymentLabel: string;
  paymentMeta: string;
  bookingStatus: BookingStatus;
  risk: RiskLevel;
  actionLabel: string;
  city: string;
  propertyType: string;
  paymentStatus: string;
  statusCategory:
    | "all"
    | "pending-approval"
    | "payment-review"
    | "confirmed"
    | "check-in-today"
    | "cancellations"
    | "disputes";
};

export type BookingParty = {
  name: string;
  phone: string;
  email: string;
  badges?: Array<{ label: string; tone: "success" | "warning" | "brand" }>;
};

export type BookingMessage = {
  id: string;
  sender: string;
  role: string;
  time: string;
  body: string;
};

export type PaymentBreakdownItem = {
  label: string;
  value: string;
  tone?: "default" | "danger";
};

export type BookingDetail = {
  bookingId: string;
  statusLabel: string;
  propertyName: string;
  propertyLocation: string;
  ratingLabel: string;
  propertyVerifiedLabel: string;
  guest: BookingParty;
  owner: BookingParty;
  keyFacts: Array<{ label: string; value: string }>;
  checklist: ChecklistItemData[];
  timeline: TimelineItemData[];
  paymentBreakdown: PaymentBreakdownItem[];
  refundEligibility: string;
  payoutStatus: string;
  communication: BookingMessage[];
  noteUpdatedAt: string;
};

export type BookingsPageData = {
  sidebarGroups: SidebarGroup[];
  metrics: BookingMetric[];
  tabs: Array<{ value: BookingRecord["statusCategory"]; label: string; count?: string | number }>;
  bookings: BookingRecord[];
  selectedBookingId: string;
  filters: {
    bookingStatus: Array<{ label: string; value: string }>;
    paymentStatus: Array<{ label: string; value: string }>;
    propertyType: Array<{ label: string; value: string }>;
    city: Array<{ label: string; value: string }>;
    checkInDate: Array<{ label: string; value: string }>;
    riskLevel: Array<{ label: string; value: string }>;
    rowsPerPage: Array<{ label: string; value: string }>;
  };
  details: Record<string, BookingDetail>;
};
