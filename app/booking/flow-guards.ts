"use client";

import { compactBookingQuery, shortPath } from "@/app/routing";

export type BookingStep =
  | "room"
  | "guest"
  | "payment-method"
  | "checkout"
  | "request-received"
  | "pending"
  | "failed"
  | "confirmed"
  | "invoice"
  | "booking-details"
  | "cancelled";

export type StoredBooking = Record<string, unknown> & {
  propertyId?: string;
  hotelId?: string;
  listingType?: "hotel" | "apartment";
  selectedRoomId?: string;
  guestInfo?: Record<string, unknown>;
  paymentMethod?: string;
  paymentDetails?: {
    phoneCountryCode?: string;
    vodafoneNumber?: string;
    senderPhone?: string;
    cardNumber?: string;
    cardExpiry?: string;
    cardCvv?: string;
    cardName?: string;
    instapayAlias?: string;
    transferReference?: string;
    receiptFileName?: string;
    receiptFileType?: string;
    receiptFileSize?: number;
    houseRules?: boolean;
    termsAccepted?: boolean;
  };
  promoCode?: string;
  promoDiscount?: number;
  promoStatus?: "idle" | "applied" | "invalid";
  paymentSubmitted?: boolean;
  bookingStatus?: string;
  bookingId?: string;
  bookingReference?: string;
  confirmationNumber?: string;
  cancellation?: Record<string, unknown>;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  nights?: number;
  locale?: string;
};

export const bookingStorageKey = "dar-pending-booking";
const receiptRequiredMethods = new Set(["vodafone", "instapay", "fawry", "bank"]);
const receiptTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const maxReceiptSize = 10 * 1024 * 1024;

export function readStoredBooking(): StoredBooking | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(bookingStorageKey);
    if (!raw) {
      return null;
    }

    const booking = JSON.parse(raw) as StoredBooking;
    return booking.propertyId || booking.hotelId ? booking : null;
  } catch {
    return null;
  }
}

export function writeStoredBooking(booking: StoredBooking) {
  window.sessionStorage.setItem(bookingStorageKey, JSON.stringify(booking));
}

export function isHotelBooking(booking: StoredBooking | null) {
  return booking?.listingType === "hotel" || Boolean(booking?.hotelId);
}

export function hasDateSelection(booking: StoredBooking | null) {
  return Boolean(booking?.checkIn && booking.checkOut && booking.guests && booking.nights);
}

export function hasSelectedRoom(booking: StoredBooking | null) {
  return !isHotelBooking(booking) || Boolean(booking?.selectedRoomId);
}

export function hasGuestInfo(booking: StoredBooking | null) {
  const guest = booking?.guestInfo;
  return Boolean(
    guest &&
      typeof guest.fullName === "string" &&
      guest.fullName.trim() &&
      typeof guest.email === "string" &&
      /^\S+@\S+\.\S+$/.test(guest.email) &&
      typeof guest.phone === "string" &&
      guest.phone.trim(),
  );
}

export function hasHotelGuestInfo(booking: StoredBooking | null) {
  const guest = booking?.guestInfo;
  return Boolean(
    hasGuestInfo(booking) &&
      typeof guest?.nationality === "string" &&
      guest.nationality.trim() &&
      typeof guest.documentId === "string" &&
      guest.documentId.trim() &&
      typeof guest.arrivalTime === "string" &&
      guest.arrivalTime.trim(),
  );
}

export function hasPaymentMethod(booking: StoredBooking | null) {
  return Boolean(booking?.paymentMethod);
}

export function hasValidPaymentDetails(booking: StoredBooking | null) {
  if (!booking?.paymentMethod) return false;
  const details = booking.paymentDetails ?? {};
  const digits = (value?: string) => String(value ?? "").replace(/\D/g, "");
  const hasRequiredReceipt =
    !receiptRequiredMethods.has(booking.paymentMethod) ||
    Boolean(
      details.receiptFileName?.trim() &&
        details.receiptFileType &&
        receiptTypes.includes(details.receiptFileType) &&
        Number(details.receiptFileSize) > 0 &&
        Number(details.receiptFileSize) <= maxReceiptSize,
    );

  if (!hasRequiredReceipt || !details.houseRules || !details.termsAccepted) return false;

  if (["card", "meeza", "paymob"].includes(booking.paymentMethod)) {
    return (
      digits(details.cardNumber).length >= 12 &&
      /^\d{2}\s*\/\s*\d{2}$/.test(details.cardExpiry ?? "") &&
      /^\d{3,4}$/.test(details.cardCvv ?? "") &&
      Boolean(details.cardName?.trim())
    );
  }

  if (booking.paymentMethod === "vodafone") {
    return digits(details.vodafoneNumber).length >= 10 && digits(details.senderPhone).length >= 10;
  }

  if (booking.paymentMethod === "instapay") {
    return Boolean(details.instapayAlias?.trim() && details.transferReference?.trim());
  }

  if (["fawry", "bank"].includes(booking.paymentMethod)) {
    return Boolean(details.transferReference?.trim());
  }

  return booking.paymentMethod === "arrival";
}

export function hasCreatedBooking(booking: StoredBooking | null) {
  return Boolean(
    booking?.bookingId ||
      booking?.bookingReference ||
      booking?.confirmationNumber ||
      ["request_received", "payment_pending", "payment_failed", "confirmed", "cancelled"].includes(String(booking?.bookingStatus ?? "")),
  );
}

export function localizedGuardPath(booking: StoredBooking | null, path: string) {
  const locale = booking?.locale ?? "en";
  return shortPath(path, locale);
}

export function hotelRoomPath(booking: StoredBooking | null) {
  const query = compactBookingQuery({
    hotel: String(booking?.hotelId ?? booking?.propertyId ?? ""),
    property: String(booking?.propertyId ?? booking?.hotelId ?? ""),
    checkIn: booking?.checkIn,
    checkOut: booking?.checkOut,
    guests: booking?.guests,
    nights: booking?.nights,
    locale: booking?.locale ?? "en",
  });
  return `${localizedGuardPath(booking, "/booking/rooms")}${query ? `?${query}` : ""}`;
}

export function requiredRedirectForStep(step: BookingStep, booking = readStoredBooking()): string | null {
  if (!booking) {
    if (step === "room" || step === "guest") {
      return null;
    }

    if (step === "payment-method" || step === "checkout") {
      return localizedGuardPath(null, "/booking");
    }

    return localizedGuardPath(null, "/");
  }

  if (step === "room") {
    return null;
  }

  if (!hasDateSelection(booking)) {
    return localizedGuardPath(booking, isHotelBooking(booking) ? "/hotels" : "/");
  }

  if (step === "guest") {
    return hasSelectedRoom(booking) ? null : hotelRoomPath(booking);
  }

  if (["payment-method", "checkout"].includes(step)) {
    if (!hasSelectedRoom(booking)) return hotelRoomPath(booking);
    if (isHotelBooking(booking) && !hasHotelGuestInfo(booking)) {
      return `${localizedGuardPath(booking, "/booking/hotel/guest")}?${compactBookingQuery({
        hotel: String(booking.hotelId ?? booking.propertyId),
        property: String(booking.propertyId ?? booking.hotelId),
        checkIn: String(booking.checkIn),
        checkOut: String(booking.checkOut),
        guests: String(booking.guests),
        nights: String(booking.nights),
        locale: String(booking.locale ?? "en"),
      })}`;
    }
    if (!isHotelBooking(booking) && !hasGuestInfo(booking)) {
      return localizedGuardPath(booking, "/booking");
    }
    if (step === "checkout" && !hasPaymentMethod(booking)) {
      return localizedGuardPath(booking, isHotelBooking(booking) ? "/booking/hotel/payment" : "/booking");
    }
    if (step === "checkout" && !isHotelBooking(booking) && !hasValidPaymentDetails(booking)) {
      return localizedGuardPath(booking, "/booking/payment");
    }
    return null;
  }

  if (["request-received", "pending", "booking-details"].includes(step)) {
    return hasCreatedBooking(booking) || booking.paymentSubmitted ? null : localizedGuardPath(booking, "/checkout");
  }

  if (step === "failed") {
    return booking.bookingStatus === "payment_failed" ? null : localizedGuardPath(booking, "/checkout");
  }

  if (step === "confirmed" || step === "invoice") {
    return booking.bookingStatus === "confirmed" ? null : localizedGuardPath(booking, "/booking/pending");
  }

  if (step === "cancelled") {
    return booking.bookingStatus === "cancelled" || Boolean(booking.cancellation) ? null : localizedGuardPath(booking, "/bookings");
  }

  return null;
}
