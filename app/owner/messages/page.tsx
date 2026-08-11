import { MessageSquare } from "lucide-react";
import { Card } from "@/features/design-system";
import { ButtonLink } from "@/components/ui";

export default function OwnerMessagesPage() {
  return (
    <div className="owner-dashboard-content">
      <div className="px-7 pt-6 max-[600px]:px-4">
        <h1 className="owner-page-title">Messages</h1>
        <p className="owner-page-description mt-2">View and manage conversations with your guests and the DAR support team.</p>
        <Card className="mt-5 flex min-h-64 flex-col items-center justify-center p-8 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
            <MessageSquare aria-hidden="true" className="size-7" strokeWidth={1.8} />
          </span>
          <h2 className="owner-section-title mt-5">No conversations yet</h2>
          <p className="owner-body mt-2 max-w-md text-[#59637d]">New guest messages and DAR support conversations will appear here.</p>
          <ButtonLink href="/owner/bookings" size="sm" className="mt-6">Go to Booking Requests</ButtonLink>
        </Card>
      </div>
    </div>
  );
}
