import { OwnerShell } from "@/components/owner/owner-shell";
import { getOwnerSupportTickets, getOwnerSupportBookingReferences } from "@/features/support/owner/owner-support-queries";
import type { OwnerSupportBookingReference, OwnerSupportTicketListItem } from "@/features/support/owner/owner-support-types";
import { OwnerHelpCenterContent } from "@/features/support/owner/components/owner-help-center-content";

async function loadOwnerTickets(): Promise<{
  bookings: OwnerSupportBookingReference[];
  error: string | null;
  tickets: OwnerSupportTicketListItem[];
}> {
  try {
    const [tickets, bookings] = await Promise.all([
      getOwnerSupportTickets(),
      getOwnerSupportBookingReferences(),
    ]);
    return { bookings, error: null, tickets };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unable to load support tickets.";
    return { bookings: [], error: message, tickets: [] };
  }
}

function computeCounts(tickets: OwnerSupportTicketListItem[]) {
  return {
    all: tickets.length,
    awaitingDar: tickets.filter((t) => t.status === "awaiting_support").length,
    awaitingYou: tickets.filter((t) => t.status === "awaiting_customer").length,
    open: tickets.filter(
      (t) =>
        t.status === "open" ||
        t.status === "in_progress" ||
        t.status === "awaiting_support",
    ).length,
    resolved: tickets.filter(
      (t) => t.status === "resolved" || t.status === "closed",
    ).length,
  };
}

export default async function OwnerHelpCenterPage() {
  const { bookings, error, tickets } = await loadOwnerTickets();
  const counts = computeCounts(tickets);

  return (
    <OwnerShell active="Help Center">
      <div className="owner-dashboard-content">
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-5">
            <h2 className="owner-card-title text-red-700">
              Unable to load support tickets
            </h2>
            <p className="owner-body mt-2 text-red-600">{error}</p>
          </div>
        ) : (
          <OwnerHelpCenterContent bookings={bookings} counts={counts} tickets={tickets} />
        )}
      </div>
    </OwnerShell>
  );
}
