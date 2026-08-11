import { Star } from "lucide-react";
import { Card } from "@/features/design-system";

export default function OwnerReviewsPage() {
  return (
    <div className="owner-dashboard-content">
      <div className="px-7 pt-6 max-[600px]:px-4">
        <h1 className="owner-page-title">Reviews</h1>
        <p className="owner-page-description mt-2">View guest feedback across your properties.</p>
        <Card className="mt-5 flex min-h-64 flex-col items-center justify-center p-8 text-center">
          <div className="flex items-center justify-center gap-2 text-warning" aria-label="Review rating stars">
            {[1, 2, 3, 4, 5].map((star) => <Star key={star} aria-hidden="true" className="size-6 fill-current" strokeWidth={1.8} />)}
          </div>
          <h2 className="owner-section-title mt-5">Your public owner reviews</h2>
          <p className="owner-body mt-2 max-w-md text-[#59637d]">Guest feedback and ratings for your properties will appear here.</p>
          <div className="mt-6 w-full max-w-md border-t border-[var(--border)] pt-6">
            <h3 className="owner-card-title">No reviews yet</h3>
            <p className="owner-body mt-2 text-[#59637d]">Reviews will appear after guests complete their stays.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
