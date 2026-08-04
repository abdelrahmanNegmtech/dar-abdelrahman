"use client";

import { useMemo, useState } from "react";

import {
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Hotel,
  TriangleAlert,
  UserRound,
  Users,
  UserX,
} from "lucide-react";

import {
  Avatar,
  Badge,
  AdminBrand,
  AppShell,
  Button,
  Checkbox,
  MetricCard,
  PageContainer,
  SearchInput,
  Select,
  Sidebar,
  SidebarSupportCard,
} from "@/features/design-system";

import { usersManagementData, usersMetricIcons } from "../data/users-management.data";
import type { UserCategory, UserFilters, UserRecord } from "../types";
import { UsersDetailPanel } from "./users-detail-panel";
import { UsersLowerPanels } from "./users-lower-panels";
import { UsersTopbar } from "./users-topbar";

const METRIC_ICON_MAP = {
  users: Users,
  guest: UserRound,
  owner: Building2,
  broker: BarChart3,
  hotel: Hotel,
  suspended: UserX,
} satisfies Record<keyof typeof usersMetricIcons, typeof Users>;

const REFERENCE_DATE = new Date("2026-07-22T12:00:00Z");

const compactRoleOptions = [{ label: "All roles", value: "all" }];
const compactStatusOptions = [
  { label: "Active / Pending / Suspended", value: "all" },
];
const compactVerificationOptions = [
  { label: "Verified / Unverified", value: "all" },
];
const compactCityOptions = [
  { label: "Cairo / Madinaty / New Capital", value: "all" },
];
const compactJoinedDateOptions = [
  { label: "May 1, 2024 – May 20, 2026", value: "all-time" },
];

function CompactRoleBadge({ user }: { user: UserRecord }) {
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

  return <Badge tone={tone} className="rounded-[0.4rem] px-2 py-0.5 text-[11px] shadow-none">{label}</Badge>;
}

function CompactRiskBadge({ risk }: { risk: UserRecord["risk"] }) {
  const tone = risk === "low" ? "success" : risk === "medium" ? "warning" : "danger";
  const label = risk[0].toUpperCase() + risk.slice(1);

  return <Badge tone={tone} className="px-2 py-0.5 text-[11px] shadow-none">{label}</Badge>;
}

function CompactStatusBadge({ user }: { user: UserRecord }) {
  if (user.id === "USR-099876") {
    return (
      <Badge tone="danger" className="px-2 py-0.5 text-[10px] capitalize shadow-none">
        Flagged
      </Badge>
    );
  }

  const tone =
    user.statusVariant === "active"
      ? "success"
      : user.statusVariant === "pending"
        ? "warning"
        : user.statusVariant === "suspended"
          ? "danger"
          : "neutral";

  return (
    <Badge tone={tone} className="px-2 py-0.5 text-[11px] capitalize shadow-none">
      {user.status.replace(/-/g, " ")}
    </Badge>
  );
}

function CompactRowAction({ user }: { user: UserRecord }) {
  return (
    <button
      type="button"
      aria-label={`Action for ${user.name}`}
      className="inline-flex h-7 min-w-[68px] items-center justify-center gap-1 rounded-[0.4rem] border border-border/90 bg-white px-2.5 text-[11px] font-medium text-foreground shadow-none"
    >
      <span>{user.id === "USR-099876" || user.status === "pending" ? "Review" : "View"}</span>
      <ChevronDown className="size-3 text-foreground-subtle" />
    </button>
  );
}

function filterByCategory(user: UserRecord, category: UserCategory) {
  switch (category) {
    case "guests":
      return user.role === "guest";
    case "owners":
      return user.role === "owner";
    case "brokers":
      return user.role === "broker";
    case "hotels":
      return user.role === "hotel";
    case "admins":
      return user.role === "admin";
    case "suspended":
      return user.status === "suspended";
    case "pending":
      return user.status === "pending";
    default:
      return true;
  }
}

function filterByJoinedDate(user: UserRecord, joinedDate: UserFilters["joinedDate"]) {
  if (joinedDate === "all" || joinedDate === "all-time") {
    return true;
  }

  const userDate = new Date(user.joinedDate);
  const diffDays = Math.floor(
    (REFERENCE_DATE.getTime() - userDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (joinedDate === "30-days") {
    return diffDays <= 30;
  }

  if (joinedDate === "12-months") {
    return diffDays <= 365;
  }

  return true;
}

export function UsersManagementWorkspace() {
  const [filters, setFilters] = useState(usersManagementData.initialFilters);
  const [category, setCategory] = useState<UserCategory>(usersManagementData.initialCategory);
  const [selectedUserId, setSelectedUserId] = useState(usersManagementData.initialUserId);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([
    usersManagementData.initialUserId,
  ]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [adminNote, setAdminNote] = useState("");

  const filteredUsers = useMemo(() => {
    const normalizedSearch = filters.search.trim().toLowerCase();

    return usersManagementData.users.filter((user) => {
      const matchesSearch =
        !normalizedSearch ||
        [user.name, user.id, user.email, user.phone].some((value) =>
          value.toLowerCase().includes(normalizedSearch),
        );

      const matchesRole = filters.role === "all" || user.role === filters.role;
      const matchesStatus = filters.status === "all" || user.status === filters.status;
      const matchesVerification =
        filters.verification === "all" || user.verificationState === filters.verification;
      const matchesCity =
        filters.city === "all" ||
        user.city.toLowerCase().replace(/\s+/g, "-").includes(filters.city);
      const matchesJoinedDate = filterByJoinedDate(user, filters.joinedDate);
      const matchesCategory = filterByCategory(user, category);

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus &&
        matchesVerification &&
        matchesCity &&
        matchesJoinedDate &&
        matchesCategory
      );
    });
  }, [category, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);
  const effectiveSelectedUserId =
    filteredUsers.length === 0
      ? selectedUserId
      : filteredUsers.some((user) => user.id === selectedUserId)
        ? selectedUserId
        : filteredUsers[0].id;

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredUsers.slice(start, start + rowsPerPage);
  }, [currentPage, filteredUsers, rowsPerPage]);

  const selectedUser =
    usersManagementData.users.find((user) => user.id === effectiveSelectedUserId) ??
    usersManagementData.users[0];

  const allVisibleRowsSelected =
    paginatedUsers.length > 0 &&
    paginatedUsers.every((user) => selectedRowIds.includes(user.id));

  function updateFilter<K extends keyof UserFilters>(key: K, value: UserFilters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  }

  function clearFilters() {
    setFilters(usersManagementData.initialFilters);
    setCategory(usersManagementData.initialCategory);
    setPage(1);
  }

  function toggleRowSelection(rowId: string) {
    setSelectedRowIds((current) =>
      current.includes(rowId)
        ? current.filter((id) => id !== rowId)
        : [...current, rowId],
    );
    setSelectedUserId(rowId);
  }

  function toggleAllVisibleRows() {
    const visibleIds = paginatedUsers.map((user) => user.id);

    setSelectedRowIds((current) =>
      allVisibleRowsSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...current, ...visibleIds])),
    );
  }

  return (
    <AppShell
      mainClassName="bg-white py-3 md:py-4"
      sidebar={
        <Sidebar
          brand={<AdminBrand />}
          groups={usersManagementData.sidebarGroups}
          footer={<SidebarSupportCard />}
          theme="dark"
        />
      }
      topbar={<UsersTopbar />}
    >
      <PageContainer className="space-y-6 pt-1 md:pt-2">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {usersManagementData.metrics.map((metric) => {
            const Icon = METRIC_ICON_MAP[metric.icon];

            return (
              <MetricCard
                key={metric.key}
                icon={<Icon className="size-[1.15rem]" />}
                label={metric.label}
                value={metric.value}
                accent={metric.accent}
                compact
                trend={{
                  value: metric.trendValue,
                  direction: metric.trendDirection,
                  label: metric.trendLabel,
                }}
              />
            );
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,360px)]">
          <div className="min-w-0 space-y-6">
            <section className="rounded-[0.55rem] border border-border/90 bg-white p-4 shadow-[0_1px_4px_rgba(16,25,58,0.03)]">
              <div className="space-y-3">
                <SearchInput
                  aria-label="Search users"
                  placeholder="Search by name, email, phone, user ID."
                  value={filters.search}
                  onChange={(event) => updateFilter("search", event.target.value)}
                  containerClassName="h-9 rounded-[0.4rem] px-3 shadow-none [&_svg]:size-4"
                  className="h-9 text-[11px]"
                />

                <div className="grid gap-x-3 gap-y-2.5 md:grid-cols-2 lg:grid-cols-[minmax(110px,0.9fr)_minmax(145px,1.15fr)_minmax(130px,1fr)_minmax(170px,1.35fr)_minmax(180px,1.4fr)] lg:gap-y-0 lg:items-end">
                  <div className="min-w-0">
                    <label className="mb-1 block text-[10px] font-medium leading-none text-foreground-muted">
                      Role
                    </label>
                    <Select
                      aria-label="Role filter"
                      value={filters.role}
                      onChange={(event) =>
                        updateFilter("role", event.target.value as UserFilters["role"])
                      }
                      options={compactRoleOptions}
                      className="h-9 rounded-[0.4rem] px-3 text-[11px]"
                    />
                  </div>

                  <div className="min-w-0">
                    <label className="mb-1 block text-[10px] font-medium leading-none text-foreground-muted">
                      Status
                    </label>
                    <Select
                      aria-label="Status filter"
                      value={filters.status}
                      onChange={(event) =>
                        updateFilter("status", event.target.value as UserFilters["status"])
                      }
                      options={compactStatusOptions}
                      className="h-9 rounded-[0.4rem] px-3 text-[11px]"
                    />
                  </div>

                  <div className="min-w-0">
                    <label className="mb-1 block text-[10px] font-medium leading-none text-foreground-muted">
                      Verification
                    </label>
                    <Select
                      aria-label="Verification filter"
                      value={filters.verification}
                      onChange={(event) =>
                        updateFilter(
                          "verification",
                          event.target.value as UserFilters["verification"],
                        )
                      }
                      options={compactVerificationOptions}
                      className="h-9 rounded-[0.4rem] px-3 text-[11px]"
                    />
                  </div>

                  <div className="min-w-0">
                    <label className="mb-1 block text-[10px] font-medium leading-none text-foreground-muted">
                      City
                    </label>
                    <Select
                      aria-label="City filter"
                      value={filters.city}
                      onChange={(event) =>
                        updateFilter("city", event.target.value as UserFilters["city"])
                      }
                      options={compactCityOptions}
                      className="h-9 rounded-[0.4rem] px-3 text-[11px]"
                    />
                  </div>

                  <div className="min-w-0">
                    <label className="mb-1 block text-[10px] font-medium leading-none text-foreground-muted">
                      Date joined
                    </label>
                    <div className="relative">
                      <CalendarDays className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-foreground-subtle" />
                      <Select
                        aria-label="Date joined filter"
                        value={filters.joinedDate}
                        onChange={(event) =>
                          updateFilter(
                            "joinedDate",
                            event.target.value as UserFilters["joinedDate"],
                          )
                        }
                        options={compactJoinedDateOptions}
                        className="h-9 rounded-[0.4rem] pl-8 pr-8 text-[11px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="primary" size="sm" className="h-9 rounded-[0.4rem] px-3.5 text-[11px]">
                    Apply filters
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-[0.4rem] px-3.5 text-[11px]"
                    onClick={clearFilters}
                  >
                    Clear all
                  </Button>
                </div>
              </div>
            </section>

            <section className="rounded-[0.75rem] border border-border/90 bg-white px-3 py-2 shadow-[0_2px_10px_rgba(16,25,58,0.03)]">
              <div className="space-y-1.5">
                <h2 className="text-[16px] font-semibold tracking-tight text-foreground">
                  All users.
                </h2>

                <div className="flex flex-wrap items-center gap-x-1 gap-y-1 border-b border-[#E5E7EB]">
                  {usersManagementData.categoryTabs.map((item) => {
                    const isActive = item.value === category;

                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => {
                          setCategory(item.value as UserCategory);
                          setPage(1);
                        }}
                        className={`relative inline-flex items-center px-2 pb-2.5 pt-1.5 text-[13px] leading-none ${
                          isActive
                            ? "text-brand"
                            : "text-[#475569] hover:text-foreground"
                        }`}
                      >
                        <span
                          className={`transition-colors duration-200 ${
                            isActive ? "font-semibold text-brand" : "font-medium text-inherit"
                          }`}
                        >
                          {item.label}
                        </span>
                        {isActive ? (
                          <span className="absolute left-0 right-0 -bottom-px h-0.5 rounded-full bg-brand" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                {paginatedUsers.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <p className="text-[1.02rem] font-semibold tracking-tight text-foreground">
                      No users match the current filters
                    </p>
                    <p className="mt-2 text-sm text-foreground-muted">
                      Try clearing one or more filters to review more accounts.
                    </p>
                    <div className="mt-4">
                      <Button variant="outline" onClick={clearFilters}>
                        Clear filters
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-separate border-spacing-0">
                        <thead>
                          <tr className="bg-transparent text-left text-[8px] font-semibold uppercase tracking-[0.12em] text-foreground-muted">
                            <th className="h-[36px] w-8 px-2 py-2">
                              <Checkbox
                                id="users-select-all"
                                label=""
                                aria-label="Select all rows"
                                checked={allVisibleRowsSelected}
                                onChange={toggleAllVisibleRows}
                              />
                            </th>
                            <th className="h-[36px] min-w-[168px] pl-2 pr-1 py-2 text-[9px]">User</th>
                            <th className="h-[36px] pl-1 pr-3 py-2 text-[9px]">Role</th>
                            <th className="h-[36px] min-w-[175px] px-3 py-2 text-[9px]">Contact</th>
                            <th className="h-[36px] px-3 py-2 text-[9px]">City</th>
                            <th className="h-[36px] min-w-[170px] px-3 py-2 text-[9px]">Verification</th>
                            <th className="h-[36px] px-3 py-2 text-[9px]">Bookings / Listings</th>
                            <th className="h-[36px] px-3 py-2 text-[9px]">Last activity</th>
                            <th className="h-[36px] px-3 py-2 text-[9px]">Risk score</th>
                            <th className="h-[36px] px-3 py-2 text-[9px]">Status</th>
                            <th className="h-[36px] px-3 py-2 text-[9px]">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedUsers.map((row) => {
                            const selected = selectedRowIds.includes(row.id);
                            const active = effectiveSelectedUserId === row.id;
                            const verificationIcon =
                              row.verificationState === "verified" ? (
                                <CheckCircle2 className="size-3.5 text-success" />
                              ) : (
                                <Clock3 className="size-3.5 text-warning" />
                              );

                            return (
                              <tr
                                key={row.id}
                                aria-selected={active}
                                onClick={() => setSelectedUserId(row.id)}
                              className={`cursor-pointer text-[13px] text-foreground transition-colors ${
                                  active
                                    ? "bg-brand-soft/22 ring-1 ring-inset ring-brand/10"
                                    : selected
                                      ? "bg-brand-soft/14"
                                      : "bg-white hover:bg-[linear-gradient(180deg,rgba(248,250,253,0.88),rgba(245,248,252,0.96))]"
                                }`}
                              >
                                <td className="border-t border-border/80 px-2 py-3 align-top">
                                  <div onClick={(event) => event.stopPropagation()}>
                                    <Checkbox
                                      id={`users-select-${row.id}`}
                                      label=""
                                      aria-label={`Select user ${row.name}`}
                                      checked={selected}
                                      onChange={() => toggleRowSelection(row.id)}
                                    />
                                  </div>
                                </td>
                                <td className="border-t border-border/80 pl-2 pr-1 py-3 align-top">
                                  <div className="flex items-start gap-2.5">
                                    <Avatar name={row.name} size="sm" />
                                    <div className="space-y-0.5">
                                      <p className="text-[14px] font-semibold text-foreground">{row.name}</p>
                                      <p className="text-[11px] text-foreground-muted">ID: {row.id}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="border-t border-border/80 pl-1 pr-3 py-3 align-top">
                                  <CompactRoleBadge user={row} />
                                </td>
                                <td className="border-t border-border/80 px-3 py-3 align-top">
                                  <div className="space-y-0.5">
                                  <p className="text-[13px] text-foreground">{row.email}</p>
                                  <p className="text-[12px] text-foreground-muted">{row.phone}</p>
                                  </div>
                                </td>
                                <td className="border-t border-border/80 px-3 py-3 align-top">
                                  <span className="text-[12px] text-foreground">{row.city}</span>
                                </td>
                                <td className="border-t border-border/80 px-3 py-3 align-top">
                                  <div className="flex items-start gap-1.5">
                                    {row.id === "USR-099876" ? (
                                      <TriangleAlert className="mt-0.5 size-3.5 text-warning" />
                                    ) : (
                                      <span className="mt-0.5">{verificationIcon}</span>
                                    )}
                                    <span className="text-[13px] text-foreground">{row.verificationLabel}</span>
                                  </div>
                                </td>
                                <td className="border-t border-border/80 px-3 py-3 align-top">
                                  <span className="text-[12px] text-foreground">{row.bookingsOrListings}</span>
                                </td>
                                <td className="border-t border-border/80 px-3 py-3 align-top">
                                  <span className="text-[12px] text-foreground">{row.lastActivity}</span>
                                </td>
                                <td className="border-t border-border/80 px-3 py-3 align-top">
                                  <CompactRiskBadge risk={row.risk} />
                                </td>
                                <td className="border-t border-border/80 px-3 py-3 align-top">
                                  <CompactStatusBadge user={row} />
                                </td>
                                <td className="border-t border-border/80 px-3 py-3 align-top">
                                  <CompactRowAction user={row} />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-border/80 pt-3 xl:flex-row xl:items-center xl:justify-between">
                      <p className="text-[12px] font-medium text-foreground-muted">
                        Showing 1 to 5 of 18,420 users
                      </p>
                      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:gap-4">
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === 1}
                            className="h-8 rounded-[0.4rem] px-2.5 text-[11px]"
                            onClick={() => setPage(currentPage - 1)}
                          >
                            Previous
                          </Button>
                          {[1, 2, 3, 4, 5].map((pageNumber) => (
                            <Button
                              key={pageNumber}
                              variant={currentPage === pageNumber ? "primary" : "outline"}
                              size="sm"
                              className="h-8 min-w-8 rounded-[0.4rem] px-0 text-[11px]"
                              onClick={() => setPage(pageNumber)}
                            >
                              {pageNumber}
                            </Button>
                          ))}
                          <span className="px-1 text-[11px] text-foreground-muted">...</span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 min-w-8 rounded-[0.4rem] px-0 text-[11px]"
                            onClick={() => setPage(totalPages)}
                          >
                            {totalPages}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === totalPages}
                            className="h-8 rounded-[0.4rem] px-2.5 text-[11px]"
                            onClick={() => setPage(currentPage + 1)}
                          >
                            Next
                          </Button>
                        </div>
                        <div className="w-full max-w-[98px] xl:w-[98px]">
                          <Select
                            aria-label="Rows per page"
                            value={String(rowsPerPage)}
                            onChange={(event) => {
                              setRowsPerPage(Number(event.target.value));
                              setPage(1);
                            }}
                            options={usersManagementData.filterOptions.rowsPerPage.map((option) => ({
                              label: option.label,
                              value: String(option.value),
                            }))}
                            className="h-8 rounded-[0.4rem] text-[11px]"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </section>

            <UsersLowerPanels
              roleOptions={usersManagementData.roleOptions}
              permissionItems={usersManagementData.permissionItems}
              selectedCount={selectedRowIds.length}
              user={selectedUser}
            />
          </div>

          <div className="min-w-0">
            <UsersDetailPanel
              user={selectedUser}
              adminNote={adminNote}
              onAdminNoteChange={setAdminNote}
              summaries={usersManagementData.summaryCards}
            />
          </div>
        </div>
      </PageContainer>
    </AppShell>
  );
}
