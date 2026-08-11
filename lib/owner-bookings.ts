"use client";

import { useSyncExternalStore } from "react";

export const OWNER_BOOKINGS_STORAGE_KEY = "dar-owner-bookings";

const OWNER_BOOKINGS_UPDATED_EVENT = "dar-owner-bookings-updated";

export type OwnerBookingStatus = "Pending" | "Confirmed" | "Cancelled";

export type OwnerBooking = {
  id: string;
  property: string;
  guest: string;
  dates: string;
  total: number;
  status: OwnerBookingStatus;
};

export const OWNER_BOOKINGS_FALLBACK: OwnerBooking[] = [
  { id: "BK-1001", property: "Modern Apartment in Zamalek", guest: "Omar Khaled", dates: "May 25-28, 2026", total: 8400, status: "Pending" },
  { id: "BK-1002", property: "Modern Apartment in Zamalek", guest: "Sara Ahmed", dates: "Jun 1-5, 2026", total: 12000, status: "Confirmed" },
  { id: "BK-1003", property: "Studio in New Capital", guest: "Lina Mohamed", dates: "May 20-22, 2026", total: 3600, status: "Cancelled" },
  { id: "BK-1004", property: "Luxury Villa in New Cairo", guest: "Khaled Hassan", dates: "Jun 10-17, 2026", total: 59500, status: "Pending" },
  { id: "BK-1005", property: "Serviced Apartment in Maadi", guest: "Nour Ahmed", dates: "May 15-20, 2026", total: 16000, status: "Confirmed" },
  { id: "BK-1006", property: "Modern Apartment in Zamalek", guest: "Mariam Ali", dates: "Jul 1-8, 2026", total: 19600, status: "Pending" },
];

let cachedRaw: string | null | undefined;
let cachedBookings: OwnerBooking[] = OWNER_BOOKINGS_FALLBACK;

function isOwnerBooking(value: unknown): value is OwnerBooking {
  if (!value || typeof value !== "object") return false;
  const booking = value as Partial<OwnerBooking>;
  return typeof booking.id === "string"
    && typeof booking.property === "string"
    && typeof booking.guest === "string"
    && typeof booking.dates === "string"
    && typeof booking.total === "number"
    && Number.isFinite(booking.total)
    && (booking.status === "Pending" || booking.status === "Confirmed" || booking.status === "Cancelled");
}

function isValidOwnerBookings(value: unknown): value is OwnerBooking[] {
  if (!Array.isArray(value) || value.length !== OWNER_BOOKINGS_FALLBACK.length || !value.every(isOwnerBooking)) return false;
  const expectedIds = new Set(OWNER_BOOKINGS_FALLBACK.map((booking) => booking.id));
  return new Set(value.map((booking) => booking.id)).size === value.length
    && value.every((booking) => expectedIds.has(booking.id));
}

export function readOwnerBookings(): OwnerBooking[] {
  if (typeof window === "undefined") return OWNER_BOOKINGS_FALLBACK;

  let raw: string | null;
  try {
    raw = window.localStorage.getItem(OWNER_BOOKINGS_STORAGE_KEY);
  } catch {
    return OWNER_BOOKINGS_FALLBACK;
  }

  if (raw === cachedRaw) return cachedBookings;
  cachedRaw = raw;

  if (!raw) {
    cachedBookings = OWNER_BOOKINGS_FALLBACK;
    return cachedBookings;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    cachedBookings = isValidOwnerBookings(parsed) ? parsed : OWNER_BOOKINGS_FALLBACK;
  } catch {
    cachedBookings = OWNER_BOOKINGS_FALLBACK;
  }

  return cachedBookings;
}

export function writeOwnerBookings(bookings: OwnerBooking[]): boolean {
  if (typeof window === "undefined" || !isValidOwnerBookings(bookings)) return false;

  try {
    const raw = JSON.stringify(bookings);
    window.localStorage.setItem(OWNER_BOOKINGS_STORAGE_KEY, raw);
    cachedRaw = raw;
    cachedBookings = bookings;
    window.dispatchEvent(new Event(OWNER_BOOKINGS_UPDATED_EVENT));
    return true;
  } catch {
    return false;
  }
}

function subscribeOwnerBookings(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === OWNER_BOOKINGS_STORAGE_KEY) onStoreChange();
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(OWNER_BOOKINGS_UPDATED_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(OWNER_BOOKINGS_UPDATED_EVENT, onStoreChange);
  };
}

export function useOwnerBookings() {
  return useSyncExternalStore(subscribeOwnerBookings, readOwnerBookings, () => OWNER_BOOKINGS_FALLBACK);
}
