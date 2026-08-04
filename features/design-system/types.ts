import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type SidebarTheme = "dark" | "light";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "success"
  | "warning"
  | "warning-outline"
  | "danger"
  | "danger-outline";

export type ButtonSize = "sm" | "md" | "lg";

export type CardVariant =
  | "standard"
  | "metric"
  | "summary"
  | "action"
  | "profile"
  | "alert";

export type CardTone = "light" | "dark";

export type StatusVariant =
  | "active"
  | "confirmed"
  | "completed"
  | "approved"
  | "live"
  | "pending"
  | "under-review"
  | "payment-review"
  | "processing"
  | "rejected"
  | "cancelled"
  | "failed"
  | "disputed"
  | "suspended"
  | "draft"
  | "open";

export type BadgeTone =
  | "neutral"
  | "brand"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type RiskLevel = "low" | "medium" | "high";

export type VerificationState = "verified" | "pending" | "missing";

export type TabItem = {
  value: string;
  label: string;
  count?: string | number;
  href?: string;
  icon?: LucideIcon;
};

export type SidebarLink = {
  label: string;
  href: string;
  icon?: LucideIcon;
  badge?: string | number;
  active?: boolean;
  children?: SidebarLink[];
};

export type SidebarGroup = {
  title?: string;
  items: SidebarLink[];
};

export type MetricCardTrend = {
  value: string;
  direction: "up" | "down" | "neutral";
  label: string;
};

export type ChecklistItemData = {
  id: string;
  label: string;
  description?: string;
  state: VerificationState;
};

export type TimelineItemData = {
  id: string;
  title: string;
  description?: string;
  timestamp?: string;
  state: "completed" | "current" | "upcoming" | "alert";
};

export type KeyValueItem = {
  label: string;
  value: ReactNode;
  hint?: string;
};

export type TableColumn<T> = {
  key: string;
  header: string;
  className?: string;
  mobileLabel?: string;
  render: (row: T) => ReactNode;
};
