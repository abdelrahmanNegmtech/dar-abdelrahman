import type { SidebarGroup } from "@/features/design-system";

export type OverviewMetricAccent = "brand" | "info" | "success" | "warning";

export type OverviewMetric = {
  key: string;
  label: string;
  value: string;
  trendValue: string;
  trendLabel: string;
  accent: OverviewMetricAccent;
  sparkline: number[];
  icon: "users" | "property" | "bookings" | "revenue";
};

export type OverviewDateRangeOption = {
  label: string;
  value: string;
};

export type OverviewLinePoint = {
  label: string;
  thisWeek: number;
  lastWeek: number;
};

export type OverviewRevenuePoint = {
  label: string;
  value: number;
};

export type OverviewBookingStatus = "confirmed" | "pending" | "cancelled";

export type RecentBooking = {
  id: string;
  propertyName: string;
  location: string;
  dateRange: string;
  nights: string;
  amount: string;
  status: OverviewBookingStatus;
  thumbnailKey: "zamalek" | "maadi" | "sokhna" | "new-cairo";
};

export type TopProperty = {
  id: string;
  rank: number;
  propertyName: string;
  location: string;
  bookings: number;
  thumbnailKey: RecentBooking["thumbnailKey"];
};

export type SignupSegment = {
  label: string;
  value: number;
  percentageLabel: string;
  color: string;
};

export type SystemStatusItem = {
  label: string;
  value: string;
};

export type OverviewPageData = {
  sidebarGroups: SidebarGroup[];
  dateRanges: OverviewDateRangeOption[];
  currencyOptions: Array<{ label: string; value: string }>;
  metrics: OverviewMetric[];
  bookingOverview: {
    points: OverviewLinePoint[];
    totalLabel: string;
    comparisonValue: string;
  };
  revenueOverview: {
    points: OverviewRevenuePoint[];
    totalLabel: string;
    comparisonValue: string;
  };
  recentBookings: RecentBooking[];
  topProperties: TopProperty[];
  signupSegments: SignupSegment[];
  systemStatus: SystemStatusItem[];
  quickActions: string[];
};
