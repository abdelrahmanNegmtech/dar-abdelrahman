import { EmptyStateCard } from "./EmptyStateCard";
import { HeartEmptyIllustration } from "./StateIllustrations";

export function EmptySavedState() {
  return (
    <EmptyStateCard
      actions={[{ href: "/search", label: "Explore stays" }]}
      description="Tap the heart on any property to save it here."
      illustration={<HeartEmptyIllustration />}
      title="No saved stays yet."
    />
  );
}
