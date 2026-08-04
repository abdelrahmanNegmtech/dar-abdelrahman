"use client";

import type { TableColumn } from "@/features/design-system";
import { Avatar, Badge, StatusBadge } from "@/features/design-system";

import type { UserRecord } from "../types";

function RoleBadge({ user }: { user: UserRecord }) {
  const tone =
    user.role === "owner"
      ? "warning"
      : user.role === "broker"
        ? "info"
        : user.role === "hotel"
          ? "brand"
          : "neutral";

  const label =
    user.role === "owner"
      ? "Owner"
      : user.role === "broker"
        ? "Broker"
        : user.role === "hotel"
          ? "Hotel"
          : user.role === "admin"
            ? "Admin"
            : "Guest";

  return <Badge tone={tone}>{label}</Badge>;
}

function RiskBadge({ risk }: Pick<UserRecord, "risk">) {
  const tone = risk === "low" ? "success" : risk === "medium" ? "warning" : "danger";

  return <Badge tone={tone}>{risk[0].toUpperCase() + risk.slice(1)}</Badge>;
}

function RowActionSelect({ value }: { value: string }) {
  return (
    <select
      aria-label={`Row action for ${value}`}
      defaultValue="view"
      className="rounded-[var(--radius-md)] border border-border/90 bg-white px-3 py-2 text-sm font-medium text-foreground shadow-[0_1px_2px_rgba(16,25,58,0.04)] hover:border-border-strong"
    >
      <option value="view">View</option>
      <option value="review">Review</option>
      <option value="suspend">Suspend</option>
    </select>
  );
}

export function createUserColumns(): Array<TableColumn<UserRecord>> {
  return [
    {
      key: "user",
      header: "User",
      className: "min-w-[16rem]",
      render: (row) => (
        <div className="flex items-start gap-3">
          <Avatar name={row.name} size="sm" />
          <div className="space-y-1">
            <p className="font-semibold text-foreground">{row.name}</p>
            <p className="text-xs text-foreground-muted">ID: {row.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (row) => <RoleBadge user={row} />,
    },
    {
      key: "contact",
      header: "Contact",
      className: "min-w-[15rem]",
      render: (row) => (
        <div className="space-y-1">
          <p className="text-sm text-foreground">{row.email}</p>
          <p className="text-xs text-foreground-muted">{row.phone}</p>
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
      className: "min-w-[13rem]",
      render: (row) => row.verificationLabel,
    },
    {
      key: "bookings",
      header: "Bookings / Listings",
      render: (row) => row.bookingsOrListings,
    },
    {
      key: "activity",
      header: "Last activity",
      render: (row) => row.lastActivity,
    },
    {
      key: "risk",
      header: "Risk score",
      render: (row) => <RiskBadge risk={row.risk} />,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <StatusBadge status={row.statusVariant}>
          {row.status.replace(/-/g, " ")}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => <RowActionSelect value={row.name} />,
    },
  ];
}
