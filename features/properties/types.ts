import type { SidebarGroup } from "@/features/design-system";

export type PropertyCategory =
  | "all"
  | "live"
  | "under-review"
  | "drafts"
  | "rejected"
  | "reported"
  | "hotels"
  | "needs-update";

export type PropertyStatus =
  | "live"
  | "under-review"
  | "reported"
  | "needs-update"
  | "draft";

export type PropertyVerificationState =
  | "docs-complete"
  | "authorization-missing"
  | "hotel-verified"
  | "risk-flag"
  | "photos-review";

export type PropertyOwnerType = "individual" | "broker" | "hotel";

export type PropertyMetric = {
  key: string;
  label: string;
  value: string;
  hint: string;
  accent: "brand" | "success" | "warning" | "neutral" | "danger";
  icon: "property" | "live" | "review" | "draft" | "rejected" | "reported" | "hotel";
};

export type PropertyRecord = {
  id: string;
  title: string;
  ownerName: string;
  ownerType: PropertyOwnerType;
  type: string;
  cityArea: string;
  price: string;
  qualityScore: number;
  verificationLabel: string;
  verificationState: PropertyVerificationState;
  status: PropertyStatus;
  performancePrimary: string;
  performanceSecondary: string;
  actionLabel: string;
  thumbnailKey: "madinaty" | "modern" | "hotel" | "serviced" | "balcony";
  badgeLabel?: string;
  phone: string;
  email: string;
  statusLabel: string;
};

export type PropertyChecklistItem = {
  id: string;
  label: string;
  state: "verified" | "missing" | "pending";
  detail?: string;
};

export type PropertySummaryCard = {
  title: string;
  value: string;
  subtitle: string;
  linkLabel: string;
  tone: "brand" | "warning" | "danger" | "info";
};

export type QualityDistributionItem = {
  label: string;
  value: number;
  color: string;
};

export type PropertyFilters = {
  search: string;
  status: string;
  type: string;
  city: string;
  ownerType: string;
  qualityScore: string;
  minPrice: string;
  maxPrice: string;
  startDate: string;
  endDate: string;
};

export type PropertiesPageData = {
  sidebarGroups: SidebarGroup[];
  metrics: PropertyMetric[];
  categoryTabs: Array<{ value: PropertyCategory; label: string; count: string }>;
  properties: PropertyRecord[];
  filterOptions: {
    status: Array<{ label: string; value: string }>;
    type: Array<{ label: string; value: string }>;
    city: Array<{ label: string; value: string }>;
    ownerType: Array<{ label: string; value: string }>;
    qualityScore: Array<{ label: string; value: string }>;
    rowsPerPage: Array<{ label: string; value: number }>;
  };
  initialFilters: PropertyFilters;
  initialCategory: PropertyCategory;
  initialPropertyId: string;
  checklist: PropertyChecklistItem[];
  summaryCards: {
    reviewQueue: PropertySummaryCard;
    reportedListings: PropertySummaryCard;
    missingDocuments: PropertySummaryCard;
    lowQualityPhotos: PropertySummaryCard;
  };
  qualityDistribution: QualityDistributionItem[];
};
