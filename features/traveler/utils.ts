import type { TravelerBooking, TravelerNotification, TravelerProperty } from "./types";

export function formatCurrency(amount: number, currency = "EGP") {
  return new Intl.NumberFormat("en-US", {
    currency,
    maximumFractionDigits: 0,
    style: "currency",
  })
    .format(amount)
    .replace("EGP", "EGP");
}

export function formatDateRange(booking: Pick<TravelerBooking, "checkIn" | "checkOut">) {
  const checkIn = new Date(booking.checkIn);
  const checkOut = new Date(booking.checkOut);
  const formatter = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short" });
  return `${formatter.format(checkIn)} - ${formatter.format(checkOut)}`;
}

export function getStatusLabel(status: string) {
  return status
    .split("_")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export function summarizeNotifications(notifications: TravelerNotification[]) {
  return {
    approvals: notifications.filter((notification) => notification.type === "approval").length,
    booking: notifications.filter((notification) => notification.type === "booking").length,
    message: notifications.filter((notification) => notification.type === "message").length,
    payment: notifications.filter((notification) => notification.type === "payment").length,
    support: notifications.filter((notification) => notification.type === "support").length,
    system: notifications.filter((notification) => notification.type === "system").length,
    unread: notifications.filter((notification) => !notification.isRead).length,
  };
}

export function getSavedCategories(properties: TravelerProperty[]) {
  return [
    { count: properties.length, id: "all", label: "All" },
    { count: properties.filter((property) => property.type === "apartment").length, id: "apartment", label: "Apartments" },
    { count: properties.filter((property) => property.type === "studio").length, id: "studio", label: "Studios" },
    { count: properties.filter((property) => property.type === "villa").length, id: "villa", label: "Villas" },
    { count: properties.filter((property) => property.type === "duplex").length, id: "duplex", label: "Duplexes" },
  ];
}
