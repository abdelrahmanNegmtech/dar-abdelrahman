import { SupportTicketDetailsPage } from "@/features/traveler/components/SupportTicketDetailsPage";
import { getSupportTicketData } from "@/features/traveler/data/queries";

export default async function TravelerSupportTicketRoute({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const { ticketId } = await params;
  const ticket = await getSupportTicketData(ticketId);
  return <SupportTicketDetailsPage ticket={ticket} />;
}
