"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  CalendarDays,
  CreditCard,
  Download,
  Heart,
  MessageCircle,
  MoreVertical,
  Ruler,
  ShieldCheck,
  Users,
  Wifi,
} from "lucide-react";
import { useToast } from "@/features/system-states/hooks/useToast";
import { cancelBooking, setSavedProperty } from "../actions";
import type { TravelerBooking } from "../types";
import {
  Card,
  DangerButton,
  EmptyState,
  IconButton,
  MiniFact,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  StatusBadge,
  TextAreaField,
  cx,
} from "./shared";
import { formatCurrency, formatDateRange } from "../utils";

export function BookingDetailsPage({ booking }: { booking: TravelerBooking | null }) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isSaved, setIsSaved] = useState(Boolean(booking?.property.isSaved));
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  if (!booking) {
    return (
      <EmptyState
        action={
          <Link href="/traveler/bookings">
            <PrimaryButton>Back to bookings</PrimaryButton>
          </Link>
        }
        description="This booking either does not exist or is not available to your account."
        title="Booking not found"
      />
    );
  }

  const bookingId = booking.id;
  const propertyId = booking.property.id;

  function handleCancel() {
    startTransition(async () => {
      const result = await cancelBooking({ bookingId, reason });
      showToast({
        description: result.message,
        title: result.ok ? "Booking cancelled" : "Cancellation failed",
        type: result.ok ? "success" : "error",
      });
      if (result.ok) setCancelOpen(false);
    });
  }

  function handleSaved() {
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    startTransition(async () => {
      const result = await setSavedProperty(propertyId, nextSaved);
      if (!result.ok) {
        setIsSaved(!nextSaved);
      }
      showToast({
        description: result.message,
        title: result.ok ? "Favorite updated" : "Could not update",
        type: result.ok ? "success" : "error",
      });
    });
  }

  return (
    <div className="space-y-6">
      <Link className="inline-flex items-center gap-2 text-sm font-black text-dar-primary" href="/traveler/bookings">
        <ArrowLeft className="size-4" />
        Back to bookings
      </Link>

      <PageHeader
        action={
          <div className="flex flex-wrap gap-3">
            <a href={`/traveler/bookings/${booking.id}/invoice`} target="_blank">
              <SecondaryButton>
                <Download className="size-4" />
                Download invoice
              </SecondaryButton>
            </a>
            <IconButton
              label="More booking actions"
              onClick={() => showToast({ description: "More booking actions are a local preview placeholder.", title: "Actions preview", type: "info" })}
            >
              <MoreVertical className="size-5" />
            </IconButton>
          </div>
        }
        description={`Booking ID: #${booking.reference}`}
        title="Booking details"
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card className="overflow-hidden p-4">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_170px]">
              <div className="relative h-[260px] overflow-hidden rounded-xl md:h-[360px]">
                <Image
                  alt={booking.property.title}
                  className={cx("object-cover", booking.property.imagePosition)}
                  fill
                  priority
                  sizes="(min-width: 1280px) 720px, 100vw"
                  src={booking.property.imageUrl}
                />
                <span className="absolute left-4 top-4 rounded-lg px-3 py-1 text-xs font-black text-white [background-image:var(--dar-gradient)]">
                  Featured
                </span>
                <button
                  aria-label={isSaved ? "Remove from saved properties" : "Save property"}
                  aria-pressed={isSaved}
                  className="absolute right-4 top-4 grid size-12 place-items-center rounded-full bg-white text-dar-primary shadow-lg"
                  onClick={handleSaved}
                  type="button"
                >
                  <Heart className={cx("size-6", isSaved ? "fill-dar-primary" : "")} />
                </button>
              </div>
              <div className="hidden grid-rows-3 gap-3 md:grid">
                {[0, 1, 2].map((item) => (
                  <div className="relative overflow-hidden rounded-xl" key={item}>
                    <Image
                      alt={`${booking.property.title} gallery ${item + 1}`}
                      className={cx("object-cover", booking.property.imagePosition)}
                      fill
                      sizes="170px"
                      src={booking.property.imageUrl}
                    />
                    {item === 2 ? (
                      <span className="absolute inset-0 grid place-items-center bg-black/38 text-lg font-black text-white">+12</span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black text-dar-navy">{booking.property.title}</h2>
                <p className="mt-2 text-sm font-semibold text-dar-muted">
                  {booking.property.area}, {booking.property.city}, {booking.property.country}
                </p>
              </div>
              <StatusBadge label={booking.status} tone="booking" />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <MiniFact icon={BedDouble} label="Beds" value={String(booking.property.bedrooms)} />
              <MiniFact icon={Bath} label="Baths" value={String(booking.property.bathrooms)} />
              <MiniFact icon={Users} label="Guests" value={String(booking.property.maxGuests)} />
              <MiniFact icon={Ruler} label="Size" value={`${booking.property.areaSize} m2`} />
              <MiniFact icon={Wifi} label="Amenity" value="Wi-Fi" />
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-5">
              <h2 className="text-lg font-black text-dar-navy">Stay information</h2>
              <dl className="mt-4 divide-y divide-dar-border">
                {[
                  ["Check-in", `${new Date(booking.checkIn).toLocaleDateString("en-US", { day: "numeric", month: "short", weekday: "short", year: "numeric" })} ${booking.checkInTime}`],
                  ["Check-out", `${new Date(booking.checkOut).toLocaleDateString("en-US", { day: "numeric", month: "short", weekday: "short", year: "numeric" })} ${booking.checkOutTime}`],
                  ["Duration", `${booking.nightsCount} nights`],
                  ["Guests", `${booking.guestsCount} adults`],
                ].map(([label, value]) => (
                  <div className="grid grid-cols-[110px_1fr] gap-3 py-3 text-sm" key={label}>
                    <dt className="font-bold text-dar-muted">{label}</dt>
                    <dd className="font-black text-dar-navy">{value}</dd>
                  </div>
                ))}
              </dl>
            </Card>

            <Card className="p-5">
              <h2 className="text-lg font-black text-dar-navy">Host information</h2>
              <div className="mt-4 flex items-center gap-4">
                <span className="relative size-14 overflow-hidden rounded-full bg-slate-100">
                  <Image alt={booking.owner.name} className="object-cover" fill src={booking.owner.avatarUrl} />
                </span>
                <div>
                  <p className="font-black text-dar-navy">{booking.owner.name}</p>
                  <p className="mt-1 text-sm font-semibold text-dar-muted">{booking.owner.responseTime}</p>
                  <p className="mt-1 text-sm font-bold text-dar-primary">{booking.owner.rating} rating</p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Link href={`/traveler/messages?booking=${booking.id}`}>
                  <SecondaryButton className="w-full">
                    <MessageCircle className="size-4" />
                    Message host
                  </SecondaryButton>
                </Link>
                <SecondaryButton
                  className="w-full"
                  onClick={() => showToast({ description: "Host profile opens once public host pages are connected.", title: "Host preview", type: "info" })}
                >
                  View profile
                </SecondaryButton>
              </div>
            </Card>
          </div>

          <Card className="p-5">
            <h2 className="text-lg font-black text-dar-navy">House rules</h2>
            <div className="mt-4 grid gap-3 text-sm font-semibold text-dar-muted sm:grid-cols-2">
              {["No smoking", "No parties or events", "Pets are not allowed", "Quiet hours: 11:00 PM - 7:00 AM"].map((rule) => (
                <span className="inline-flex items-center gap-2" key={rule}>
                  <ShieldCheck className="size-4 text-dar-primary" />
                  {rule}
                </span>
              ))}
            </div>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card className="p-5">
            <h2 className="text-lg font-black text-dar-navy">Price details</h2>
            <dl className="mt-5 space-y-4">
              {[
                [`${formatCurrency(booking.property.pricePerNight, booking.currency)} x ${booking.nightsCount} nights`, booking.subtotal],
                ["Cleaning fee", booking.cleaningFee],
                ["Service fee", booking.serviceFee],
              ].map(([label, value]) => (
                <div className="flex justify-between gap-3 text-sm font-semibold text-dar-muted" key={String(label)}>
                  <dt>{label}</dt>
                  <dd className="font-bold text-dar-navy">{formatCurrency(Number(value), booking.currency)}</dd>
                </div>
              ))}
              <div className="flex justify-between border-t border-dar-border pt-4 text-lg font-black text-dar-navy">
                <dt>Total</dt>
                <dd>{formatCurrency(booking.totalAmount, booking.currency)}</dd>
              </div>
            </dl>
            <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
              You will not be charged yet. Payment will be processed automatically before check-in.
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-black text-dar-navy">Payment method</h2>
            <div className="mt-4 flex items-center justify-between">
              <span className="inline-flex items-center gap-3 font-black text-dar-navy">
                <CreditCard className="size-5 text-dar-primary" />
                {booking.paymentMethodLabel}
              </span>
              <Link className="text-sm font-black text-dar-primary" href="/traveler/payments">
                Change
              </Link>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-black text-dar-navy">Cancellation policy</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-dar-muted">{booking.cancellationPolicy}</p>
            <Link className="mt-3 inline-block text-sm font-black text-dar-primary" href="/legal/cancellation-policy">
              View cancellation policy
            </Link>
            <div className="mt-6 grid gap-3">
              <PrimaryButton onClick={() => showToast({ description: "Manage booking actions are available from DAR support during this preview.", title: "Preview action", type: "info" })}>Manage booking</PrimaryButton>
              <DangerButton onClick={() => setCancelOpen(true)}>Cancel booking</DangerButton>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-black text-dar-navy">Quick summary</h2>
            <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-dar-muted">
              <CalendarDays className="size-4" />
              {formatDateRange(booking)} with {booking.guestsCount} guests
            </p>
          </Card>
        </aside>
      </div>

      {cancelOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4">
          <Card className="w-full max-w-lg p-5">
            <h2 className="text-xl font-black text-dar-navy">Cancel booking</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-dar-muted">{booking.cancellationPolicy}</p>
            <div className="mt-5">
              <TextAreaField
                label="Reason for cancellation"
                onChange={(event) => setReason(event.target.value)}
                placeholder="Tell us why you need to cancel."
                value={reason}
              />
            </div>
            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <SecondaryButton disabled={isPending} onClick={() => setCancelOpen(false)}>Keep booking</SecondaryButton>
              <DangerButton disabled={reason.trim().length < 10} loading={isPending} loadingLabel="Cancelling..." onClick={handleCancel}>
                Confirm cancellation
              </DangerButton>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
