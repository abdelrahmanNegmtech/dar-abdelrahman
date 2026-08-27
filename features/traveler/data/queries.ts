import { redirect } from "next/navigation";
import {
  getTravelerBookingById as getTravelerBookingByIdFromSupabase,
  getTravelerBookings as getTravelerBookingsFromSupabase,
} from "@/features/bookings/data/booking-queries";
import { getMessagingData, getMessagingUnreadCount } from "@/features/messaging/data/messaging-queries";
import {
  getTravelerNotificationsPageData,
  getUnreadNotificationCount,
} from "@/features/notifications/data/notification-queries";
import { getTravelerReviewsData as getTravelerReviewsDataFromSupabase } from "@/features/reviews/data/review-queries";
import {
  getMySupportTickets,
  getSupportTicketById as getSupportTicketByIdFromSupabase,
} from "@/features/support/data/support-ticket-queries";
import {
  getRecommendedTravelerProperties,
  getTravelerSavedProperties,
} from "./saved-property-queries";
import { DEV_AUTH_BYPASS_USER, isDevAuthBypassEnabled } from "@/lib/auth/devAuthBypass";
import { getSupabaseConfig } from "@/lib/supabase/config";
import type { ProfileRow } from "@/lib/supabase/database";
import { createClient } from "@/lib/supabase/server";
import type {
  BookingStatus,
  SupportTicket,
  TravelerData,
  TravelerProfile,
  TravelerReview,
} from "../types";
import { summarizeNotifications } from "../utils";
import { devProfile, devTravelerData } from "./devData";
import { getDevStore } from "./devStore";

type SupabaseProfileRow = Pick<
  ProfileRow,
  | "account_type"
  | "address"
  | "avatar_url"
  | "city"
  | "country"
  | "date_of_birth"
  | "display_name"
  | "email"
  | "email_verified"
  | "emergency_contact_name"
  | "emergency_contact_phone"
  | "full_name"
  | "id"
  | "identity_verified"
  | "nationality"
  | "phone"
  | "phone_verified"
  | "preferred_currency"
  | "preferred_language"
  | "profile_completion"
>;

const devAuthBypassTravelerProfile: TravelerProfile = {
  ...devProfile,
  activity: devProfile.activity,
  avatarUrl: DEV_AUTH_BYPASS_USER.avatarUrl,
  displayName: DEV_AUTH_BYPASS_USER.fullName.split(" ")[0],
  email: DEV_AUTH_BYPASS_USER.email,
  emailVerified: true,
  fullName: DEV_AUTH_BYPASS_USER.fullName,
  id: DEV_AUTH_BYPASS_USER.id,
  identityVerified: false,
  phoneVerified: true,
  role: DEV_AUTH_BYPASS_USER.role,
};

let travelerStoreSelectionLogged = false;

function normalizeAvatarUrl(value: string | null | undefined, fallback: string) {
  if (!value) {
    return fallback;
  }

  if (value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return fallback;
}

function cloneTravelerData(data: TravelerData): TravelerData {
  return JSON.parse(JSON.stringify(data)) as TravelerData;
}

function getTravelerStoreData(): TravelerData {
  if (isDevAuthBypassEnabled()) {
    if (!travelerStoreSelectionLogged) {
      console.info("[traveler:data] using development file-backed store");
      travelerStoreSelectionLogged = true;
    }
    return getDevStore();
  }

  if (!travelerStoreSelectionLogged) {
    console.info("[traveler:data] using production read-only seed store; filesystem persistence disabled");
    travelerStoreSelectionLogged = true;
  }
  return cloneTravelerData(devTravelerData);
}

function mapProfile(row: SupabaseProfileRow | null | undefined, fallback: TravelerProfile): TravelerProfile {
  if (!row) {
    return fallback;
  }

  const accountType: TravelerProfile["accountType"] =
    row.account_type === "owner" ? "owner" : "guest";

  return {
    ...fallback,
    accountType,
    activity: fallback.activity,
    address: row.address ?? fallback.address,
    avatarUrl: normalizeAvatarUrl(row.avatar_url, fallback.avatarUrl),
    city: row.city ?? fallback.city,
    completion: row.profile_completion,
    country: row.country ?? fallback.country,
    dateOfBirth: row.date_of_birth ?? fallback.dateOfBirth,
    displayName: row.display_name ?? fallback.displayName,
    email: row.email ?? fallback.email,
    emailVerified: row.email_verified,
    emergencyContactName: row.emergency_contact_name ?? fallback.emergencyContactName,
    emergencyContactPhone: row.emergency_contact_phone ?? fallback.emergencyContactPhone,
    fullName: row.full_name,
    id: row.id,
    identityVerified: row.identity_verified,
    nationality: row.nationality ?? fallback.nationality,
    phone: row.phone ?? fallback.phone,
    phoneVerified: row.phone_verified,
    preferredCurrency: row.preferred_currency ?? fallback.preferredCurrency,
    preferredLanguage: row.preferred_language ?? fallback.preferredLanguage,
  };
}

async function getAuthenticatedProfile() {
  if (isDevAuthBypassEnabled()) {
    // TEMPORARY LOCAL DEVELOPMENT PREVIEW BYPASS: supplies the mock traveler to
    // every Traveler Dashboard page while local route protection is bypassed.
    return {
      profile: devAuthBypassTravelerProfile,
      userId: devAuthBypassTravelerProfile.id,
      usingFallback: true,
    };
  }

  const config = getSupabaseConfig();

  if (!config) {
    return { profile: devProfile, userId: devProfile.id, usingFallback: true };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/traveler/dashboard");
  }

  const { data } = await supabase
    .from("profiles")
    .select(
      "id, account_type, full_name, display_name, email, phone, avatar_url, date_of_birth, nationality, preferred_language, preferred_currency, city, country, address, profile_completion, email_verified, phone_verified, identity_verified, emergency_contact_name, emergency_contact_phone",
    )
    .eq("id", user.id)
    .maybeSingle();

  return {
    profile: mapProfile(data, { ...devProfile, email: user.email ?? devProfile.email, id: user.id }),
    userId: user.id,
    usingFallback: false,
  };
}

export async function getTravelerData(): Promise<TravelerData> {
  const { profile, usingFallback } = await getAuthenticatedProfile();
  const data = getTravelerStoreData();
  const bookings =
    usingFallback || !getSupabaseConfig()
      ? data.bookings
      : await getTravelerBookingsFromSupabase();

  return {
    ...data,
    bookings,
    profile,
  };
}

export async function getTravelerShellData() {
  const data = await getTravelerData();
  const unreadMessages =
    !isDevAuthBypassEnabled() && getSupabaseConfig()
      ? await getMessagingUnreadCount("traveler")
      : data.conversations.reduce((total, conversation) => total + conversation.unreadCount, 0);
  const notificationsUnread =
    !isDevAuthBypassEnabled() && getSupabaseConfig()
      ? await getUnreadNotificationCount()
      : data.notifications.filter((notification) => !notification.isRead).length;
  return {
    notificationsUnread,
    profile: data.profile,
    unreadMessages,
  };
}

export async function getDashboardData() {
  const data = await getTravelerData();
  const upcomingBookings = data.bookings.filter((booking) => booking.status === "confirmed" || booking.status === "pending");
  const completedBookings = data.bookings.filter((booking) => booking.status === "completed");
  const upcomingStay = upcomingBookings[0] ?? null;
  const useSupabaseSavedProperties = !isDevAuthBypassEnabled() && getSupabaseConfig();
  const savedProperties = useSupabaseSavedProperties
    ? await getTravelerSavedProperties()
    : data.properties.filter((property) => property.isSaved);
  const recommendedProperties = useSupabaseSavedProperties
    ? await getRecommendedTravelerProperties(4)
    : data.properties.filter((property) => property.status === "published").slice(0, 4);
  const notificationsUnread =
    !isDevAuthBypassEnabled() && getSupabaseConfig()
      ? await getUnreadNotificationCount()
      : data.notifications.filter((notification) => !notification.isRead).length;

  return {
    completedBookings,
    notificationsUnread,
    paymentBalance: data.wallet.balance,
    profile: data.profile,
    recommendedProperties,
    reviewsCount: data.reviews.filter((review) => review.status === "submitted").length,
    savedCount: savedProperties.length,
    trips: upcomingBookings.concat(completedBookings).slice(0, 4),
    upcomingStay,
    upcomingStaysCount: upcomingBookings.length,
  };
}

export async function getBookingsData(status?: BookingStatus | "upcoming" | "past") {
  const data = await getTravelerData();
  const requestedStatus = status ?? "upcoming";
  const bookings = data.bookings.filter((booking) => {
    if (requestedStatus === "upcoming") return booking.status === "confirmed" || booking.status === "pending";
    if (requestedStatus === "past") return booking.status === "completed";
    return booking.status === requestedStatus;
  });

  return {
    bookings,
    stats: {
      pendingPayments: data.bookings.filter((booking) => booking.paymentStatus === "pending").length,
      totalNights: data.bookings.reduce((total, booking) => total + booking.nightsCount, 0),
      totalPaid: data.bookings
        .filter((booking) => booking.paymentStatus === "paid")
        .reduce((total, booking) => total + booking.totalAmount, 0),
      upcoming: data.bookings.filter((booking) => booking.status === "confirmed" || booking.status === "pending").length,
    },
  };
}

export async function getBookingDetailsData(bookingId: string) {
  if (!isDevAuthBypassEnabled() && getSupabaseConfig()) {
    return getTravelerBookingByIdFromSupabase(bookingId);
  }

  const data = await getTravelerData();
  return data.bookings.find((booking) => booking.id === bookingId || booking.reference === bookingId) ?? null;
}

export async function getSavedPropertiesData() {
  if (!isDevAuthBypassEnabled() && getSupabaseConfig()) {
    return {
      properties: await getTravelerSavedProperties(),
    };
  }

  const data = await getTravelerData();
  return {
    properties: data.properties.filter((property) => property.isSaved),
  };
}

export async function getMessagesData(selectedConversationId?: string, bookingId?: string) {
  if (!isDevAuthBypassEnabled() && getSupabaseConfig()) {
    return getMessagingData("traveler", {
      bookingId,
      selectedConversationId,
    });
  }

  const data = await getTravelerData();
  const selectedConversation =
    data.conversations.find((conversation) => conversation.id === selectedConversationId) ?? data.conversations[0] ?? null;

  return {
    conversations: data.conversations,
    selectedConversation,
  };
}

export async function getNotificationsData(type?: string) {
  if (!isDevAuthBypassEnabled() && getSupabaseConfig()) {
    const allowedFilters = new Set(["all", "approval", "booking", "message", "payment", "support", "system", "unread"]);
    const filter = allowedFilters.has(type ?? "") ? type as "all" | "approval" | "booking" | "message" | "payment" | "support" | "system" | "unread" : "all";
    return getTravelerNotificationsPageData(filter);
  }

  const data = await getTravelerData();
  const notifications = type && type !== "all"
    ? data.notifications.filter((notification) => notification.type === type || (type === "unread" && !notification.isRead))
    : data.notifications;

  return {
    notifications,
    stats: summarizeNotifications(data.notifications),
  };
}

export async function getReviewsData() {
  if (!isDevAuthBypassEnabled() && getSupabaseConfig()) {
    return getTravelerReviewsDataFromSupabase();
  }

  const data = await getTravelerData();

  // Reviews the traveler has already submitted
  const submitted = data.reviews.filter((review) => review.status === "submitted");

  // Completed bookings that do NOT have a submitted review yet -> pending
  const submittedBookingIds = new Set(submitted.map((r) => r.bookingId));
  const explicitPending = data.reviews.filter((review) => review.status === "pending");
  const pendingBookingIds = new Set(explicitPending.map((review) => review.bookingId));
  const pending = data.bookings
    .filter((b) => b.status === "completed" && !submittedBookingIds.has(b.id))
    .filter((b) => !pendingBookingIds.has(b.id))
    .map(
      (booking): TravelerReview => ({
        accuracyRating: 0,
        bookingId: booking.id,
        cleanlinessRating: 0,
        comment: "",
        communicationRating: 0,
        createdAt: booking.checkOut,
        hostName: booking.owner.name,
        id: `pending-${booking.id}`,
        locationRating: 0,
        property: booking.property,
        rating: 0,
        status: "pending" as const,
        travelerAvatarUrl: data.profile.avatarUrl,
        travelerName: data.profile.fullName,
        valueRating: 0,
      }),
    );

  const allPending = [...explicitPending, ...pending];

  return {
    pending: allPending,
    reviews: [...allPending, ...submitted],
    submitted,
  };
}

export async function getPaymentsData() {
  const data = await getTravelerData();
  return {
    bookings: data.bookings,
    methods: data.paymentMethods,
    transactions: data.transactions,
    wallet: data.wallet,
  };
}

export async function getProfileData() {
  const data = await getTravelerData();
  const profile = data.profile;

  // Calculate dynamic completion
  const checks = [
    profile.fullName.trim().length >= 2,
    profile.avatarUrl.length > 0,
    profile.emailVerified,
    profile.phoneVerified,
    profile.dateOfBirth.length > 0,
    profile.address.trim().length > 0 && profile.city.trim().length > 0 && profile.country.trim().length > 0,
    profile.emergencyContactName.trim().length > 0 && profile.emergencyContactPhone.trim().length > 0,
    profile.identityVerified,
  ];
  const completed = checks.filter(Boolean).length;
  const completion = Math.round((completed / checks.length) * 100);

  return {
    activity: profile.activity,
    completion,
    completionChecks: checks,
    methods: data.paymentMethods,
    profile: { ...profile, completion },
    settings: data.settings,
  };
}

export async function getSettingsData() {
  const data = await getTravelerData();
  return {
    profile: data.profile,
    settings: data.settings,
  };
}

export async function getSupportData() {
  if (!isDevAuthBypassEnabled() && getSupabaseConfig()) {
    const bookings = await getTravelerBookingsFromSupabase();
    return {
      bookings,
      tickets: await getMySupportTickets(bookings),
    };
  }

  const data = await getTravelerData();
  return {
    bookings: data.bookings,
    tickets: data.tickets,
  };
}

export async function getSupportTicketData(ticketId: string): Promise<SupportTicket | null> {
  if (!isDevAuthBypassEnabled() && getSupabaseConfig()) {
    const bookings = await getTravelerBookingsFromSupabase();
    return getSupportTicketByIdFromSupabase(ticketId, bookings);
  }

  const data = await getTravelerData();
  return data.tickets.find((ticket) => ticket.id === ticketId || ticket.reference === ticketId) ?? null;
}
