"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  ArrowRight,
  Building2,
  CalendarCheck2,
  CalendarDays,
  Clock3,
  HelpCircle,
  MessageSquare,
  RefreshCw,
  Star,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { Badge, Button, Card, StatusBadge, Tabs } from "@/features/design-system";
import { ButtonLink } from "@/components/ui";
import { OwnerShell } from "@/components/owner/owner-shell";
import { ownerRoutes } from "@/lib/owner-routes";

type DashboardStatusTone =
  | "active"
  | "cancelled"
  | "completed"
  | "confirmed"
  | "draft"
  | "pending"
  | "processing"
  | "rejected";

type DashboardBookingItem = {
  dateLabel: string;
  href: string;
  id: string;
  locationLabel: string;
  propertyTitle: string;
  requestedAtLabel: string;
  statusLabel: string;
  statusTone: DashboardStatusTone;
  totalLabel: string;
  travelerFullName: string;
};

type DashboardPropertyItem = {
  href: string;
  id: string;
  location: string;
  photoCount: number;
  primaryActionHref: string;
  primaryActionLabel: string;
  statusLabel: string;
  statusTone: DashboardStatusTone;
  title: string;
  updatedAtLabel: string;
};

type DashboardPayoutItem = {
  amountLabel: string;
  dateLabel: string;
  href: string;
  id: string;
  progressPercent: number;
  propertyTitle: string;
  statusLabel: string;
};

type DashboardQuickAction = {
  description: string;
  href: string;
  icon:
    | "Building2"
    | "CalendarCheck2"
    | "CalendarDays"
    | "HelpCircle"
    | "MessageSquare"
    | "WalletCards";
  label: string;
};

export type OwnerDashboardData = {
  activeBookingCount: number;
  averageRating: number;
  pendingBookingCount: number;
  payouts: DashboardPayoutItem[];
  properties: DashboardPropertyItem[];
  quickActions: DashboardQuickAction[];
  reviewCount: number;
  reviewsSubmittedCount: number;
  thisMonthEarningsLabel: string;
  totalEarningsLabel: string;
  totalProperties: number;
  visibleBookings: {
    confirmed: DashboardBookingItem[];
    pending: DashboardBookingItem[];
  };
};

const iconMap = {
  Building2,
  CalendarCheck2,
  CalendarDays,
  HelpCircle,
  MessageSquare,
  WalletCards,
} as const;

function SectionHeader({
  title,
  description,
  href,
  linkLabel = "View all",
  showLinkLabel = false,
}: {
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  showLinkLabel?: boolean;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="owner-section-title">{title}</h2>
        {description ? <p className="owner-helper mt-1">{description}</p> : null}
      </div>
      {href ? (
        <Link
          href={href}
          className="owner-button-text inline-flex items-center gap-1.5 rounded-md text-brand outline-none transition hover:text-brand-strong focus-visible:shadow-[var(--shadow-focus)]"
        >
          {linkLabel}
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
      ) : showLinkLabel ? (
        <span className="owner-button-text inline-flex items-center gap-1.5 rounded-md text-brand transition group-hover:text-brand-strong">
          {linkLabel}
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </span>
      ) : null}
    </div>
  );
}

function EmptyState({
  body,
  title,
}: {
  body: string;
  title: string;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed border-border bg-surface-muted/35 p-5">
      <h3 className="owner-label">{title}</h3>
      <p className="owner-helper mt-2">{body}</p>
    </div>
  );
}

function PropertyPlaceholder({ title }: { title: string }) {
  const initials = title
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="flex h-28 w-full items-center justify-between bg-[linear-gradient(135deg,#f7f8fc,#eef2f8)] px-4">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-[var(--radius-md)] bg-white text-brand shadow-[0_8px_20px_rgba(16,25,58,0.06)]">
          <Building2 className="size-5" aria-hidden="true" strokeWidth={1.8} />
        </span>
        <div>
          <p className="owner-badge text-[#52607a]">Property</p>
          <p className="owner-label mt-1 text-[#26344f]">Owner listing</p>
        </div>
      </div>
      <span className="owner-badge rounded-full bg-white px-3 py-1 text-[#52607a] shadow-[0_6px_16px_rgba(16,25,58,0.05)]">
        {initials || "DAR"}
      </span>
    </div>
  );
}

export function OwnerDashboardClient({ data }: { data: OwnerDashboardData }) {
  const router = useRouter();
  const [bookingView, setBookingView] = useState<"pending" | "confirmed">("pending");
  const [earningsRange, setEarningsRange] = useState<"month" | "year">("month");
  const [isRefreshing, startRefresh] = useTransition();
  const visibleBookings = data.visibleBookings[bookingView];

  return (
    <OwnerShell
      active="Overview"
      actions={(
        <>
          <Button
            variant="outline"
            size="sm"
            disabled={isRefreshing}
            onClick={() => startRefresh(() => router.refresh())}
            leadingIcon={<RefreshCw aria-hidden="true" className={`size-4 ${isRefreshing ? "animate-spin" : ""}`} />}
          >
            {isRefreshing ? "Refreshing" : "Refresh"}
          </Button>
          <ButtonLink href={ownerRoutes.addProperty} size="sm">
            <Building2 aria-hidden="true" className="size-4" />
            Add property
          </ButtonLink>
        </>
      )}
    >
      <div className="owner-dashboard-content">
        <div className="flex items-start justify-between gap-5 max-[640px]:flex-col">
          <div>
            <Badge tone="brand">Owner overview</Badge>
            <h1 className="owner-page-title mt-3">Welcome back.</h1>
            <p className="owner-page-description mt-1">
              Here&apos;s what&apos;s happening with your properties today.
            </p>
          </div>
        </div>

        <section
          aria-label="Owner performance"
          className="mt-6 grid grid-cols-4 gap-4 max-[1200px]:grid-cols-2 max-[600px]:grid-cols-1"
        >
          <Link href={ownerRoutes.properties} className="group rounded-[var(--radius-xl)] outline-none focus-visible:shadow-[var(--shadow-focus)]">
            <Card variant="action" padding="md" className="h-full group-hover:border-brand/35">
              <div className="flex items-start justify-between gap-4">
                <span className="grid size-11 place-items-center rounded-[var(--radius-md)] bg-brand-soft text-brand transition group-hover:bg-brand group-hover:text-white">
                  <Building2 aria-hidden="true" className="size-5" strokeWidth={1.8} />
                </span>
                <Badge tone="brand">
                  {data.totalProperties === 1 ? "1 active listing" : `${data.totalProperties} listings`}
                </Badge>
              </div>
              <p className="owner-helper mt-5">Total properties</p>
              <p className="owner-number-md mt-1">{data.totalProperties}</p>
            </Card>
          </Link>

          <Link href={ownerRoutes.bookingRequests} className="group rounded-[var(--radius-xl)] outline-none focus-visible:shadow-[var(--shadow-focus)]">
            <Card variant="action" padding="md" className="h-full group-hover:border-brand/35">
              <div className="flex items-start justify-between gap-4">
                <span className="grid size-11 place-items-center rounded-[var(--radius-md)] bg-warning/10 text-warning transition group-hover:bg-warning group-hover:text-white">
                  <CalendarCheck2 aria-hidden="true" className="size-5" strokeWidth={1.8} />
                </span>
                <Badge tone="warning">
                  {data.pendingBookingCount} pending response{data.pendingBookingCount === 1 ? "" : "s"}
                </Badge>
              </div>
              <p className="owner-helper mt-5">Active bookings</p>
              <p className="owner-number-md mt-1">{data.activeBookingCount}</p>
            </Card>
          </Link>

          <Link href={ownerRoutes.payouts} className="group rounded-[var(--radius-xl)] outline-none focus-visible:shadow-[var(--shadow-focus)]">
            <Card variant="action" padding="md" className="h-full group-hover:border-brand/35">
              <div className="flex items-start justify-between gap-4">
                <span className="grid size-11 place-items-center rounded-[var(--radius-md)] bg-success/10 text-success transition group-hover:bg-success group-hover:text-white">
                  <TrendingUp aria-hidden="true" className="size-5" strokeWidth={1.8} />
                </span>
                <Badge tone="success">{data.thisMonthEarningsLabel} this month</Badge>
              </div>
              <p className="owner-helper mt-5">Total earnings</p>
              <p className="owner-number-md mt-1">{data.totalEarningsLabel}</p>
            </Card>
          </Link>

          <Link href={ownerRoutes.reviews} className="group rounded-[var(--radius-xl)] outline-none focus-visible:shadow-[var(--shadow-focus)]">
            <Card variant="action" padding="md" className="h-full group-hover:border-brand/35">
              <div className="flex items-start justify-between gap-4">
                <span className="grid size-11 place-items-center rounded-[var(--radius-md)] bg-info/10 text-info transition group-hover:bg-info group-hover:text-white">
                  <Star aria-hidden="true" className="size-5" strokeWidth={1.8} />
                </span>
                <Badge tone="info">
                  {data.reviewCount ? `${data.averageRating.toFixed(1)} average rating` : "Awaiting reviews"}
                </Badge>
              </div>
              <p className="owner-helper mt-5">Guest reviews</p>
              <p className="owner-number-md mt-1">{data.reviewCount}</p>
            </Card>
          </Link>
        </section>

        <section className="mt-7">
          <SectionHeader
            title="Quick actions"
            description="Shortcuts for the work owners do most often."
          />
          <div className="mt-4 grid grid-cols-6 gap-3 max-[1280px]:grid-cols-3 max-[700px]:grid-cols-2 max-[430px]:grid-cols-1">
            {data.quickActions.map((action) => {
              const IconComponent = iconMap[action.icon];

              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="group rounded-[var(--radius-xl)] outline-none focus-visible:shadow-[var(--shadow-focus)]"
                >
                  <Card variant="action" padding="sm" className="h-full group-hover:border-brand/35">
                    <span className="grid size-10 place-items-center rounded-[var(--radius-md)] bg-brand-soft text-brand transition group-hover:bg-brand group-hover:text-white">
                      <IconComponent aria-hidden="true" className="size-[18px]" strokeWidth={1.8} />
                    </span>
                    <h3 className="owner-card-title mt-4">{action.label}</h3>
                    <p className="owner-helper mt-1">{action.description}</p>
                    <span className="owner-button-text mt-4 inline-flex items-center gap-1 text-brand">
                      Open
                      <ArrowRight aria-hidden="true" className="size-3" />
                    </span>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        <div className="mt-7 grid grid-cols-[minmax(0,1.55fr)_minmax(300px,.8fr)] gap-5 max-[1050px]:grid-cols-1">
          <Card padding="md">
            <SectionHeader
              title="Booking requests"
              description="Respond quickly to keep your acceptance rate healthy."
              href={ownerRoutes.bookingRequests}
            />
            <Tabs
              className="mt-4 w-fit"
              value={bookingView}
              onValueChange={(value) => setBookingView(value as "pending" | "confirmed")}
              items={[
                { value: "pending", label: "Pending", count: data.pendingBookingCount },
                { value: "confirmed", label: "Confirmed", count: data.activeBookingCount },
              ]}
            />
            <div className="mt-4 divide-y divide-border">
              {visibleBookings.length ? (
                visibleBookings.map((booking) => (
                  <Link
                    key={booking.id}
                    href={booking.href}
                    className="group grid grid-cols-[48px_minmax(0,1fr)_auto_auto] items-center gap-3 py-3 outline-none hover:bg-surface-muted focus-visible:bg-surface-muted max-[650px]:grid-cols-[48px_minmax(0,1fr)_auto]"
                  >
                    <div className="grid size-12 place-items-center rounded-[var(--radius-sm)] bg-[linear-gradient(135deg,#f3f5fb,#e8edf7)] text-brand">
                      <Building2 aria-hidden="true" className="size-5" strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0">
                      <p className="owner-label truncate group-hover:text-brand">{booking.propertyTitle}</p>
                      <p className="owner-helper mt-1 truncate">
                        {booking.travelerFullName} / {booking.dateLabel}
                      </p>
                      <p className="owner-helper mt-1 truncate">
                        {booking.locationLabel} / Requested {booking.requestedAtLabel}
                      </p>
                    </div>
                    <p className="owner-label whitespace-nowrap max-[650px]:hidden">{booking.totalLabel}</p>
                    <StatusBadge status={booking.statusTone}>{booking.statusLabel}</StatusBadge>
                  </Link>
                ))
              ) : (
                <EmptyState
                  title={bookingView === "pending" ? "No pending requests" : "No confirmed bookings"}
                  body={
                    bookingView === "pending"
                      ? "New owner approval requests will appear here when travelers submit them."
                      : "Confirmed bookings will appear here after you approve them."
                  }
                />
              )}
            </div>
          </Card>

          <Card padding="md">
            <SectionHeader
              title="Earnings overview"
              description="Owner payouts after DAR commission."
              href={ownerRoutes.payouts}
            />
            <Tabs
              className="mt-4"
              value={earningsRange}
              onValueChange={(value) => setEarningsRange(value as "month" | "year")}
              items={[
                { value: "month", label: "This month" },
                { value: "year", label: "Lifetime" },
              ]}
            />
            <p className="owner-helper mt-5">Net earnings</p>
            <p className="owner-number-lg mt-1">
              {earningsRange === "month" ? data.thisMonthEarningsLabel : data.totalEarningsLabel}
            </p>
            <p className="owner-helper mt-1 text-success">
              {earningsRange === "month"
                ? "Paid owner payouts recorded this month."
                : "Paid owner payouts recorded across all time."}
            </p>
            <div className="mt-5 space-y-3">
              {data.payouts.length ? (
                data.payouts.map((payout) => (
                  <Link href={payout.href} key={payout.id} className="block rounded-md outline-none focus-visible:shadow-[var(--shadow-focus)]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span className="owner-helper truncate">{payout.propertyTitle}</span>
                        <p className="owner-helper mt-1">{payout.dateLabel}</p>
                      </div>
                      <div className="text-right">
                        <b className="owner-label whitespace-nowrap">{payout.amountLabel}</b>
                        <p className="owner-helper mt-1">{payout.statusLabel}</p>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-strong">
                      <div
                        className="h-full rounded-full bg-brand"
                        style={{ width: `${payout.progressPercent}%` }}
                      />
                    </div>
                  </Link>
                ))
              ) : (
                <EmptyState
                  title="No payouts yet"
                  body="Owner payouts will appear here after eligible bookings move through the payout workflow."
                />
              )}
            </div>
          </Card>
        </div>

        <div className="mt-5 grid grid-cols-[minmax(0,1.4fr)_minmax(300px,.6fr)] gap-5 max-[1050px]:grid-cols-1">
          <Card padding="md">
            <SectionHeader
              title="Property overview"
              description="Performance across your Owner portfolio."
              href={ownerRoutes.properties}
            />
            {data.properties.length ? (
              <div className="mt-4 grid grid-cols-3 gap-3 max-[720px]:grid-cols-1">
                {data.properties.map((property) => (
                  <Link
                    href={property.href}
                    key={property.id}
                    className="group overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface outline-none transition hover:border-brand/35 hover:shadow-[var(--shadow-card-hover)] focus-visible:shadow-[var(--shadow-focus)]"
                  >
                    <PropertyPlaceholder title={property.title} />
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="owner-label line-clamp-2 group-hover:text-brand">{property.title}</h3>
                        <StatusBadge status={property.statusTone}>{property.statusLabel}</StatusBadge>
                      </div>
                      <p className="owner-helper mt-2">{property.location}</p>
                      <p className="owner-helper mt-2">
                        {property.photoCount} photo{property.photoCount === 1 ? "" : "s"} / Updated {property.updatedAtLabel}
                      </p>
                      <span className="owner-button-text mt-4 inline-flex items-center gap-1 text-brand">
                        {property.primaryActionLabel}
                        <ArrowRight aria-hidden="true" className="size-3" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-4">
                <EmptyState
                  title="No properties yet"
                  body="Create your first property to start managing pricing, bookings, and publishing from the Owner portal."
                />
              </div>
            )}
          </Card>

          <Link
            href={ownerRoutes.reviews}
            aria-label="View review summary"
            className="group block rounded-[var(--radius-xl)] outline-none focus-visible:shadow-[var(--shadow-focus)]"
          >
            <Card padding="md" className="transition group-hover:border-brand/35 group-hover:shadow-[var(--shadow-card-hover)]">
              <SectionHeader title="Review summary" showLinkLabel />
              <div className="mt-5 flex items-center gap-4">
                <div className="grid size-20 shrink-0 place-items-center rounded-full border-[6px] border-brand-soft bg-surface text-center">
                  <span>
                    <b className="owner-number-sm block">
                      {data.reviewCount ? data.averageRating.toFixed(1) : "-"}
                    </b>
                    <span className="owner-helper">/ 5</span>
                  </span>
                </div>
                <div>
                  <div className="flex gap-1 text-warning" aria-label={`${data.averageRating.toFixed(1)} out of 5 stars`}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        aria-hidden="true"
                        className={`size-4 ${data.reviewCount && star <= Math.round(data.averageRating) ? "fill-current" : ""}`}
                      />
                    ))}
                  </div>
                  <p className="owner-helper mt-2">
                    {data.reviewCount
                      ? `Based on ${data.reviewCount} guest review${data.reviewCount === 1 ? "" : "s"}`
                      : "Guest reviews will appear here after completed stays receive feedback."}
                  </p>
                </div>
              </div>
              <div className="mt-5 rounded-[var(--radius-md)] bg-surface-muted p-3">
                <p className="owner-label">Submitted reviews</p>
                <p className="owner-helper mt-1">
                  {data.reviewsSubmittedCount} visible submitted review{data.reviewsSubmittedCount === 1 ? "" : "s"} in the current owner dataset.
                </p>
              </div>
            </Card>
          </Link>
        </div>

        <Card padding="md" className="mt-5">
          <SectionHeader
            title="Recent activity"
            description="A dedicated owner activity feed is not yet available from the current backend queries."
          />
          <div className="mt-4 grid grid-cols-[auto_minmax(0,1fr)] gap-4 rounded-[var(--radius-lg)] border border-dashed border-border bg-surface-muted/35 p-5">
            <span className="grid size-11 place-items-center rounded-[var(--radius-md)] bg-white text-brand shadow-[0_8px_20px_rgba(16,25,58,0.06)]">
              <Clock3 aria-hidden="true" className="size-5" strokeWidth={1.8} />
            </span>
            <div>
              <h3 className="owner-label">Deferred for a future backend integration</h3>
              <p className="owner-helper mt-2">
                Recent activity was previously mock data. It has been removed from the live dashboard until an authoritative owner activity source is available.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </OwnerShell>
  );
}
