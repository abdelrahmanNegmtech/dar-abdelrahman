"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Building2,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  HelpCircle,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  Star,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { ButtonLink } from "@/components/ui";
import { Badge, Button, Card, StatusBadge, Tabs } from "@/features/design-system";
import { bookings, payouts, properties } from "@/lib/dar-data";
import { ownerRoutes } from "@/lib/owner-routes";

const activity = [
  { title: "New booking confirmed", detail: "Modern Apartment in Zamalek — May 25–28", time: "2 hours ago", href: ownerRoutes.bookings, icon: CalendarCheck2 },
  { title: "Payout received", detail: "EGP 3,640 — Payout ID: PAYOUT-7982", time: "1 day ago", href: ownerRoutes.payouts, icon: CircleDollarSign },
  { title: "Property approved", detail: "Studio in New Capital is now live", time: "3 days ago", href: ownerRoutes.properties, icon: CheckCircle2 },
  { title: "Verification updated", detail: "Identity documents submitted for review", time: "5 days ago", href: ownerRoutes.verification, icon: ShieldCheck },
] as const;

function SectionHeader({ title, description, href, linkLabel = "View all", showLinkLabel = false }: { title: string; description?: string; href?: string; linkLabel?: string; showLinkLabel?: boolean }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="owner-section-title">{title}</h2>
        {description ? <p className="owner-helper mt-1">{description}</p> : null}
      </div>
      {href ? (
        <Link href={href} className="owner-button-text inline-flex items-center gap-1.5 rounded-md text-brand outline-none transition hover:text-brand-strong focus-visible:shadow-[var(--shadow-focus)]">
          {linkLabel}<ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
      ) : showLinkLabel ? (
        <span className="owner-button-text inline-flex items-center gap-1.5 rounded-md text-brand transition group-hover:text-brand-strong">
          {linkLabel}<ArrowRight aria-hidden="true" className="size-3.5" />
        </span>
      ) : null}
    </div>
  );
}

export function OwnerDashboard() {
  const [earningsRange, setEarningsRange] = useState("month");
  const [bookingView, setBookingView] = useState("pending");
  const [refreshing, setRefreshing] = useState(false);
  const pendingBookings = bookings.filter((booking) => booking.status === "Pending");
  const confirmedBookings = bookings.filter((booking) => booking.status === "Confirmed");
  const visibleBookings = bookingView === "pending" ? pendingBookings : confirmedBookings;
  const activeBookingCount = pendingBookings.length + confirmedBookings.length;

  const quickActions = [
    { label: "Manage properties", href: ownerRoutes.properties, icon: Building2, description: "Update listings and availability" },
    { label: "Review requests", href: ownerRoutes.bookings, icon: CalendarCheck2, description: `${pendingBookings.length} requests need a response` },
    { label: "Open calendar", href: ownerRoutes.calendar(), icon: CalendarDays, description: "Manage dates and pricing" },
    { label: "View messages", href: ownerRoutes.messages, icon: MessageSquare, description: "Continue guest conversations" },
    { label: "Track payouts", href: ownerRoutes.payouts, icon: WalletCards, description: "Review earnings and transfers" },
    { label: "Owner support", href: ownerRoutes.help, icon: HelpCircle, description: "Get help from the DAR team" },
  ] as const;

  const metricCards = [
    { label: "Total properties", value: String(properties.length), note: "+1 this month", href: ownerRoutes.properties, icon: Building2, tone: "brand" as const },
    { label: "Active bookings", value: String(activeBookingCount), note: `${pendingBookings.length} pending responses`, href: ownerRoutes.bookings, icon: CalendarCheck2, tone: "warning" as const },
    { label: "Total earnings", value: "EGP 286,700", note: "+EGP 18,450 this month", href: ownerRoutes.payouts, icon: TrendingUp, tone: "success" as const },
    { label: "Guest reviews", value: "24", note: "4.8 average rating", href: ownerRoutes.reviews, icon: Star, tone: "info" as const },
  ] as const;

  async function refresh() {
    if (refreshing) return;
    setRefreshing(true);
    await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
    setBookingView("pending");
    setEarningsRange("month");
    await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
    setRefreshing(false);
  }

  return (
    <div className="owner-dashboard-content">
      <div className="flex items-start justify-between gap-5 max-[640px]:flex-col">
        <div>
          <Badge tone="brand">Owner overview</Badge>
          <h1 className="owner-page-title mt-3">Welcome back, Ahmed 👋</h1>
          <p className="owner-page-description mt-1">Here&apos;s what&apos;s happening with your properties today.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" disabled={refreshing} onClick={refresh} leadingIcon={<RefreshCw aria-hidden="true" className={`size-4 ${refreshing ? "animate-spin" : ""}`} />}>
            {refreshing ? "Refreshing" : "Refresh"}
          </Button>
          <ButtonLink href={ownerRoutes.addProperty} size="sm"><Building2 aria-hidden="true" className="size-4" />Add property</ButtonLink>
        </div>
      </div>

      <section aria-label="Owner performance" className="mt-6 grid grid-cols-4 gap-4 max-[1200px]:grid-cols-2 max-[600px]:grid-cols-1">
        {metricCards.map((metric) => (
          <Link key={metric.label} href={metric.href} className="group rounded-[var(--radius-xl)] outline-none focus-visible:shadow-[var(--shadow-focus)]">
            <Card variant="action" padding="md" className="h-full group-hover:border-brand/35">
              <div className="flex items-start justify-between gap-4">
                <span className="grid size-11 place-items-center rounded-[var(--radius-md)] bg-brand-soft text-brand transition group-hover:bg-brand group-hover:text-white">
                  <metric.icon aria-hidden="true" className="size-5" strokeWidth={1.8} />
                </span>
                <Badge tone={metric.tone}>{metric.note}</Badge>
              </div>
              <p className="owner-helper mt-5">{metric.label}</p>
              <p className="owner-number-md mt-1">{metric.value}</p>
            </Card>
          </Link>
        ))}
      </section>

      <section className="mt-7">
        <SectionHeader title="Quick actions" description="Shortcuts for the work owners do most often." />
        <div className="mt-4 grid grid-cols-6 gap-3 max-[1280px]:grid-cols-3 max-[700px]:grid-cols-2 max-[430px]:grid-cols-1">
          {quickActions.map((action) => (
            <Link key={action.label} href={action.href} className="group rounded-[var(--radius-xl)] outline-none focus-visible:shadow-[var(--shadow-focus)]">
              <Card variant="action" padding="sm" className="h-full group-hover:border-brand/35">
                <span className="grid size-10 place-items-center rounded-[var(--radius-md)] bg-brand-soft text-brand transition group-hover:bg-brand group-hover:text-white">
                  <action.icon aria-hidden="true" className="size-[18px]" strokeWidth={1.8} />
                </span>
                <h3 className="owner-card-title mt-4">{action.label}</h3>
                <p className="owner-helper mt-1">{action.description}</p>
                <span className="owner-button-text mt-4 inline-flex items-center gap-1 text-brand">Open <ArrowRight aria-hidden="true" className="size-3" /></span>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-7 grid grid-cols-[minmax(0,1.55fr)_minmax(300px,.8fr)] gap-5 max-[1050px]:grid-cols-1">
        <Card padding="md">
          <SectionHeader title="Booking requests" description="Respond quickly to keep your acceptance rate healthy." href={ownerRoutes.bookings} />
          <Tabs className="mt-4 w-fit" value={bookingView} onValueChange={setBookingView} items={[{ value: "pending", label: "Pending", count: pendingBookings.length }, { value: "confirmed", label: "Confirmed", count: confirmedBookings.length }]} />
          <div className="mt-4 divide-y divide-border">
            {visibleBookings.slice(0, 3).map((booking) => {
              const property = properties.find((item) => item.id === booking.propertyId) ?? properties[0];
              return (
                <Link key={booking.id} href={booking.status === "Pending" ? ownerRoutes.bookingDecision : ownerRoutes.bookings} className="group grid grid-cols-[48px_minmax(0,1fr)_auto_auto] items-center gap-3 py-3 outline-none hover:bg-surface-muted focus-visible:bg-surface-muted max-[650px]:grid-cols-[48px_minmax(0,1fr)_auto]">
                  <Image src={property.image} alt="" width={48} height={48} className="size-12 rounded-[var(--radius-sm)] object-cover" />
                  <div className="min-w-0">
                    <p className="owner-label truncate group-hover:text-brand">{property.name}</p>
                    <p className="owner-helper mt-1">{booking.guest} · {booking.dates}</p>
                  </div>
                  <p className="owner-label whitespace-nowrap max-[650px]:hidden">EGP {booking.total.toLocaleString()}</p>
                  <StatusBadge status={booking.status === "Pending" ? "pending" : "confirmed"}>{booking.status}</StatusBadge>
                </Link>
              );
            })}
          </div>
        </Card>

        <Card padding="md">
          <SectionHeader title="Earnings overview" description="Owner payouts after DAR commission." href={ownerRoutes.payouts} />
          <Tabs className="mt-4" value={earningsRange} onValueChange={setEarningsRange} items={[{ value: "month", label: "This month" }, { value: "year", label: "This year" }]} />
          <p className="owner-helper mt-5">Net earnings</p>
          <p className="owner-number-lg mt-1">{earningsRange === "month" ? "EGP 18,450" : "EGP 286,700"}</p>
          <p className="owner-helper mt-1 text-success">12% above the previous period</p>
          <div className="mt-5 space-y-3">
            {payouts.slice(0, 3).map((payout, index) => (
              <Link href={ownerRoutes.payouts} key={payout.id} className="block rounded-md outline-none focus-visible:shadow-[var(--shadow-focus)]">
                <div className="flex justify-between gap-3"><span className="owner-helper truncate">{payout.property}</span><b className="owner-label whitespace-nowrap">EGP {payout.net.toLocaleString()}</b></div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-strong"><div className="h-full rounded-full bg-brand" style={{ width: `${82 - index * 18}%` }} /></div>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-5 grid grid-cols-[minmax(0,1.4fr)_minmax(300px,.6fr)] gap-5 max-[1050px]:grid-cols-1">
        <Card padding="md">
          <SectionHeader title="Property overview" description="Performance across your Owner portfolio." href={ownerRoutes.properties} />
          <div className="mt-4 grid grid-cols-3 gap-3 max-[720px]:grid-cols-1">
            {properties.slice(0, 3).map((property) => (
              <Link href={ownerRoutes.property(property.id)} key={property.id} className="group overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface outline-none transition hover:border-brand/35 hover:shadow-[var(--shadow-card-hover)] focus-visible:shadow-[var(--shadow-focus)]">
                <Image src={property.image} alt={property.name} width={360} height={180} className="h-28 w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2"><h3 className="owner-label line-clamp-2 group-hover:text-brand">{property.name}</h3><StatusBadge status={property.status === "active" ? "active" : "pending"}>{property.status}</StatusBadge></div>
                  <p className="owner-helper mt-2">{property.bookings} bookings · {property.rating} rating</p>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Link href={ownerRoutes.reviews} aria-label="View review summary" className="group block rounded-[var(--radius-xl)] outline-none focus-visible:shadow-[var(--shadow-focus)]">
          <Card padding="md" className="transition group-hover:border-brand/35 group-hover:shadow-[var(--shadow-card-hover)]">
            <SectionHeader title="Review summary" showLinkLabel />
            <div className="mt-5 flex items-center gap-4">
              <div className="grid size-20 shrink-0 place-items-center rounded-full border-[6px] border-brand-soft bg-surface text-center"><span><b className="owner-number-sm block">4.8</b><span className="owner-helper">/ 5</span></span></div>
              <div><div className="flex gap-1 text-warning" aria-label="4.8 out of 5 stars">{[1, 2, 3, 4, 5].map((star) => <Star key={star} aria-hidden="true" className="size-4 fill-current" />)}</div><p className="owner-helper mt-2">Based on 24 guest reviews</p></div>
            </div>
            <div className="mt-5 rounded-[var(--radius-md)] bg-surface-muted p-3"><p className="owner-label">Guests value your communication</p><p className="owner-helper mt-1">Your response score is above the Owner average.</p></div>
          </Card>
        </Link>
      </div>

      <Card padding="md" className="mt-5">
        <SectionHeader title="Recent activity" description="The latest updates across bookings, payouts, properties and verification." />
        <div className="mt-4 grid grid-cols-4 gap-3 max-[1000px]:grid-cols-2 max-[560px]:grid-cols-1">
          {activity.map((item) => (
            <Link key={item.title} href={item.href} className="group rounded-[var(--radius-lg)] border border-border p-4 outline-none transition hover:border-brand/35 hover:bg-surface-muted focus-visible:shadow-[var(--shadow-focus)]">
              <item.icon aria-hidden="true" className="size-5 text-brand" strokeWidth={1.8} />
              <h3 className="owner-label mt-4 group-hover:text-brand">{item.title}</h3>
              <p className="owner-helper mt-1">{item.detail}</p>
              <p className="owner-helper mt-3 flex items-center gap-1.5 text-foreground-subtle"><Clock3 aria-hidden="true" className="size-3.5" />{item.time}</p>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
