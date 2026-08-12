import { MessagesPage } from "@/features/traveler/components/MessagesPage";
import { getMessagesData } from "@/features/traveler/data/queries";

export default async function TravelerMessagesRoute({
  searchParams,
}: {
  searchParams: Promise<{ booking?: string; conversation?: string }>;
}) {
  const params = await searchParams;
  const data = await getMessagesData(params.conversation, params.booking);
  return <MessagesPage {...data} viewerRole="traveler" />;
}
