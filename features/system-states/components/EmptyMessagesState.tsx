import { EmptyStateCard } from "./EmptyStateCard";
import { MessagesEmptyIllustration } from "./StateIllustrations";

export function EmptyMessagesState() {
  return (
    <EmptyStateCard
      actions={[{ label: "Open support" }]}
      description="Choose a booking or owner conversation to start chatting."
      illustration={<MessagesEmptyIllustration />}
      title="No conversation selected."
    />
  );
}
