import Link from "next/link";
import { Star } from "lucide-react";
import { OwnerShell } from "@/components/owner/owner-shell";
import { ownerRoutes } from "@/lib/owner-routes";

export default function OwnerReviewsPage() {
  return (
    <OwnerShell active="Reviews">
      <div className="owner-dashboard-page">
        <h1 className="owner-page-title">Reviews</h1>
        <p className="owner-page-description text-slate-500">See guest feedback across your properties.</p>
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2 text-amber-500">{Array.from({ length: 5 }).map((_, index) => <Star key={index} className="h-5 w-5 fill-current" />)}</div>
          <h2 className="owner-card-title mt-3">Your public owner reviews</h2>
          <Link className="owner-button-text mt-4 inline-flex rounded-lg border border-violet-600 px-4 py-2 text-violet-700" href={ownerRoutes.publicProfile()}>View public profile</Link>
        </div>
      </div>
    </OwnerShell>
  );
}
