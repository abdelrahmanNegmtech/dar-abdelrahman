import Link from "next/link";
import { notFound } from "next/navigation";
import {
  OwnerDeferredNotice,
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

  async function submitAction() {
    "use server";

    await submitOwnerPropertyForReview(id);
  }

  return (
    <OwnerPropertyPageShell
      description="Review whether this listing is ready for moderation submission or publication. Submission is connected; owner publication remains intentionally deferred until a dedicated trusted workflow exists."
      title="Publish and submission"
    >
      <OwnerPropertyTabs propertyId={id} />
      <OwnerPropertySummaryCard summary={summary} />
      {summary.isApproved ? (
        <OwnerDeferredNotice title="Owner publication workflow intentionally deferred">
          The product docs allow owner-controlled publish and unpublish after approval, but the current Phase 10 backend still requires a dedicated trusted workflow for publication state transitions. This page remains informational until that narrow workflow is approved and implemented.
        </OwnerDeferredNotice>
      ) : (
        <section className="rounded-xl border border-[#e6ebf2] bg-white p-5 shadow-sm">
          <h2 className="owner-section-title">Submit this listing for review</h2>
          <p className="owner-body mt-2">
            The trusted submission RPC enforces ownership, eligible moderation states, required completeness checks, and keeps the listing unpublished while DAR reviews it.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <form action={submitAction}>
              <button className="owner-button-text rounded-lg bg-[#5824e6] px-4 py-2 text-white">
                Submit for review
              </button>
            </form>
            <Link href={`/owner/properties/${id}/edit`} className="owner-button-text rounded-lg border border-[#dbe2ee] px-4 py-2">
              Continue editing
            </Link>
          </div>
        </section>
      )}
    </OwnerPropertyPageShell>
  );
}
