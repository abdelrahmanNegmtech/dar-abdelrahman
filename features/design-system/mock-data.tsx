import {
  Building2,
  CircleDollarSign,
  Clock3,
  Users,
} from "lucide-react";

import { Avatar, Badge, Button, Card, StatusBadge } from "@/features/design-system/primitives";
import type { ChecklistItemData, KeyValueItem, TableColumn, TimelineItemData } from "@/features/design-system/types";

export const metricCards = [
  {
    label: "Total users",
    value: "18,420",
    icon: <Users className="size-5" />,
    trend: { value: "+8.4%", direction: "up" as const, label: "vs last month" },
  },
  {
    label: "Owners",
    value: "1,930",
    icon: <Building2 className="size-5" />,
    trend: { value: "+5.1%", direction: "up" as const, label: "vs last month" },
  },
  {
    label: "Pending review",
    value: "126",
    icon: <Clock3 className="size-5" />,
    trend: { value: "-12.6%", direction: "down" as const, label: "vs last month" },
  },
  {
    label: "Revenue tracked",
    value: "EGP 8.4M",
    icon: <CircleDollarSign className="size-5" />,
    trend: { value: "+10.2%", direction: "up" as const, label: "vs last month" },
  },
];

export type AdminUserRow = {
  id: string;
  user: { name: string; code: string; email: string; phone: string };
  role: "Guest" | "Owner" | "Broker" | "Hotel";
  city: string;
  verification: string;
  bookings: string;
  lastActivity: string;
  risk: "Low" | "Medium" | "High";
  status:
    | "active"
    | "pending"
    | "payment-review"
    | "disputed"
    | "suspended";
};

export const adminUsers: AdminUserRow[] = [
  {
    id: "USR-100245",
    user: {
      name: "Ismail Negm",
      code: "USR-100245",
      email: "ismail@example.com",
      phone: "+49 176 1234567",
    },
    role: "Guest",
    city: "Cairo / Berlin",
    verification: "Email + phone verified",
    bookings: "3 bookings",
    lastActivity: "Today, 2 min ago",
    risk: "Low",
    status: "active",
  },
  {
    id: "USR-100198",
    user: {
      name: "Ahmed Hassan",
      code: "USR-100198",
      email: "ahmed.hassan@example.com",
      phone: "+20 101 234 5678",
    },
    role: "Owner",
    city: "Cairo",
    verification: "Owner verification pending",
    bookings: "8 listings",
    lastActivity: "10 min ago",
    risk: "Medium",
    status: "pending",
  },
  {
    id: "USR-100776",
    user: {
      name: "Dina Mostafa",
      code: "USR-100776",
      email: "dina@agency.eg",
      phone: "+20 100 987 6543",
    },
    role: "Broker",
    city: "New Capital",
    verification: "Verified broker",
    bookings: "24 listings",
    lastActivity: "Yesterday, 6:20 PM",
    risk: "Low",
    status: "active",
  },
  {
    id: "USR-099876",
    user: {
      name: "Karim Adel",
      code: "USR-099876",
      email: "karim@example.com",
      phone: "+20 102 555 8899",
    },
    role: "Guest",
    city: "Giza",
    verification: "Phone only",
    bookings: "1 booking",
    lastActivity: "12 days ago",
    risk: "High",
    status: "suspended",
  },
];

export const adminUserColumns: Array<TableColumn<AdminUserRow>> = [
  {
    key: "user",
    header: "User",
    className: "min-w-[18rem]",
    render: (row) => (
      <div className="flex items-start gap-3">
        <Avatar name={row.user.name} size="sm" />
        <div className="space-y-1">
          <p className="font-semibold text-foreground">{row.user.name}</p>
          <p className="text-xs text-foreground-muted">{row.user.code}</p>
        </div>
      </div>
    ),
  },
  {
    key: "role",
    header: "Role",
    render: (row) => (
      <Badge
        tone={
          row.role === "Owner"
            ? "warning"
            : row.role === "Broker"
              ? "info"
              : row.role === "Hotel"
                ? "brand"
                : "neutral"
        }
      >
        {row.role}
      </Badge>
    ),
  },
  {
    key: "contact",
    header: "Contact",
    className: "min-w-[14rem]",
    render: (row) => (
      <div className="space-y-1 text-sm">
        <p>{row.user.email}</p>
        <p className="text-foreground-muted">{row.user.phone}</p>
      </div>
    ),
  },
  {
    key: "city",
    header: "City",
    render: (row) => row.city,
  },
  {
    key: "verification",
    header: "Verification",
    className: "min-w-[11rem]",
    render: (row) => row.verification,
  },
  {
    key: "bookings",
    header: "Bookings / Listings",
    render: (row) => row.bookings,
  },
  {
    key: "last-activity",
    header: "Last activity",
    render: (row) => row.lastActivity,
  },
  {
    key: "risk",
    header: "Risk",
    render: (row) => (
      <Badge
        tone={
          row.risk === "Low" ? "success" : row.risk === "Medium" ? "warning" : "danger"
        }
      >
        {row.risk}
      </Badge>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (row) => <StatusBadge status={row.status}>{row.status.replace(/-/g, " ")}</StatusBadge>,
  },
  {
    key: "actions",
    header: "Actions",
    render: (row) => (
      <Button
        variant={row.status === "pending" ? "primary" : "outline"}
        size="sm"
      >
        {row.status === "pending" ? "Review" : "View"}
      </Button>
    ),
  },
];

export const rightPanelSummary: KeyValueItem[] = [
  { label: "Listings", value: "8" },
  { label: "Booking requests", value: "14" },
  { label: "Revenue", value: "EGP 48,750" },
  { label: "Rating", value: "4.8 / 5" },
];

export const rightPanelChecklist: ChecklistItemData[] = [
  { id: "phone", label: "Phone verified", state: "verified" },
  { id: "email", label: "Email verified", state: "verified" },
  { id: "id", label: "ID uploaded", state: "verified" },
  { id: "auth", label: "Authorization letter", description: "Missing", state: "missing" },
  { id: "payout", label: "Payout method", description: "Pending", state: "pending" },
];

export const rightPanelTimeline: TimelineItemData[] = [
  {
    id: "created",
    title: "Account created",
    description: "Initial registration completed.",
    timestamp: "Apr 18, 2024 - 09:15 AM",
    state: "completed",
  },
  {
    id: "listing",
    title: "Listing submitted",
    description: "The first property is pending admin review.",
    timestamp: "Apr 20, 2024 - 02:33 PM",
    state: "completed",
  },
  {
    id: "payment",
    title: "Payment method added",
    description: "Awaiting final account verification.",
    timestamp: "Apr 22, 2024 - 11:05 AM",
    state: "current",
  },
  {
    id: "docs",
    title: "Authorization letter requested",
    description: "Admin asked for one additional ownership document.",
    timestamp: "May 18, 2024 - 10:24 AM",
    state: "alert",
  },
];

export function DetailPanelHeader() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Avatar name="Ahmed Hassan" size="lg" />
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-semibold text-foreground">Ahmed Hassan</h3>
            <Badge tone="warning">Owner</Badge>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <StatusBadge status="pending">Pending verification</StatusBadge>
          </div>
          <p className="mt-2 text-sm text-foreground-muted">User ID: USR-100198</p>
          <p className="text-sm text-foreground-muted">Joined: Apr 18, 2024</p>
        </div>
      </div>
    </div>
  );
}

export function RightPanelActions() {
  return (
    <div className="grid gap-3">
      <Button variant="primary">Approve owner</Button>
      <Button variant="warning">Request documents</Button>
      <Button variant="danger-outline">Suspend account</Button>
      <Button variant="outline">Reset password</Button>
    </div>
  );
}

export const showcaseTabs = [
  { value: "all", label: "All", count: "18,420" },
  { value: "guests", label: "Guests", count: "15,860" },
  { value: "owners", label: "Owners", count: "1,930" },
  { value: "brokers", label: "Brokers", count: "420" },
  { value: "pending", label: "Pending verification", count: "126" },
];

export function DarkCardPreview() {
  return (
    <Card tone="dark" padding="lg" className="space-y-3 border-white/8 bg-surface-dark">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Dark surface card</p>
        <Badge tone="brand">Admin theme</Badge>
      </div>
      <p className="text-sm leading-6 text-[#c2cae1]">
        Matches the darker administrative sidebar and support card treatment used across the management screens.
      </p>
      <Button variant="outline" size="sm" className="border-white/10 bg-transparent text-white hover:bg-white/8">
        View details
      </Button>
    </Card>
  );
}

export function LightCardPreview() {
  return (
    <Card padding="lg" className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Light surface card</p>
        <Badge tone="success">Primary content</Badge>
      </div>
      <p className="text-sm leading-6 text-foreground-muted">
        Shared light-card treatment used by filters, tables, metric summaries, and contextual detail blocks.
      </p>
      <Button variant="outline" size="sm">
        Review usage
      </Button>
    </Card>
  );
}

export const componentStateExamples = {
  defaultInput: "admin@dar.com",
  disabledInput: "Read-only field",
  errorInput: "verification@example.com",
};
