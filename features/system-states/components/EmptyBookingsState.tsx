import { EmptyStateCard } from "./EmptyStateCard";
import { BookingsEmptyIllustration } from "./StateIllustrations";

export function EmptyBookingsState() {
  return (
    <EmptyStateCard
      actions={[
        { href: "/search", label: "Find a stay" },
        { href: "/", label: "View recommendations", variant: "secondary" },
      ]}
      description="Your upcoming and past stays will appear here after booking."
      illustration={<BookingsEmptyIllustration />}
      title="No bookings yet."
    />
  );
}
