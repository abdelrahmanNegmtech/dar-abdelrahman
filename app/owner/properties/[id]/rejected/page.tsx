import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  OwnerDeferredNotice,
  OwnerInfoGrid,
  OwnerPropertyPageShell,
  OwnerPropertySummaryCard,
  OwnerPropertyTabs,
} from "@/features/properties/components/owner-property-dashboard";
import { submitOwnerPropertyForReview } from "@/features/properties/data/owner-property-actions";
import { getOwnerPropertyById, getOwnerPropertySummary } from "@/features/properties/data/owner-property-queries";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [property, summary] = await Promise.all([
    getOwnerPropertyById(id),
    getOwnerPropertySummary(id),
  ]);

  if (!property || !summary) {
    notFound();
  }

  if (property.moderation_status !== "rejected") {
    redirect(`/owner/properties/${id}`);
  }

  async function resubmitAction() {
    "use server";

    await submitOwnerPropertyForReview(id);
  }

  return (
    <OwnerPropertyPageShell
      actions={(
        <form action={resubmitAction}>
          <button className="owner-button-text rounded-lg bg-[#5824e6] px-4 py-2 text-white">
            Resubmit for review
          </button>
        </form>
      )}
      description="Review the rejected listing state, make the allowed content edits, and resubmit through the trusted owner submission RPC."
      title="Rejected property"
    >
      <OwnerPropertyTabs propertyId={id} />
      <OwnerPropertySummaryCard
        summary={summary}
        extra={(
          <div className="flex flex-wrap gap-3">
            <Link href={`/owner/properties/${id}/edit`} className="owner-button-text rounded-lg border border-[#dbe2ee] px-4 py-2">
              Edit listing content
            </Link>
            <Link href={`/owner/properties/${id}/photos`} className="owner-button-text rounded-lg border border-[#dbe2ee] px-4 py-2">
              Update photos
            </Link>
          </div>
        )}
      />
      <OwnerDeferredNotice title="Owner-visible rejection detail currently limited">
        The current Phase 10 schema stores `rejected_at` and moderation state, but it does not yet include a dedicated owner-facing rejection-reason or reviewer-note column for properties. The owner can still correct editable content and resubmit through the trusted workflow.
      </OwnerDeferredNotice>
      <OwnerInfoGrid
        items={[
          { label: "Rejected at", value: property.rejected_at ?? "Recorded without timestamp" },
          { label: "Publication state", value: property.publication_status },
          { label: "Submitted for review", value: property.submitted_for_review_at ?? "Not recorded" },
          { label: "Editable owner fields", value: "Content, location, capacity, pricing, photos, availability" },
          { label: "Protected fields", value: "moderation_status, rejected_at, approved_at, owner_profile_id" },
          { label: "Resubmission path", value: "Trusted RPC only" },
        ]}
      />
    </OwnerPropertyPageShell>
  );
}
