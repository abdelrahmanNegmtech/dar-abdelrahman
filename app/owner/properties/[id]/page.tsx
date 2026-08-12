import Link from "next/link";
import { notFound } from "next/navigation";
import {
  OwnerInfoGrid,
  OwnerPropertyPageShell,
  OwnerPropertySummaryCard,
  OwnerPropertyTabs,
  formatOwnerDate,
} from "@/features/properties/components/owner-property-dashboard";
import { getOwnerPropertySummary } from "@/features/properties/data/owner-property-queries";

export default async function OwnerPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const summary = await getOwnerPropertySummary(id);

  if (!summary) {
    notFound();
  }

  return (
    <OwnerPropertyPageShell
      description="Review the current owner-scoped listing data and move into editing, availability, pricing, or submission."
      title="Property overview"
    >
      <OwnerPropertyTabs propertyId={id} />
      <OwnerPropertySummaryCard
        summary={summary}
        extra={(
          <div className="flex flex-wrap gap-3">
            <Link href={`/owner/properties/${id}/edit`} className="owner-button-text rounded-lg bg-[#5824e6] px-4 py-2 text-white">
              Edit property
            </Link>
            <Link href={`/owner/properties/${id}/calendar-management`} className="owner-button-text rounded-lg border border-[#dbe2ee] px-4 py-2">
              Manage calendar
            </Link>
            <Link href={`/owner/properties/${id}/photos`} className="owner-button-text rounded-lg border border-[#dbe2ee] px-4 py-2">
              Manage photos
            </Link>
          </div>
        )}
      />
      <OwnerInfoGrid
        items={[
          { label: "Moderation state", value: summary.moderationStatus },
          { label: "Publication state", value: summary.publicationStatus },
          { label: "Submitted for review", value: formatOwnerDate(summary.submittedForReviewAt) },
          { label: "Property type", value: summary.propertyType },
          { label: "Minimum nights", value: summary.minimumNights },
          { label: "Maximum nights", value: summary.maximumNights ?? "No maximum" },
          { label: "Instant book", value: summary.instantBookEnabled ? "Enabled" : "Disabled" },
          { label: "Photos", value: summary.photoCount },
        ]}
      />
    </OwnerPropertyPageShell>
  );
}
