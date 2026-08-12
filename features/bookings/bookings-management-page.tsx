"use client";

import { useMemo, useState } from "react";

import {
  AlertCircle,
  ArrowUpRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Download,
  Globe,
  Landmark,
  Plus,
  WalletCards,
  XCircle,
} from "lucide-react";

import {
  AdminBrand,
  AppShell,
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Checklist,
  MetricCard,
  PageContainer,
  SearchInput,
  Select,
  Separator,
  Sidebar,
  SidebarSupportCard,
  Textarea,
  Timeline,
} from "@/features/design-system";

import { bookingsManagementData } from "./data/bookings-management.data";
import type { BookingMetric, BookingRecord, BookingStatus, BookingsPageData } from "./types";

const METRIC_ICONS = {
  calendar: CalendarDays,
  pending: Clock3,
  confirmed: CheckCircle2,
  wallet: WalletCards,
  cancelled: XCircle,
  disputes: AlertCircle,
  revenue: CircleDollarSign,
} as const;

function BookingsTopbar() {
  return (
    <header className="bg-white px-4 py-3 md:px-6">
      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          className="relative inline-flex size-10 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-[0_2px_8px_rgba(16,25,58,0.04)]"
          aria-label="Notifications"
        >
          <Bell className="size-4.5" />
          <span className="absolute right-2 top-1.5 size-2 rounded-full bg-brand" />
        </button>
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-2 text-sm text-foreground shadow-[0_2px_8px_rgba(16,25,58,0.04)]">
          <Globe className="size-4" />
          <span>English / EGP</span>
          <ChevronDown className="size-4 text-foreground-subtle" />
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-2.5 py-1.5 shadow-[0_2px_8px_rgba(16,25,58,0.04)]">
          <Avatar name="Admin Team" size="sm" />
          <ChevronDown className="size-4 text-foreground-subtle" />
        </div>
      </div>
    </header>
  );
}

function BookingsHeader() {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 className="text-[2rem] font-semibold tracking-[-0.03em] text-foreground">
          Bookings management.
        </h1>
        <p className="mt-1.5 text-sm text-foreground-muted">
          Monitor booking requests, confirmations, cancellations, payments and disputes.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="md" leadingIcon={<Download className="size-4" />}>
          Export bookings
        </Button>
        <Button variant="primary" size="md" leadingIcon={<Plus className="size-4" />}>
          Create manual booking
        </Button>
      </div>
    </div>
  );
}

function metricAccent(metric: BookingMetric) {
  return metric.accent;
}

function bookingStatusBadge(status: BookingStatus) {
  switch (status) {
    case "payment-review":
      return <Badge tone="warning">Payment review</Badge>;
    case "pending-approval":
      return <Badge tone="warning">Pending approval</Badge>;
    case "confirmed":
      return <Badge tone="success">Confirmed</Badge>;
    case "completed":
      return <Badge tone="success">Completed</Badge>;
    case "disputed":
      return <Badge tone="danger">Disputed</Badge>;
    default:
      return <Badge tone="neutral">Unknown</Badge>;
  }
}

function riskBadge(risk: BookingRecord["risk"]) {
  const tone = risk === "low" ? "success" : risk === "medium" ? "warning" : "danger";
  return (
    <Badge tone={tone} className="capitalize">
      {risk}
    </Badge>
  );
}

function paymentCell(row: BookingRecord) {
  const icon =
    row.paymentMeta === "pending" || row.paymentMeta === "receipt pending" ? (
      <Clock3 className="mt-0.5 size-3.5 text-warning" />
    ) : row.paymentMeta === "issue" ? (
      <AlertCircle className="mt-0.5 size-3.5 text-danger" />
    ) : (
      <CheckCircle2 className="mt-0.5 size-3.5 text-success" />
    );

  return (
    <div className="space-y-0.5">
      <div className="flex items-start gap-1.5">
        {icon}
        <div>
          <p className="text-[12px] font-medium text-foreground">{row.paymentLabel}</p>
          {row.paymentMeta ? <p className="text-[11px] text-foreground-muted">{row.paymentMeta}</p> : null}
        </div>
      </div>
    </div>
  );
}

function propertyThumbnail() {
  return (
    <div className="h-[4.75rem] w-[7.25rem] rounded-[0.75rem] bg-[linear-gradient(135deg,#a56a3c_0%,#d3b08b_20%,#5b4338_20%,#2f2c35_46%,#9f7f5f_46%,#d6c1a9_64%,#6e727d_64%,#31374a_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.28)]" />
  );
}

function PartyCard({
  title,
  party,
}: {
  title: string;
  party: NonNullable<BookingsPageData["details"][string]>["guest"];
}) {
  return (
    <Card variant="summary" padding="md" className="space-y-3 rounded-[0.95rem]">
      <p className="text-xs font-semibold text-foreground-muted">{title}</p>
      <div className="flex items-start gap-3">
        <Avatar name={party.name} size="sm" />
        <div className="min-w-0 space-y-0.5">
          <p className="text-sm font-semibold text-foreground">{party.name}</p>
          <p className="text-xs text-foreground-muted">{party.phone}</p>
          <p className="text-xs text-foreground-muted">{party.email}</p>
        </div>
      </div>
      <div className="space-y-2">
        {party.badges?.map((badge) => (
          <div key={badge.label} className="flex items-center gap-2 text-xs text-foreground-muted">
            {badge.tone === "success" ? (
              <CheckCircle2 className="size-3.5 text-success" />
            ) : (
              <AlertCircle className="size-3.5 text-warning" />
            )}
            <span>{badge.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function BookingsManagementPage({
  pageData = bookingsManagementData,
}: {
  pageData?: BookingsPageData;
}) {
  const [search, setSearch] = useState("");
  const [bookingStatus, setBookingStatus] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [propertyType, setPropertyType] = useState("all");
  const [city, setCity] = useState("all");
  const [dateRange, setDateRange] = useState(pageData.filters.checkInDate[0]?.value ?? "");
  const [risk, setRisk] = useState("all");
  const [activeTab, setActiveTab] = useState<BookingsPageData["tabs"][number]["value"]>("all");
  const [selectedBookingId, setSelectedBookingId] = useState(pageData.selectedBookingId);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([pageData.selectedBookingId]);
  const [rowsPerPage, setRowsPerPage] = useState("5");
  const [adminNotes, setAdminNotes] = useState("");

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return pageData.bookings.filter((booking) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          booking.id,
          booking.guestName,
          booking.ownerName,
          booking.propertyName,
          booking.guestPhone,
        ].some((value) => value.toLowerCase().includes(normalizedSearch));

      const matchesStatus = bookingStatus === "all" || booking.bookingStatus === bookingStatus;
      const matchesPayment = paymentStatus === "all" || booking.paymentStatus === paymentStatus;
      const matchesPropertyType = propertyType === "all" || booking.propertyType === propertyType;
      const matchesCity = city === "all" || booking.city === city;
      const matchesRisk = risk === "all" || booking.risk === risk;
      const matchesTab = activeTab === "all" || booking.statusCategory === activeTab;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPayment &&
        matchesPropertyType &&
        matchesCity &&
        matchesRisk &&
        matchesTab &&
        Boolean(dateRange)
      );
    });
  }, [activeTab, bookingStatus, city, dateRange, pageData.bookings, paymentStatus, propertyType, risk, search]);

  const visibleRows = filteredRows.slice(0, Number(rowsPerPage));
  const selectedBooking =
    pageData.details[selectedBookingId] ??
    pageData.details[pageData.selectedBookingId];
  const allVisibleSelected =
    visibleRows.length > 0 && visibleRows.every((row) => selectedRowIds.includes(row.id));

  function toggleRow(rowId: string) {
    setSelectedRowIds((current) =>
      current.includes(rowId) ? current.filter((id) => id !== rowId) : [...current, rowId],
    );
    setSelectedBookingId(rowId);
  }

  function toggleAllRows() {
    const visibleIds = visibleRows.map((row) => row.id);

    setSelectedRowIds((current) =>
      allVisibleSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...current, ...visibleIds])),
    );
  }

  function clearFilters() {
    setSearch("");
    setBookingStatus("all");
    setPaymentStatus("all");
    setPropertyType("all");
    setCity("all");
    setDateRange(pageData.filters.checkInDate[0]?.value ?? "");
    setRisk("all");
    setActiveTab("all");
  }

  return (
    <AppShell
      mainClassName="bg-white py-4 md:py-5"
      sidebar={
        <Sidebar
          brand={<AdminBrand />}
          groups={pageData.sidebarGroups}
          footer={<SidebarSupportCard />}
          theme="dark"
        />
      }
      topbar={<BookingsTopbar />}
    >
      <PageContainer className="space-y-4">
        <BookingsHeader />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
          {pageData.metrics.map((metric) => {
            const Icon = METRIC_ICONS[metric.icon];

            return (
              <MetricCard
                key={metric.key}
                icon={<Icon className="size-[1.1rem]" />}
                label={metric.label}
                value={metric.value}
                accent={metricAccent(metric)}
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

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_412px]">
          <div className="min-w-0 space-y-4">
            <Card variant="summary" padding="md" className="space-y-4 rounded-[1rem]">
              <SearchInput
                aria-label="Search bookings"
                placeholder="Search by booking ID, guest, owner, property, phone..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                containerClassName="h-10 rounded-[0.65rem] px-3 shadow-none"
                className="h-10 text-[12px]"
              />

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                <Select
                  label="Booking status"
                  aria-label="Booking status"
                  value={bookingStatus}
                  onChange={(event) => setBookingStatus(event.target.value)}
                  options={pageData.filters.bookingStatus}
                  className="h-10 rounded-[0.65rem] text-[12px]"
                />
                <Select
                  label="Payment status"
                  aria-label="Payment status"
                  value={paymentStatus}
                  onChange={(event) => setPaymentStatus(event.target.value)}
                  options={pageData.filters.paymentStatus}
                  className="h-10 rounded-[0.65rem] text-[12px]"
                />
                <Select
                  label="Property type"
                  aria-label="Property type"
                  value={propertyType}
                  onChange={(event) => setPropertyType(event.target.value)}
                  options={pageData.filters.propertyType}
                  className="h-10 rounded-[0.65rem] text-[12px]"
                />
                <Select
                  label="City"
                  aria-label="City"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  options={pageData.filters.city}
                  className="h-10 rounded-[0.65rem] text-[12px]"
                />
                <Select
                  label="Check-in date"
                  aria-label="Check-in date"
                  value={dateRange}
                  onChange={(event) => setDateRange(event.target.value)}
                  options={pageData.filters.checkInDate}
                  className="h-10 rounded-[0.65rem] text-[12px]"
                />
                <Select
                  label="Risk level"
                  aria-label="Risk level"
                  value={risk}
                  onChange={(event) => setRisk(event.target.value)}
                  options={pageData.filters.riskLevel}
                  className="h-10 rounded-[0.65rem] text-[12px]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Apply filters</Button>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear all
                </Button>
              </div>
            </Card>

            <Card variant="summary" padding="md" className="rounded-[1rem]">
              <div className="space-y-3">
                <h2 className="text-[1.35rem] font-semibold tracking-tight text-foreground">
                  All bookings.
                </h2>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border pb-2">
                  {pageData.tabs.map((tab) => {
                    const active = tab.value === activeTab;

                    return (
                      <button
                        key={tab.value}
                        type="button"
                        onClick={() => setActiveTab(tab.value)}
                        className={`inline-flex items-center gap-2 rounded-full px-1 py-1 text-[12px] ${
                          active ? "text-brand" : "text-foreground-muted"
                        }`}
                      >
                        <span className={active ? "font-semibold" : "font-medium"}>{tab.label}</span>
                        {tab.count !== undefined ? (
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                              active ? "bg-brand-soft text-brand" : "bg-surface-strong text-foreground-muted"
                            }`}
                          >
                            {tab.count}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-0">
                    <thead>
                      <tr className="text-left text-[9px] font-semibold uppercase tracking-[0.12em] text-foreground-muted">
                        <th className="w-8 px-2 py-3">
                          <Checkbox
                            id="bookings-select-all"
                            label=""
                            aria-label="Select all bookings"
                            checked={allVisibleSelected}
                            onChange={toggleAllRows}
                          />
                        </th>
                        <th className="px-2 py-3">Booking ID</th>
                        <th className="px-2 py-3">Guest</th>
                        <th className="px-2 py-3">Property</th>
                        <th className="px-2 py-3">Owner</th>
                        <th className="px-2 py-3">Dates</th>
                        <th className="px-2 py-3">Total</th>
                        <th className="px-2 py-3">Payment</th>
                        <th className="px-2 py-3">Booking status</th>
                        <th className="px-2 py-3">Risk</th>
                        <th className="px-2 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleRows.map((row) => {
                        const isSelected = selectedRowIds.includes(row.id);
                        const isActive = selectedBookingId === row.id;

                        return (
                          <tr
                            key={row.id}
                            className={`cursor-pointer text-[12px] text-foreground ${
                              isActive
                                ? "bg-brand-soft/20"
                                : isSelected
                                  ? "bg-brand-soft/10"
                                  : "bg-white hover:bg-surface-muted/70"
                            }`}
                            onClick={() => setSelectedBookingId(row.id)}
                          >
                            <td className="border-t border-border/80 px-2 py-3 align-top">
                              <div onClick={(event) => event.stopPropagation()}>
                                <Checkbox
                                  id={`booking-${row.id}`}
                                  label=""
                                  aria-label={`Select ${row.id}`}
                                  checked={isSelected}
                                  onChange={() => toggleRow(row.id)}
                                />
                              </div>
                            </td>
                            <td className="border-t border-border/80 px-2 py-3 align-top font-medium text-foreground-muted">
                              {row.id}
                            </td>
                            <td className="border-t border-border/80 px-2 py-3 align-top">
                              <div className="flex items-start gap-2">
                                <Avatar name={row.guestName} size="sm" />
                                <div>
                                  <p className="font-medium text-foreground">{row.guestName}</p>
                                  <p className="text-[11px] text-foreground-muted">{row.guestPhone}</p>
                                </div>
                              </div>
                            </td>
                            <td className="border-t border-border/80 px-2 py-3 align-top">
                              <div className="space-y-0.5">
                                <p className="font-medium text-foreground">{row.propertyName}</p>
                                <p className="text-[11px] text-foreground-muted">{row.propertyArea}</p>
                              </div>
                            </td>
                            <td className="border-t border-border/80 px-2 py-3 align-top">
                              {row.ownerName}
                            </td>
                            <td className="border-t border-border/80 px-2 py-3 align-top">
                              <div className="space-y-0.5">
                                <p>{row.dateRange}</p>
                                <p className="text-[11px] text-foreground-muted">{row.nights}</p>
                              </div>
                            </td>
                            <td className="border-t border-border/80 px-2 py-3 align-top font-medium">
                              {row.total}
                            </td>
                            <td className="border-t border-border/80 px-2 py-3 align-top">
                              {paymentCell(row)}
                            </td>
                            <td className="border-t border-border/80 px-2 py-3 align-top">
                              {bookingStatusBadge(row.bookingStatus)}
                            </td>
                            <td className="border-t border-border/80 px-2 py-3 align-top">
                              {riskBadge(row.risk)}
                            </td>
                            <td className="border-t border-border/80 px-2 py-3 align-top">
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 rounded-[0.5rem] border border-border px-3 py-1.5 text-[11px] font-medium text-foreground"
                              >
                                {row.actionLabel}
                                <ChevronDown className="size-3.5 text-foreground-subtle" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col gap-3 border-t border-border pt-3 xl:flex-row xl:items-center xl:justify-between">
                  <p className="text-[12px] text-foreground-muted">
                    Showing 1 to {visibleRows.length} of 4,820 bookings
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" className="h-8 px-2">1</Button>
                      <Button size="sm" variant="outline" className="h-8 px-2">2</Button>
                      <Button size="sm" variant="outline" className="h-8 px-2">3</Button>
                      <Button size="sm" variant="outline" className="h-8 px-2">4</Button>
                      <Button size="sm" variant="outline" className="h-8 px-2">5</Button>
                      <span className="px-1 text-xs text-foreground-muted">...</span>
                      <Button size="sm" variant="outline" className="h-8 px-2">964</Button>
                    </div>
                    <div className="w-[110px]">
                      <Select
                        aria-label="Rows per page"
                        value={rowsPerPage}
                        onChange={(event) => setRowsPerPage(event.target.value)}
                        options={pageData.filters.rowsPerPage}
                        className="h-8 rounded-[0.55rem] text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid gap-4 xl:grid-cols-3">
              <Card variant="summary" padding="md" className="space-y-4 rounded-[1rem]">
                <h3 className="text-base font-semibold text-foreground">Booking timeline</h3>
                <Timeline items={selectedBooking.timeline} />
              </Card>

              <Card variant="summary" padding="md" className="space-y-4 rounded-[1rem]">
                <h3 className="text-base font-semibold text-foreground">Payment and refund</h3>
                <div className="space-y-3">
                  {selectedBooking.paymentBreakdown.map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-foreground-muted">{item.label}</span>
                      <span className={item.tone === "danger" ? "font-semibold text-danger" : "font-semibold text-foreground"}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="flex items-center justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>EGP 6,370</span>
                </div>
                <div className="space-y-3">
                  <div className="rounded-[0.8rem] border border-border bg-white px-4 py-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-brand">
                      <ArrowUpRight className="size-4" />
                      Refund eligibility
                    </div>
                    <p className="mt-1 text-sm text-foreground-muted">{selectedBooking.refundEligibility}</p>
                  </div>
                  <div className="rounded-[0.8rem] border border-warning/20 bg-warning-soft/35 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-warning">
                      <Landmark className="size-4" />
                      Owner payout status
                    </div>
                    <p className="mt-1 text-sm text-foreground-muted">{selectedBooking.payoutStatus}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="warning-outline" size="sm" className="flex-1">
                    Start refund
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" disabled>
                    Release payout
                  </Button>
                </div>
              </Card>

              <Card variant="summary" padding="md" className="space-y-4 rounded-[1rem]">
                <h3 className="text-base font-semibold text-foreground">Communication</h3>
                <div className="space-y-4">
                  {selectedBooking.communication.map((message) => (
                    <div key={message.id} className="flex items-start gap-3">
                      <Avatar name={message.sender} size="sm" />
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-foreground">
                            {message.sender} <span className="font-normal text-foreground-muted">({message.role})</span>
                          </p>
                          <span className="text-xs text-foreground-muted">{message.time}</span>
                        </div>
                        <p className="text-sm text-foreground-muted">{message.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <button type="button" className="text-sm font-semibold text-brand">
                    View all messages
                  </button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Button variant="outline" size="sm">
                    Open chat
                  </Button>
                  <Button variant="outline" size="sm">
                    Send system notification
                  </Button>
                </div>
              </Card>
            </div>

            <Card variant="summary" padding="md" className="rounded-[1rem]">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="bulk-selected"
                    label=""
                    aria-label="Bulk selection indicator"
                    checked={selectedRowIds.length > 0}
                    onChange={() => undefined}
                  />
                  <span className="text-sm font-medium text-foreground">{selectedRowIds.length} selected</span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="outline" size="sm" leadingIcon={<Download className="size-4" />}>
                    Export selected
                  </Button>
                  <Button variant="outline" size="sm" leadingIcon={<Bell className="size-4" />}>
                    Send reminders
                  </Button>
                  <Button variant="outline" size="sm" leadingIcon={<CreditCard className="size-4" />}>
                    Verify payments
                  </Button>
                  <Button variant="danger-outline" size="sm">
                    Cancel selected
                  </Button>
                  <Button variant="outline" size="sm" trailingIcon={<ChevronDown className="size-4" />}>
                    More actions
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <div className="min-w-0">
            <Card variant="profile" padding="md" className="space-y-4 rounded-[1rem]">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[1.2rem] font-semibold tracking-tight text-foreground">
                  Booking details
                </h2>
                <Badge tone="warning">{selectedBooking.statusLabel}</Badge>
              </div>

              <div className="flex gap-4">
                {propertyThumbnail()}
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-foreground">{selectedBooking.propertyName}</h3>
                  <p className="mt-1 text-sm text-foreground-muted">{selectedBooking.propertyLocation}</p>
                  <p className="mt-2 text-sm text-warning">{selectedBooking.ratingLabel}</p>
                  <div className="mt-2 inline-flex items-center gap-2 text-sm text-success">
                    <CheckCircle2 className="size-4" />
                    <span>{selectedBooking.propertyVerifiedLabel}</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <PartyCard title="Guest" party={selectedBooking.guest} />
                <PartyCard title="Owner" party={selectedBooking.owner} />
              </div>

              <div className="space-y-3 text-sm">
                {selectedBooking.keyFacts.map((fact) => (
                  <div key={fact.label} className="flex items-start justify-between gap-4">
                    <span className="text-foreground-muted">{fact.label}</span>
                    <span className="text-right font-medium text-foreground">{fact.value}</span>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-[0.95fr_1.05fr]">
                <Card variant="summary" padding="md" className="space-y-4 rounded-[0.95rem]">
                  <h3 className="text-base font-semibold text-foreground">Verification checklist</h3>
                  <Checklist items={selectedBooking.checklist} />
                </Card>

                <Card variant="summary" padding="md" className="space-y-4 rounded-[0.95rem]">
                  <h3 className="text-base font-semibold text-foreground">Admin actions</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Button size="sm">Verify payment</Button>
                    <Button size="sm">Confirm booking</Button>
                    <Button variant="warning-outline" size="sm">Request new receipt</Button>
                    <Button variant="danger-outline" size="sm">Cancel booking</Button>
                  </div>
                  <Button variant="danger-outline" size="sm" className="w-full">
                    Open dispute
                  </Button>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Button variant="outline" size="sm">Message guest</Button>
                    <Button variant="outline" size="sm">Message owner</Button>
                  </div>
                </Card>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-semibold text-foreground">Admin notes</h3>
                <Textarea
                  aria-label="Admin notes"
                  placeholder="Add internal notes about this booking..."
                  rows={4}
                  value={adminNotes}
                  onChange={(event) => setAdminNotes(event.target.value)}
                  className="min-h-[110px] rounded-[0.8rem] text-sm"
                />
                <p className="text-xs text-foreground-muted">{selectedBooking.noteUpdatedAt}</p>
              </div>
            </Card>
          </div>
        </div>
      </PageContainer>
    </AppShell>
  );
}
