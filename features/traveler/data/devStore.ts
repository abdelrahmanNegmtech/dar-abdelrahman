/**
 * Development/E2E-only mutable traveler data store.
 *
 * Production traveler pages must not write runtime data into the application
 * directory. This store is therefore enabled only while the local development
 * auth bypass is active. When disabled, callers receive immutable seed data
 * and no filesystem directory is created.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { SupportTicket, SupportTicketPriority, TravelerBooking, TravelerData, TravelerReview } from "../types";
import { devTravelerData } from "./devData";

// --------------- helpers ---------------

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

function isDevStoreEnabled(): boolean {
  return process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === "true";
}

function getStoreDirectory(): string {
  return join(tmpdir(), "dar-traveler-e2e");
}

function getStoreFile(): string {
  return join(getStoreDirectory(), "dev-store.json");
}

function ensureStoreDir(): boolean {
  if (!isDevStoreEnabled()) {
    return false;
  }

  const dir = getStoreDirectory();
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  return true;
}
/** In-memory cache so we don't read the file on every query. */
let cache: TravelerData | null = null;

function readStoreFromDisk(): TravelerData {
  if (cache) return cache;

  if (!ensureStoreDir()) {
    return deepClone(devTravelerData);
  }

  const storeFile = getStoreFile();

  if (!existsSync(storeFile)) {
    // First run: write the seed data to disk.
    cache = deepClone(devTravelerData);
    writeFileSync(storeFile, JSON.stringify(cache, null, 2), "utf-8");
    return cache;
  }

  try {
    const raw = readFileSync(storeFile, "utf-8");
    cache = JSON.parse(raw) as TravelerData;
    return cache;
  } catch {
    // Corrupted file: fall back to seed data.
    cache = deepClone(devTravelerData);
    writeFileSync(storeFile, JSON.stringify(cache, null, 2), "utf-8");
    return cache;
  }
}

function persist(): void {
  if (!cache) return;
  if (!ensureStoreDir()) return;
  writeFileSync(getStoreFile(), JSON.stringify(cache, null, 2), "utf-8");
}

// --------------- public API ---------------

/** Re-seed the store from the static dev data and overwrite the file. */
export function resetDevStore(): void {
  cache = deepClone(devTravelerData);
  persist();
}

/** Return the current mutable store data (reads from disk on first call, then cache). */
export function getDevStore(): TravelerData {
  return readStoreFromDisk();
}

// Notifications

export function devMarkNotificationRead(notificationId: string): boolean {
  const store = readStoreFromDisk();
  const notification = store.notifications.find((n) => n.id === notificationId);
  if (!notification) return false;
  notification.isRead = true;
  persist();
  return true;
}

export function devMarkNotificationUnread(notificationId: string): boolean {
  const store = readStoreFromDisk();
  const notification = store.notifications.find((n) => n.id === notificationId);
  if (!notification) return false;
  notification.isRead = false;
  persist();
  return true;
}

export function devMarkAllNotificationsRead(): void {
  const store = readStoreFromDisk();
  for (const notification of store.notifications) {
    notification.isRead = true;
  }
  persist();
}

export function devDeleteNotification(notificationId: string): boolean {
  const store = readStoreFromDisk();
  const idx = store.notifications.findIndex((n) => n.id === notificationId);
  if (idx === -1) return false;
  store.notifications.splice(idx, 1);
  persist();
  return true;
}

// Reviews

export function devSubmitReview(bookingId: string, profile: { fullName: string; avatarUrl: string; id: string }, reviewData: {
  accuracyRating: number;
  cleanlinessRating: number;
  comment: string;
  communicationRating: number;
  locationRating: number;
  rating: number;
  valueRating: number;
}): boolean {
  const store = readStoreFromDisk();
  const booking = store.bookings.find((b) => b.id === bookingId);
  if (!booking) return false;

  const newReview: TravelerReview = {
    id: `review-${Date.now()}`,
    accuracyRating: reviewData.accuracyRating,
    bookingId,
    cleanlinessRating: reviewData.cleanlinessRating,
    comment: reviewData.comment,
    communicationRating: reviewData.communicationRating,
    createdAt: new Date().toISOString(),
    hostName: booking.owner.name,
    locationRating: reviewData.locationRating,
    ownerResponse: undefined,
    property: booking.property,
    rating: reviewData.rating,
    status: "submitted",
    travelerAvatarUrl: profile.avatarUrl,
    travelerName: profile.fullName,
    valueRating: reviewData.valueRating,
  };

  store.reviews.push(newReview);
  persist();
  return true;
}

export function devUpdateReview(reviewId: string, updates: {
  accuracyRating: number;
  cleanlinessRating: number;
  comment: string;
  communicationRating: number;
  locationRating: number;
  rating: number;
  valueRating: number;
}): boolean {
  const store = readStoreFromDisk();
  const review = store.reviews.find((r) => r.id === reviewId);
  if (!review) return false;
  review.accuracyRating = updates.accuracyRating;
  review.cleanlinessRating = updates.cleanlinessRating;
  review.comment = updates.comment;
  review.communicationRating = updates.communicationRating;
  review.locationRating = updates.locationRating;
  review.rating = updates.rating;
  review.valueRating = updates.valueRating;
  review.status = "submitted";
  persist();
  return true;
}

export function devDeleteReview(reviewId: string): boolean {
  const store = readStoreFromDisk();
  const idx = store.reviews.findIndex((r) => r.id === reviewId);
  if (idx === -1) return false;
  store.reviews.splice(idx, 1);
  persist();
  return true;
}

// Support Tickets

export function devCreateSupportTicket(ticket: {
  id: string;
  reference: string;
  subject: string;
  category: string;
  priority: string;
  message: string;
  booking: TravelerBooking | undefined;
}): boolean {
  const store = readStoreFromDisk();
  const newTicket: SupportTicket = {
    id: ticket.id,
    reference: ticket.reference,
    subject: ticket.subject,
    category: ticket.category,
    priority: ticket.priority as SupportTicketPriority,
    status: "open",
    booking: ticket.booking,
    assignedAgent: undefined,
    expectedReplyAt: new Date(Date.now() + 8 * 3600000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [
      {
        attachments: [],
        createdAt: new Date().toISOString(),
        id: `ticket-msg-${Date.now()}`,
        message: ticket.message,
        senderAvatarUrl: store.profile.avatarUrl,
        senderId: store.profile.id,
        senderName: store.profile.fullName,
        senderRole: "traveler",
      },
    ],
  };
  store.tickets.push(newTicket);
  persist();
  return true;
}

export function devReplyToSupportTicket(ticketId: string, message: string): boolean {
  const store = readStoreFromDisk();
  const ticket = store.tickets.find((t) => t.id === ticketId);
  if (!ticket) return false;
  ticket.messages.push({
    attachments: [],
    createdAt: new Date().toISOString(),
    id: `ticket-msg-${Date.now()}`,
    message,
    senderAvatarUrl: store.profile.avatarUrl,
    senderId: store.profile.id,
    senderName: store.profile.fullName,
    senderRole: "traveler",
  });
  ticket.status = "awaiting_dar";
  ticket.updatedAt = new Date().toISOString();
  persist();
  return true;
}

export function devUpdateTicketStatus(ticketId: string, status: "open" | "closed"): boolean {
  const store = readStoreFromDisk();
  const ticket = store.tickets.find((t) => t.id === ticketId);
  if (!ticket) return false;
  ticket.status = status === "closed" ? "closed" : "open";
  ticket.updatedAt = new Date().toISOString();
  persist();
  return true;
}

// Conversations

export function devMarkConversationRead(conversationId: string): boolean {

  const store = readStoreFromDisk();
  const conversation = store.conversations.find((c) => c.id === conversationId);
  if (!conversation) return false;
  conversation.unreadCount = 0;
  for (const message of conversation.messages) {
    if (!message.isOwn) {
      message.readAt = new Date().toISOString();
    }
  }
  persist();
  return true;
}
