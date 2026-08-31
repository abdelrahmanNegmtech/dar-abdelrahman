import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { OwnerShell } from "@/components/owner/owner-shell";
import { getOwnerSupportTicketById } from "@/features/support/owner/owner-support-queries";
import { OwnerTicketDetailContent } from "@/features/support/owner/components/owner-ticket-detail-content";

type Props = {
  params: Promise<{ ticketId: string }>;
};

export const dynamic = "force-dynamic";

export default async function OwnerTicketDetailPage({ params }: Props) {
  const { ticketId } = await params;
  const ticket = await getOwnerSupportTicketById(ticketId);

  if (!ticket) {
    notFound();
  }

  return (
    <OwnerShell active="Help Center">
      <div className="owner-dashboard-content">
        <Link
          className="owner-button-text mb-4 inline-flex items-center gap-2 text-[#5631d8] hover:underline"
          href="/owner/help-center"
        >
          <ArrowLeft className="size-4" />
          Back to Help Center
        </Link>
        <OwnerTicketDetailContent ticket={ticket} />
      </div>
    </OwnerShell>
  );
}
