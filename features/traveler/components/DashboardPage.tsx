"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { CalendarDays, CheckCircle2, CreditCard, Heart, HelpCircle, Star } from "lucide-react";
import { useToast } from "@/features/system-states/hooks/useToast";
import { toggleSavedProperty } from "../actions";
import type { TravelerBooking, TravelerProperty, TravelerProfile } from "../types";
import { BookingCard, Card, EmptyState, PageHeader, PrimaryButton, PropertyCard, SecondaryButton, StatCard, cx } from "./shared";
import { formatCurrency } from "../utils";

type DashboardPageProps = {
  completedBookings: TravelerBooking[];
  paymentBalance: number;
  profile: TravelerProfile;
  recommendedProperties: TravelerProperty[];
  reviewsCount: number;
  savedCount: number;
  trips: TravelerBooking[];
  upcomingStay: TravelerBooking | null;
  upcomingStaysCount: number;
};

export function DashboardPage({
  completedBookings,
  paymentBalance,
  profile,
  recommendedProperties,
  reviewsCount,
  savedCount,
  trips,
  upcomingStay,
  upcomingStaysCount,
}: DashboardPageProps) {
  const [tripTab, setTripTab] = useState<"upcoming" | "past">("upcoming");
  const [savedIds, setSavedIds] = useState(() => new Set(recommendedProperties.filter((property) => property.isSaved).map((property) => property.id)));
  const [localSavedCount, setLocalSavedCount] = useState(savedCount);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  const firstName = profile.fullName.split(" ")[0] || profile.fullName;

  const visibleTrips = useMemo(
    () => trips.filter((booking) => (tripTab === "upcoming" ? booking.status === "confirmed" || booking.status === "pending" : booking.status === "completed")),
    [tripTab, trips],
  );

  function handleSave(propertyId: string) {
    setSavedIds((current) => {
      const wasSaved = current.has(propertyId);
      const next = new Set(current);
      if (wasSaved) next.delete(propertyId);
      else next.add(propertyId);
      setLocalSavedCount((c) => wasSaved ? c - 1 : c + 1);
      return next;
    });

    startTransition(async () => {
      const result = await toggleSavedProperty(propertyId);
      showToast({
        description: result.message,
        title: result.ok ? "Saved updated" : "Could not update",
        type: result.ok ? "success" : "error",
      });
    });
  }

  return (
    <div className="space-y-7">
      <PageHeader description="Here is what is happening with your travels." title={`Welcome back, ${firstName}!`} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard href="/traveler/bookings?tab=upcoming" icon={CalendarDays} label="Upcoming stays" value={String(upcomingStaysCount)} />
        <StatCard href="/traveler/bookings?tab=past" icon={CheckCircle2} label="Completed stays" tone="green" value={String(completedBookings.length)} />
        <StatCard href="/traveler/saved" icon={Heart} label="Saved properties" value={String(localSavedCount)} />
        <StatCard href="/traveler/reviews" icon={Star} label="Total reviews" tone="amber" value={String(reviewsCount)} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <div>
            <h2 className="mb-3 text-xl font-black text-dar-navy">Upcoming stay</h2>
            {upcomingStay ? (
              <BookingCard booking={upcomingStay} />
            ) : (
              <EmptyState
                action={
                  <Link href="/search">
                    <PrimaryButton>Find a stay</PrimaryButton>
                  </Link>
                }
                description="When you book a stay, your next check-in will appear here."
                icon={CalendarDays}
                title="No upcoming stay"
              />
            )}
          </div>

          <div>
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-dar-navy">Recommended for you</h2>
                <p className="mt-1 text-sm font-semibold text-dar-muted">Handpicked places we think you will love.</p>
              </div>
              <Link className="text-sm font-black text-dar-primary" href="/search">
                Explore more
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {recommendedProperties.map((property) => (
                <PropertyCard
                  action={
                    <button
                      aria-label={savedIds.has(property.id) ? `Unsave ${property.title}` : `Save ${property.title}`}
                      className="grid size-9 place-items-center rounded-full bg-dar-primary-soft text-dar-primary"
                      disabled={isPending}
                      onClick={() => handleSave(property.id)}
                      type="button"
                    >
                      <Heart className={cx("size-5", savedIds.has(property.id) ? "fill-dar-primary" : "")} />
                    </button>
                  }
                  key={property.id}
                  onSave={handleSave}
                  property={{ ...property, isSaved: savedIds.has(property.id) }}
                />
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-black text-dar-navy">Your trips</h2>
              <Link className="text-sm font-black text-dar-primary" href="/traveler/bookings">
                View all
              </Link>
            </div>
            <div className="mt-5 grid grid-cols-2 rounded-xl bg-slate-50 p-1">
              {(["upcoming", "past"] as const).map((tab) => (
                <button
                  className={cx(
                    "rounded-lg py-2 text-sm font-black transition",
                    tripTab === tab ? "bg-white text-dar-primary shadow-sm" : "text-dar-muted",
                  )}
                  key={tab}
                  onClick={() => setTripTab(tab)}
                  type="button"
                >
                  {tab === "upcoming" ? "Upcoming" : "Past"}
                </button>
              ))}
            </div>
            <div className="mt-5 space-y-3">
              {visibleTrips.length ? (
                visibleTrips.map((booking) => <BookingCard booking={booking} compact key={booking.id} />)
              ) : (
                <p className="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-dar-muted">No trips in this tab yet.</p>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-dar-navy">Payment overview</h2>
              <Link className="text-sm font-black text-dar-primary" href="/traveler/payments">
                View all
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-between gap-4">
              <div>
                <p className="text-3xl font-black text-dar-navy">{formatCurrency(paymentBalance)}</p>
                <p className="mt-2 text-sm font-semibold text-dar-muted">Current balance</p>
              </div>
              <span className="grid size-20 place-items-center rounded-[24px] bg-dar-primary-soft text-dar-primary">
                <CreditCard className="size-9" />
              </span>
            </div>
          </Card>

          <Card className="bg-[linear-gradient(135deg,#F7F2FF_0%,#FFFFFF_100%)] p-5">
            <div className="flex items-start gap-4">
              <span className="grid size-12 place-items-center rounded-full bg-white text-dar-primary shadow-sm">
                <HelpCircle className="size-6" />
              </span>
              <div>
                <h2 className="text-base font-black text-dar-navy">Need help during your stay?</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-dar-muted">Our support team is here 24/7 to help you with anything you need.</p>
              </div>
            </div>
            <Link href="/traveler/support">
              <SecondaryButton className="mt-5 w-full">Contact support</SecondaryButton>
            </Link>
          </Card>
        </aside>
      </section>
    </div>
  );
}
