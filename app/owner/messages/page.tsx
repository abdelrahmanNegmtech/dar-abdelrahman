import { MessagesPage } from "@/features/traveler/components/MessagesPage";
import { getMessagingData } from "@/features/messaging/data/messaging-queries";
import { OwnerShell } from "@/components/owner/owner-shell";

export default async function OwnerMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ booking?: string; conversation?: string }>;
}) {
  const params = await searchParams;
  const data = await getMessagingData("owner", {
    bookingId: params.booking,
    selectedConversationId: params.conversation,
  });

  return (
    <OwnerShell active="Messages">
      <div className="owner-dashboard-content">
        <MessagesPage {...data} viewerRole="owner" />
      </div>
    </OwnerShell>
  );
}
