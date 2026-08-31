import type {
  OwnerSupportSenderRole,
  OwnerSupportTicketCategory,
  OwnerSupportTicketPriority,
  OwnerSupportTicketStatus,
} from "./owner-support-types";

/**
 * Format snake_case database enum values to human-readable labels.
 * E.g. "payment_issue" → "Payment Issue"
 */
function formatEnumLabel(value: string): string {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const statusLabels: Record<OwnerSupportTicketStatus, string> = {
  awaiting_customer: "Awaiting you",
  awaiting_support: "Awaiting DAR",
  closed: "Closed",
  escalated: "Escalated",
  in_progress: "In Progress",
  open: "Open",
  resolved: "Resolved",
};

const categoryLabels: Record<OwnerSupportTicketCategory, string> = {
  account_issue: "Account Issue",
  booking_issue: "Booking Issue",
  other: "Other",
  payment_issue: "Payment Issue",
  property_issue: "Property Issue",
  refund_request: "Refund Request",
  technical_issue: "Technical Issue",
  verification_issue: "Verification Issue",
};

const priorityLabels: Record<OwnerSupportTicketPriority, string> = {
  high: "High",
  low: "Low",
  medium: "Medium",
  urgent: "Urgent",
};

const roleLabels: Record<OwnerSupportSenderRole, string> = {
  owner: "You",
  support_staff: "DAR Support",
  system: "System",
  traveler: "Guest",
};

export function getStatusLabel(
  status: OwnerSupportTicketStatus,
): string {
  return statusLabels[status] ?? formatEnumLabel(status);
}

export function getCategoryLabel(
  category: OwnerSupportTicketCategory,
): string {
  return categoryLabels[category] ?? formatEnumLabel(category);
}

export function getPriorityLabel(
  priority: OwnerSupportTicketPriority,
): string {
  return priorityLabels[priority] ?? formatEnumLabel(priority);
}

export function getRoleLabel(role: OwnerSupportSenderRole): string {
  return roleLabels[role] ?? formatEnumLabel(role);
}

/**
 * Returns a Tailwind color class pair (bg + text) for a support status.
 */
export function getStatusColorClass(
  status: OwnerSupportTicketStatus,
): { bg: string; text: string } {
  switch (status) {
    case "open":
      return { bg: "bg-emerald-50", text: "text-emerald-700" };
    case "in_progress":
      return { bg: "bg-amber-50", text: "text-amber-700" };
    case "awaiting_support":
      return { bg: "bg-amber-50", text: "text-amber-700" };
    case "awaiting_customer":
      return { bg: "bg-sky-50", text: "text-sky-700" };
    case "resolved":
      return { bg: "bg-emerald-50", text: "text-emerald-700" };
    case "closed":
      return { bg: "bg-slate-100", text: "text-slate-600" };
    case "escalated":
      return { bg: "bg-red-50", text: "text-red-700" };
    default:
      return { bg: "bg-slate-100", text: "text-slate-600" };
  }
}

/**
 * Returns a Tailwind color class pair for a priority level.
 */
export function getPriorityColorClass(
  priority: OwnerSupportTicketPriority,
): { bg: string; text: string } {
  switch (priority) {
    case "urgent":
      return { bg: "bg-red-50", text: "text-red-700" };
    case "high":
      return { bg: "bg-red-50", text: "text-red-600" };
    case "medium":
      return { bg: "bg-amber-50", text: "text-amber-700" };
    case "low":
      return { bg: "bg-emerald-50", text: "text-emerald-700" };
    default:
      return { bg: "bg-slate-100", text: "text-slate-600" };
  }
}

/**
 * Format a date string to a localized short format.
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format a date string to a full datetime format.
 */
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString("en-US", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Category options for the create ticket form. */
export const CATEGORY_OPTIONS = [
  { value: "payment_issue", label: "Payment Issue" },
  { value: "booking_issue", label: "Booking Issue" },
  { value: "refund_request", label: "Refund Request" },
  { value: "property_issue", label: "Property Issue" },
  { value: "account_issue", label: "Account Issue" },
  { value: "verification_issue", label: "Verification Issue" },
  { value: "technical_issue", label: "Technical Issue" },
  { value: "other", label: "Other" },
] as const;

/** Priority options for the create ticket form. */
export const PRIORITY_OPTIONS = [
  { value: "low", label: "Low — General inquiry" },
  { value: "medium", label: "Medium — Needs attention" },
  { value: "high", label: "High — Important issue" },
  { value: "urgent", label: "Urgent — Critical issue" },
] as const;
