import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import type { Database } from "@/lib/supabase/database.types";
import { requireAdmin } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import type { UserRecord, UsersPageData, UserCategory, UserMetric, UserRole, UserVerificationState, UserStatus } from "@/features/users/types";
import { getAdminSidebarGroups } from "@/features/users/data/users-management.data";
import { formatCurrencyMinor, formatNumber, formatLongDateTime, formatShortDateTime } from "./utils";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];
type PayoutRow = Database["public"]["Tables"]["payouts"]["Row"];
type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];
type VerificationRow = Database["public"]["Tables"]["owner_verifications"]["Row"];
type SupportTicketRow = Database["public"]["Tables"]["support_tickets"]["Row"];
type AuditLogRow = Database["public"]["Tables"]["audit_logs"]["Row"];

function getProfileName(profile: Pick<ProfileRow, "full_name" | "display_name" | "email">) {
  return profile.full_name || profile.display_name || profile.email || "DAR user";
}

function getVerificationState(
  profile: Pick<ProfileRow, "account_type" | "email_verified" | "phone_verified" | "identity_verified">,
  latestVerification: Pick<VerificationRow, "status"> | null,
): UserVerificationState {
  if (profile.account_type === "owner" && latestVerification) {
    if (latestVerification.status === "approved") return "verified";
    if (latestVerification.status === "submitted" || latestVerification.status === "under_review") return "pending";
    if (latestVerification.status === "rejected") return "unverified";
  }

  if (profile.email_verified && profile.phone_verified && profile.identity_verified) return "verified";
  if (profile.phone_verified && !profile.email_verified) return "phone-only";
  if (profile.email_verified || profile.phone_verified) return "pending";
  return "unverified";
}

function getVerificationLabel(role: UserRole, state: UserVerificationState, latestVerification: VerificationRow | null) {
  if (role === "owner") {
    if (latestVerification?.status === "approved") return "Owner verification approved";
    if (latestVerification?.status === "submitted" || latestVerification?.status === "under_review") {
      return "Owner verification pending";
    }
    if (latestVerification?.status === "rejected") return "Owner verification rejected";
  }

  switch (state) {
    case "verified":
      return "Email + phone verified";
    case "pending":
      return "Verification pending";
    case "phone-only":
      return "Phone only";
    default:
      return "Verification incomplete";
  }
}

function getUserStatus(profile: Pick<ProfileRow, "is_active" | "account_type">, latestVerification: VerificationRow | null): UserStatus {
  if (!profile.is_active) return "suspended";
  if (
    profile.account_type === "owner"
    && latestVerification
    && (latestVerification.status === "submitted" || latestVerification.status === "under_review")
  ) {
    return "pending";
  }

  return "active";
}

function buildChecklist(
  profile: Pick<ProfileRow, "email_verified" | "phone_verified" | "identity_verified" | "account_type">,
  latestVerification: VerificationRow | null,
  hasListings: boolean,
) {
  const items = [
    {
      id: "phone",
      label: "Phone verified",
      state: profile.phone_verified ? "verified" : "pending",
    },
    {
      id: "email",
      label: "Email verified",
      state: profile.email_verified ? "verified" : "pending",
    },
    {
      id: "identity",
      label: "Identity reviewed",
      state: profile.identity_verified ? "verified" : "pending",
    },
  ] as UserRecord["checklist"];

  if (profile.account_type === "owner") {
    items.push({
      id: "verification",
      label: "Owner verification",
      description: latestVerification?.status?.replaceAll("_", " ") ?? "not started",
      state:
        latestVerification?.status === "approved"
          ? "verified"
          : latestVerification?.status === "submitted" || latestVerification?.status === "under_review"
            ? "pending"
            : "missing",
    });
    items.push({
      id: "listings",
      label: "Property portfolio",
      description: hasListings ? "On file" : "No listings yet",
      state: hasListings ? "verified" : "pending",
    });
  }

  return items;
}

function buildAuditTimeline(logs: AuditLogRow[]) {
  return logs.slice(0, 4).map((log) => ({
    description: log.summary,
    id: log.id,
    state:
      log.action_type === "rejected" || log.action_type === "suspended" || log.action_type === "deleted"
        ? "alert" as const
        : "completed" as const,
    timestamp: formatLongDateTime(log.created_at),
    title: log.action_type.replaceAll("_", " "),
  }));
}

export async function getAdminUsersPageData(): Promise<UsersPageData> {
  noStore();
  await requireAdmin();
  const supabase = await createClient();

  const [
    profilesResult,
    propertiesResult,
    bookingsResult,
    payoutsResult,
    reviewsResult,
    verificationsResult,
    supportTicketsResult,
    auditLogsResult,
  ] = await Promise.all([
    supabase.from("profiles").select("id, account_type, full_name, display_name, email, phone, city, country, created_at, updated_at, email_verified, phone_verified, identity_verified, is_active, deactivated_at"),
    supabase.from("properties").select("id, owner_profile_id"),
    supabase.from("bookings").select("id, owner_id, traveler_id, total_amount, status, created_at"),
    supabase.from("payouts").select("id, owner_id, net_amount, status"),
    supabase.from("reviews").select("id, owner_id, traveler_id, rating"),
    supabase.from("owner_verifications").select("id, owner_profile_id, status, created_at, submitted_at, approved_at, rejected_at"),
    supabase.from("support_tickets").select("id, user_id, status, created_at"),
    supabase.from("audit_logs").select("id, actor_profile_id, entity_type, entity_id, action_type, summary, created_at").order("created_at", { ascending: false }),
  ]);

  if (
    profilesResult.error
    || propertiesResult.error
    || bookingsResult.error
    || payoutsResult.error
    || reviewsResult.error
    || verificationsResult.error
    || supportTicketsResult.error
    || auditLogsResult.error
  ) {
    throw new Error("Unable to load admin users data.");
  }

  const profiles = (profilesResult.data ?? []) as Array<
    Pick<ProfileRow, "id" | "account_type" | "full_name" | "display_name" | "email" | "phone" | "city" | "country" | "created_at" | "updated_at" | "email_verified" | "phone_verified" | "identity_verified" | "is_active" | "deactivated_at">
  >;
  const properties = (propertiesResult.data ?? []) as Array<Pick<PropertyRow, "id" | "owner_profile_id">>;
  const bookings = (bookingsResult.data ?? []) as Array<Pick<BookingRow, "id" | "owner_id" | "traveler_id" | "total_amount" | "status" | "created_at">>;
  const payouts = (payoutsResult.data ?? []) as Array<Pick<PayoutRow, "id" | "owner_id" | "net_amount" | "status">>;
  const reviews = (reviewsResult.data ?? []) as Array<Pick<ReviewRow, "id" | "owner_id" | "traveler_id" | "rating">>;
  const verifications = (verificationsResult.data ?? []) as VerificationRow[];
  const supportTickets = (supportTicketsResult.data ?? []) as Array<Pick<SupportTicketRow, "id" | "user_id" | "status" | "created_at">>;
  const auditLogs = (auditLogsResult.data ?? []) as AuditLogRow[];

  const latestVerificationByOwner = new Map<string, VerificationRow>();
  for (const verification of verifications) {
    const current = latestVerificationByOwner.get(verification.owner_profile_id);
    if (!current || new Date(verification.created_at).getTime() > new Date(current.created_at).getTime()) {
      latestVerificationByOwner.set(verification.owner_profile_id, verification);
    }
  }

  const propertyCountByOwner = new Map<string, number>();
  for (const property of properties) {
    propertyCountByOwner.set(property.owner_profile_id, (propertyCountByOwner.get(property.owner_profile_id) ?? 0) + 1);
  }

  const bookingCountByOwner = new Map<string, number>();
  const bookingCountByTraveler = new Map<string, number>();
  const bookingTotalByTraveler = new Map<string, number>();
  for (const booking of bookings) {
    bookingCountByOwner.set(booking.owner_id, (bookingCountByOwner.get(booking.owner_id) ?? 0) + 1);
    bookingCountByTraveler.set(booking.traveler_id, (bookingCountByTraveler.get(booking.traveler_id) ?? 0) + 1);
    bookingTotalByTraveler.set(booking.traveler_id, (bookingTotalByTraveler.get(booking.traveler_id) ?? 0) + booking.total_amount);
  }

  const payoutTotalByOwner = new Map<string, number>();
  for (const payout of payouts) {
    payoutTotalByOwner.set(payout.owner_id, (payoutTotalByOwner.get(payout.owner_id) ?? 0) + payout.net_amount);
  }

  const ownerRatings = new Map<string, { count: number; sum: number }>();
  for (const review of reviews) {
    const current = ownerRatings.get(review.owner_id) ?? { count: 0, sum: 0 };
    ownerRatings.set(review.owner_id, { count: current.count + 1, sum: current.sum + review.rating });
  }

  const supportCountByUser = new Map<string, number>();
  for (const ticket of supportTickets) {
    supportCountByUser.set(ticket.user_id, (supportCountByUser.get(ticket.user_id) ?? 0) + 1);
  }

  const auditLogMap = new Map<string, AuditLogRow[]>();
  for (const log of auditLogs) {
    const profileId = log.entity_type === "profile" ? log.entity_id : log.actor_profile_id;
    if (!profileId) continue;
    const current = auditLogMap.get(profileId) ?? [];
    current.push(log);
    auditLogMap.set(profileId, current);
  }

  const users: UserRecord[] = profiles.map((profile) => {
    const role = profile.account_type as UserRole;
    const latestVerification = latestVerificationByOwner.get(profile.id) ?? null;
    const verificationState = getVerificationState(profile, latestVerification);
    const status = getUserStatus(profile, latestVerification);
    const listingCount = propertyCountByOwner.get(profile.id) ?? 0;
    const ownerRating = ownerRatings.get(profile.id);
    const revenue =
      role === "owner"
        ? formatCurrencyMinor(payoutTotalByOwner.get(profile.id) ?? 0)
        : role === "guest"
          ? formatCurrencyMinor(bookingTotalByTraveler.get(profile.id) ?? 0)
          : "EGP 0";

    return {
      auditLog: buildAuditTimeline(auditLogMap.get(profile.id) ?? []),
      bookingRequests:
        role === "owner"
          ? bookingCountByOwner.get(profile.id) ?? 0
          : bookingCountByTraveler.get(profile.id) ?? 0,
      bookingsOrListings:
        role === "owner"
          ? `${listingCount} listings`
          : `${bookingCountByTraveler.get(profile.id) ?? 0} bookings`,
      checklist: buildChecklist(profile, latestVerification, listingCount > 0),
      city: profile.city || profile.country || "Egypt",
      email: profile.email,
      id: profile.id,
      isActive: profile.is_active,
      joinedDate: formatLongDateTime(profile.created_at),
      lastActivity: formatShortDateTime(profile.updated_at),
      listingCount,
      name: getProfileName(profile),
      phone: profile.phone ?? "Not provided",
      rating: ownerRating ? (ownerRating.sum / ownerRating.count).toFixed(1) : "0.0",
      revenue,
      risk: !profile.is_active ? "high" : verificationState === "pending" ? "medium" : "low",
      role,
      roleBadgeLabel:
        role === "owner"
          ? "Owner"
          : role === "admin"
            ? "Admin"
            : role === "support_staff"
              ? "Support"
              : undefined,
      status,
      statusVariant:
        status === "active" ? "active" : status === "pending" ? "pending" : "suspended",
      verificationId: latestVerification?.id ?? null,
      verificationLabel: getVerificationLabel(role, verificationState, latestVerification),
      verificationState,
    };
  });

  const highRiskUsers = users.filter((user) => user.risk === "high").length;
  const pendingOwners = verifications.filter(
    (verification) => verification.status === "submitted" || verification.status === "under_review",
  ).length;
  const openTickets = supportTickets.filter((ticket) => ticket.status !== "closed").length;

  const metrics: UserMetric[] = [
    {
      accent: "brand",
      icon: "users",
      key: "total",
      label: "Total users",
      trendDirection: "up",
      trendLabel: "Seed snapshot",
      trendValue: formatNumber(users.length),
      value: formatNumber(users.length),
    },
    {
      accent: "brand",
      icon: "guest",
      key: "guests",
      label: "Guests",
      trendDirection: "up",
      trendLabel: "Seed snapshot",
      trendValue: formatNumber(users.filter((user) => user.role === "guest").length),
      value: formatNumber(users.filter((user) => user.role === "guest").length),
    },
    {
      accent: "warning",
      icon: "owner",
      key: "owners",
      label: "Owners",
      trendDirection: "up",
      trendLabel: "Seed snapshot",
      trendValue: formatNumber(users.filter((user) => user.role === "owner").length),
      value: formatNumber(users.filter((user) => user.role === "owner").length),
    },
    {
      accent: "info",
      icon: "broker",
      key: "admins",
      label: "Admins",
      trendDirection: "up",
      trendLabel: "Seed snapshot",
      trendValue: formatNumber(users.filter((user) => user.role === "admin").length),
      value: formatNumber(users.filter((user) => user.role === "admin").length),
    },
    {
      accent: "info",
      icon: "hotel",
      key: "support",
      label: "Support staff",
      trendDirection: "up",
      trendLabel: "Seed snapshot",
      trendValue: formatNumber(users.filter((user) => user.role === "support_staff").length),
      value: formatNumber(users.filter((user) => user.role === "support_staff").length),
    },
    {
      accent: "danger",
      icon: "suspended",
      key: "suspended",
      label: "Suspended accounts",
      trendDirection: "up",
      trendLabel: "Seed snapshot",
      trendValue: formatNumber(users.filter((user) => user.status === "suspended").length),
      value: formatNumber(users.filter((user) => user.status === "suspended").length),
    },
  ];

  const countByCategory = (category: UserCategory) => {
    switch (category) {
      case "guests":
        return users.filter((user) => user.role === "guest").length;
      case "owners":
        return users.filter((user) => user.role === "owner").length;
      case "admins":
        return users.filter((user) => user.role === "admin").length;
      case "support":
        return users.filter((user) => user.role === "support_staff").length;
      case "suspended":
        return users.filter((user) => user.status === "suspended").length;
      case "pending":
        return users.filter((user) => user.status === "pending").length;
      default:
        return users.length;
    }
  };

  const initialUserId =
    users.find((user) => user.role === "owner" && user.status === "pending")?.id
    ?? users[0]?.id
    ?? "";

  return {
    categoryTabs: [
      { count: formatNumber(users.length), label: "All", value: "all" },
      { count: formatNumber(countByCategory("guests")), label: "Guests", value: "guests" },
      { count: formatNumber(countByCategory("owners")), label: "Owners", value: "owners" },
      { count: formatNumber(countByCategory("admins")), label: "Admins", value: "admins" },
      { count: formatNumber(countByCategory("support")), label: "Support", value: "support" },
      { count: formatNumber(countByCategory("suspended")), label: "Suspended", value: "suspended" },
      { count: formatNumber(countByCategory("pending")), label: "Pending verification", value: "pending" },
    ],
    filterOptions: {
      city: [{ label: "All cities", value: "all" }],
      joinedDate: [{ label: "All time", value: "all-time" }],
      role: [
        { label: "All roles", value: "all" },
        { label: "Guest", value: "guest" },
        { label: "Owner", value: "owner" },
        { label: "Admin", value: "admin" },
        { label: "Support staff", value: "support_staff" },
      ],
      rowsPerPage: [
        { label: "5 per page", value: 5 },
        { label: "10 per page", value: 10 },
        { label: "20 per page", value: 20 },
      ],
      status: [
        { label: "All statuses", value: "all" },
        { label: "Active", value: "active" },
        { label: "Pending", value: "pending" },
        { label: "Suspended", value: "suspended" },
      ],
      verification: [
        { label: "All verification states", value: "all" },
        { label: "Verified", value: "verified" },
        { label: "Pending", value: "pending" },
        { label: "Phone only", value: "phone-only" },
        { label: "Unverified", value: "unverified" },
      ],
    },
    initialCategory: "all",
    initialFilters: {
      city: "all",
      joinedDate: "all-time",
      role: "all",
      search: "",
      status: "all",
      verification: "all",
    },
    initialUserId,
    metrics,
    permissionItems: [
      { checked: true, id: "users", label: "Inspect user profiles" },
      { checked: true, id: "verifications", label: "Review owner verifications" },
      { checked: true, id: "support", label: "See linked support context" },
      { checked: false, id: "roles", label: "Grant privileged roles (deferred)" },
      { checked: false, id: "password", label: "Reset passwords (not implemented)" },
    ],
    roleOptions: [
      { label: "Admin", value: "admin" },
      { label: "Support staff", value: "support_staff" },
    ],
    sidebarGroups: getAdminSidebarGroups("users"),
    summaryCards: {
      linkedTickets: {
        actionLabel: "Open tickets",
        hint: "Support load",
        title: "Support tickets linked to users",
        tone: "info",
        value: `${formatNumber(openTickets)} open tickets`,
      },
      riskMonitor: {
        actionLabel: "Review accounts",
        hint: "Account state",
        title: "Risk monitor",
        tone: highRiskUsers ? "danger" : "brand",
        value: `${formatNumber(highRiskUsers)} suspended or high-risk users`,
      },
      verificationQueue: {
        actionLabel: "Open queue",
        hint: "Verification review",
        title: "Verification queue",
        tone: pendingOwners ? "warning" : "brand",
        value: `${formatNumber(pendingOwners)} owners pending review`,
      },
    },
    users,
  };
}
