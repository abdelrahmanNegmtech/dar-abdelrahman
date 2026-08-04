import type { SidebarGroup } from "@/features/design-system";

export type ReportsMetricAccent = "brand" | "warning" | "danger";

export type ReportsMetric = {
  key: string;
  label: string;
  value: string;
  delta: string;
  hint: string;
  accent: ReportsMetricAccent;
  icon: "gbv" | "bookings" | "conversion" | "commission" | "properties" | "occupancy" | "refund";
  sparkline: number[];
};

export type ReportsFilters = {
  range: "7" | "30" | "90" | "custom";
  city: string;
  propertyType: string;
  ownerType: string;
  paymentMethod: string;
  comparePrevious: boolean;
};

export type CombinedChartMonth = {
  label: string;
  gbv: number;
  commission: number;
  refunds: number;
};

export type FunnelStep = {
  label: string;
  value: string;
  conversion?: string;
};

export type CityPerformanceRow = {
  city: string;
  gbv: string;
  bookings: string;
  occupancy: number;
};

export type PropertyTypeBreakdownItem = {
  label: string;
  percentage: number;
  avgPrice: string;
  color: string;
};

export type PaymentMethodRow = {
  label: string;
  percentage: number;
  delay: string;
};

export type TopPropertyReportRow = {
  property: string;
  revenue: string;
  occupancy: string;
  rating: string;
  views: string;
  conversion: string;
  thumbnailKey: "madinaty" | "modern" | "hotel" | "serviced" | "balcony";
};

export type OwnerPerformanceRow = {
  owner: string;
  revenue: string;
  responseTime: string;
  approvalRate: string;
  cancellationRate: string;
};

export type SavedReportRow = {
  title: string;
  cadence: string;
  lastRun: string;
};

export type ReportsPageData = {
  sidebarGroups: SidebarGroup[];
  metrics: ReportsMetric[];
  filterOptions: {
    cities: Array<{ label: string; value: string }>;
    propertyTypes: Array<{ label: string; value: string }>;
    ownerTypes: Array<{ label: string; value: string }>;
    paymentMethods: Array<{ label: string; value: string }>;
  };
  revenueTrend: CombinedChartMonth[];
  funnel: FunnelStep[];
  cityPerformance: CityPerformanceRow[];
  propertyTypeBreakdown: PropertyTypeBreakdownItem[];
  paymentMethods: PaymentMethodRow[];
  topProperties: TopPropertyReportRow[];
  ownerPerformance: OwnerPerformanceRow[];
  savedReports: SavedReportRow[];
  quickLinks: string[];
};
