import Link from "next/link";
import { MessageSquareQuote, Star } from "lucide-react";
import { OwnerShell } from "@/components/owner/owner-shell";
import { getOwnerReviewsData } from "@/features/reviews/data/review-queries";
import { ownerRoutes } from "@/lib/owner-routes";

function formatReviewDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function OwnerReviewsPage() {
  const data = await getOwnerReviewsData();

  return (
    <OwnerShell active="Reviews">
      <div className="owner-dashboard-page">
        <h1 className="owner-page-title">Reviews</h1>
        <p className="owner-page-description text-slate-500">See guest feedback across your properties.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="owner-helper text-slate-500">Average rating</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{data.averageRating.toFixed(1)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="owner-helper text-slate-500">Visible reviews</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{data.reviews.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="owner-helper text-slate-500">Submitted reviews</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{data.submittedCount}</p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2 text-amber-500">
            {Array.from({ length: 5 }).map((_, index) => <Star key={index} className="h-5 w-5 fill-current" />)}
          </div>
          <h2 className="owner-card-title mt-3">Your public owner reviews</h2>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Owner-response persistence remains deferred until a dedicated trusted workflow is introduced.
          </p>
          <Link className="owner-button-text mt-4 inline-flex rounded-lg border border-violet-600 px-4 py-2 text-violet-700" href={ownerRoutes.publicProfile()}>
            View public profile
          </Link>
        </div>

        {data.reviews.length ? (
          <div className="mt-6 space-y-4">
            {data.reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_4px_18px_rgba(25,33,60,.025)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-amber-500">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          className={`h-4 w-4 ${index < Math.round(review.rating) ? "fill-current" : ""}`}
                        />
                      ))}
                      <span className="ml-1 text-sm font-bold text-slate-900">{review.rating.toFixed(1)}</span>
                    </div>
                    <h3 className="mt-3 text-lg font-bold text-slate-900">{review.propertyTitle}</h3>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      {review.propertyCity} · {review.travelerName} · {formatReviewDate(review.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                      {review.status === "submitted" ? "Submitted" : "Pending"}
                    </span>
                    <Link
                      className="owner-button-text rounded-lg border border-slate-200 px-4 py-2 text-slate-700"
                      href={`/stays/${review.propertySlug}`}
                    >
                      View property
                    </Link>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-700">{review.comment || "The guest submitted a rating without additional written feedback."}</p>
                {review.ownerResponse ? (
                  <div className="mt-4 rounded-lg bg-violet-50 p-4 text-sm text-violet-900">
                    <div className="flex items-center gap-2 font-semibold">
                      <MessageSquareQuote className="h-4 w-4" />
                      Owner response
                    </div>
                    <p className="mt-2 leading-6">{review.ownerResponse}</p>
                  </div>
                ) : (
                  <div className="mt-4 rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                    No owner response has been published for this review yet.
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <h2 className="text-xl font-bold text-slate-900">No reviews yet</h2>
            <p className="mt-2 text-sm font-medium text-slate-500">Guest reviews will appear here after completed stays receive submitted feedback.</p>
          </div>
        )}
      </div>
    </OwnerShell>
  );
}
