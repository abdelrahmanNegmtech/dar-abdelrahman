"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { CalendarDays, CreditCard, HelpCircle, Hotel, Moon, Search } from "lucide-react";
import type { TravelerBooking } from "../types";
import { BookingCard, Card, EmptyState, PageHeader, PrimaryButton, SearchInput, SelectField, StatCard, cx } from "./shared";
import { formatCurrency } from "../utils";

type BookingTab = "upcoming" | "past" | "cancelled";

type BookingsPageProps = {
  bookings: TravelerBooking[];
  initialTab: BookingTab;
  stats: {
    pendingPayments: number;
    totalNights: number;
    totalPaid: number;
    upcoming: number;
  };
};

const tabs: Array<{ id: BookingTab; label: string }> = [
  { id: "upcoming", label: "Upcoming Bookings" },
  { id: "past", label: "Past Bookings" },
  { id: "cancelled", label: "Cancelled Bookings" },
];

export function BookingsPage({ bookings, initialTab, stats }: BookingsPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("check_in");
  const activeTab = (searchParams.get("tab") as BookingTab | null) ?? initialTab;

  function updateTab(tab: BookingTab) {
    const next = new URLSearchParams(searchParams.toString());
    next.set("tab", tab);
    router.replace(`${pathname}?${next.toString()}`);
  }

  const visibleBookings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = bookings.filter((booking) => {
      const statusMatch =
        activeTab === "upcoming"
          ? booking.status === "confirmed" || booking.status === "pending"
          : activeTab === "past"
            ? booking.status === "completed"
            : booking.status === "cancelled";
      const queryMatch =
        !normalizedQuery ||
        booking.reference.toLowerCase().includes(normalizedQuery) ||
        booking.property.title.toLowerCase().includes(normalizedQuery) ||
        booking.property.city.toLowerCase().includes(normalizedQuery);
      return statusMatch && queryMatch;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "price") return b.totalAmount - a.totalAmount;
      if (sort === "created") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime();
    });
  }, [activeTab, bookings, query, sort]);

  const tabLabel = tabs.find((t) => t.id === activeTab)?.label ?? "Upcoming Bookings";

  return (
    <div className="space-y-7">
      <PageHeader
        action={
          <Link href="/search">
            <PrimaryButton>
              <Search className="size-4" />
              Find a new stay
            </PrimaryButton>
          </Link>
        }
        description={activeTab === "upcoming" ? `You have ${stats.upcoming} upcoming bookings.` : `Showing ${visibleBookings.length} ${activeTab} bookings.`}
        title={tabLabel}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard href="/traveler/bookings?tab=upcoming" icon={CalendarDays} label="Upcoming stays" value={String(stats.upcoming)} />
        <StatCard href="/traveler/bookings" icon={Moon} label="Total nights" tone="green" value={String(stats.totalNights)} />
        <StatCard href="/traveler/payments" icon={CreditCard} label="Total paid" tone="amber" value={formatCurrency(stats.totalPaid)} />
        <StatCard href="/traveler/payments" icon={Hotel} label="Pending payments" value={String(stats.pendingPayments)} />
      </section>

      <section className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <Card className="hidden self-start p-4 lg:block">
          <nav aria-label="Booking filters" className="space-y-1">
            {tabs.map((tab) => (
              <button
                className={cx(
                  "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-black transition",
                  activeTab === tab.id ? "bg-dar-primary-soft text-dar-primary" : "text-dar-muted hover:bg-slate-50",
                )}
                key={tab.id}
                onClick={() => updateTab(tab.id)}
                type="button"
              >
                <CalendarDays className="size-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </Card>

        <div className="space-y-5">
          <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {tabs.map((tab) => (
              <button
                className={cx(
                  "shrink-0 rounded-xl border px-4 py-2 text-sm font-black",
                  activeTab === tab.id
                    ? "border-dar-primary bg-dar-primary-soft text-dar-primary"
                    : "border-dar-border bg-white text-dar-muted",
                )}
                key={tab.id}
                onClick={() => updateTab(tab.id)}
                type="button"
              >
                {tab.label.replace(" Bookings", "")}
              </button>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <SearchInput onChange={setQuery} placeholder="Search bookings..." value={query} />
            <SelectField aria-label="Sort bookings" onChange={(event) => setSort(event.target.value)} value={sort}>
              <option value="check_in">Check-in date</option>
              <option value="created">Recently booked</option>
              <option value="price">Total paid</option>
            </SelectField>
          </div>

          {visibleBookings.length ? (
            <div className="space-y-4">
              {visibleBookings.map((booking) => (
                <BookingCard booking={booking} key={booking.id} />
              ))}
            </div>
          ) : (
            <EmptyState
              action={
                <Link href="/search">
                  <PrimaryButton>Find a stay</PrimaryButton>
                </Link>
              }
              description="Try another tab, clear your search, or find a new stay for your next trip."
              icon={CalendarDays}
              title="No bookings found"
            />
          )}

          <Card className="flex flex-col gap-4 bg-[linear-gradient(90deg,#F7F2FF_0%,#FFFFFF_100%)] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="grid size-12 place-items-center rounded-full bg-white text-dar-primary">
                <HelpCircle className="size-6" />
              </span>
              <div>
                <h2 className="text-base font-black text-dar-navy">Need help with your booking?</h2>
                <p className="mt-1 text-sm font-semibold text-dar-muted">Our support team is here for you 24/7.</p>
              </div>
            </div>
            <Link href="/traveler/support">
              <PrimaryButton className="w-full sm:w-auto">Contact support</PrimaryButton>
            </Link>
          </Card>
        </div>
      </section>
    </div>
  );
}
