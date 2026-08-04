import type { ChecklistItemData, RiskLevel, SidebarGroup, StatusVariant, TimelineItemData } from "@/features/design-system";

export type UserRole = "guest" | "owner" | "broker" | "hotel" | "admin";

export type UserCategory =
  | "all"
  | "guests"
  | "owners"
  | "brokers"
  | "hotels"
  | "admins"
  | "suspended"
  | "pending";

export type UserVerificationState =
  | "verified"
  | "pending"
  | "phone-only"
  | "unverified";

export type UserStatus =
  | "active"
  | "pending"
  | "suspended"
  | "payment-review"
  | "disputed";

export type UserMetricAccent = "brand" | "info" | "warning" | "danger";

export type UserMetric = {
  key: string;
  label: string;
  value: string;
  trendValue: string;
  trendDirection: "up" | "down";
  trendLabel: string;
  icon: "users" | "guest" | "owner" | "broker" | "hotel" | "suspended";
  accent: UserMetricAccent;
};

export type UserRecord = {
  id: string;
  name: string;
  role: UserRole;
  city: string;
  email: string;
  phone: string;
  verificationState: UserVerificationState;
  verificationLabel: string;
  bookingsOrListings: string;
  lastActivity: string;
  risk: RiskLevel;
  status: UserStatus;
  joinedDate: string;
  revenue: string;
  rating: string;
  listingCount: number;
  bookingRequests: number;
  roleBadgeLabel?: string;
  statusVariant: StatusVariant;
  checklist: ChecklistItemData[];
  auditLog: TimelineItemData[];
};

export type UserFilters = {
  search: string;
  role: "all" | UserRole;
  status: "all" | UserStatus;
  verification: "all" | UserVerificationState;
  city: "all" | "cairo" | "new-capital" | "giza" | "cairo-east";
  joinedDate: "all" | "30-days" | "12-months" | "all-time";
};

export type UserSummaryCard = {
  title: string;
  value: string;
  hint: string;
  tone: "brand" | "warning" | "danger" | "info";
  actionLabel: string;
};

export type PermissionItem = {
  id: string;
  label: string;
  checked: boolean;
};

export type UsersPageData = {
  sidebarGroups: SidebarGroup[];
  metrics: UserMetric[];
  categoryTabs: Array<{ value: UserCategory; label: string; count: string }>;
  users: UserRecord[];
  filterOptions: {
    role: Array<{ label: string; value: UserFilters["role"] }>;
    status: Array<{ label: string; value: UserFilters["status"] }>;
    verification: Array<{ label: string; value: UserFilters["verification"] }>;
    city: Array<{ label: string; value: UserFilters["city"] }>;
    joinedDate: Array<{ label: string; value: UserFilters["joinedDate"] }>;
    rowsPerPage: Array<{ label: string; value: number }>;
  };
  roleOptions: Array<{ label: string; value: string }>;
  permissionItems: PermissionItem[];
  summaryCards: {
    riskMonitor: UserSummaryCard;
    verificationQueue: UserSummaryCard;
    linkedTickets: UserSummaryCard;
  };
  initialFilters: UserFilters;
  initialCategory: UserCategory;
  initialUserId: string;
};
